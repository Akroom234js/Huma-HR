<?php

namespace App\Services;

use App\Models\AttendanceRecord;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\EmployeeRequest;
use App\Models\PayrollDeduction;
use App\Models\PayrollRecord;
use Carbon\Carbon;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;

class ReportService
{
    private const CACHE_MINUTES = 15;

    // ══════════════════════════════════════════════════════════════
    // 1) Payroll Report
    // ══════════════════════════════════════════════════════════════
    public function payrollReport(int $month, int $year): array
    {
        return Cache::remember("report:payroll:{$month}-{$year}", now()->addMinutes(self::CACHE_MINUTES), function () use ($month, $year) {
            $records = PayrollRecord::where('payroll_month', $month)
                ->where('payroll_year', $year)
                ->get();

            $totalNetSalary = $records->sum('final_net_salary');
            $count = $records->count();
            $totalOvertimeAmount = $records->sum('overtime_amount');
            $totalDeductions = PayrollDeduction::whereIn('payroll_record_id', $records->pluck('id'))
                ->sum('amount');

            // ── new hires cost: رواتب الموظفين اللي بدأوا هالشهر (من بيانات حقيقية start_date) ──
            $newHiresCost = EmployeeProfile::whereMonth('start_date', $month)
                ->whereYear('start_date', $year)
                ->sum('salary');

            // ── yoy growth: من payroll_records فعلياً، مقارنة نفس الشهر بالسنة اللي قبل ──
            $lastYearTotal = PayrollRecord::where('payroll_month', $month)
                ->where('payroll_year', $year - 1)
                ->sum('final_net_salary');

            $yoyGrowth = $lastYearTotal > 0
                ? round((($totalNetSalary - $lastYearTotal) / $lastYearTotal) * 100, 1)
                : null; // null = لا توجد بيانات سنة سابقة للمقارنة، وليس صفر

            // ── توزيع حسب الأقسام ──
            $departments = PayrollRecord::query()
                ->join('users', 'users.id', '=', 'payroll_records.user_id')
                ->join('employee_profiles', 'employee_profiles.user_id', '=', 'users.id')
                ->join('departments', 'departments.id', '=', 'employee_profiles.department_id')
                ->where('payroll_records.payroll_month', $month)
                ->where('payroll_records.payroll_year', $year)
                ->select('departments.name as name')
                ->selectRaw('SUM(payroll_records.final_net_salary) as total')
                ->selectRaw('COUNT(DISTINCT employee_profiles.id) as headcount')
                ->groupBy('departments.name')
                ->get()
                ->map(fn ($d) => [
                    'name'      => $d->name,
                    'total'     => (float)$d->total,
                    'headcount' => (int)$d->headcount,
                    'avg'       => $d->headcount > 0 ? round($d->total / $d->headcount, 2) : 0,
                ]);

            return [
                'overview' => [
                    'total_monthly_salary'    => (float)$totalNetSalary,
                    'avg_salary_per_employee' => $count > 0 ? round($totalNetSalary / $count, 2) : 0,
                    'total_overtime'          => (float)$totalOvertimeAmount,
                    'total_deductions'        => (float)$totalDeductions,
                ],
                'indicators' => [
                    // ⚠️ payroll_revenue_ratio و benefit_cost_per_employee محذوفتين:
                    // لا يوجد جدول إيرادات (revenue) أو مزايا (benefits) حالياً بقاعدة البيانات.
                    // عرض رقم هون رح يكون بيانات مُلفّقة — نفس مبدأ قرار Diversity.
                    'new_hires_cost' => (float)$newHiresCost,
                    'yoy_growth'     => $yoyGrowth !== null ? "{$yoyGrowth}%" : 'لا تتوفر بيانات مقارنة',
                ],
                'departments' => $departments,
            ];
        });
    }

    // ══════════════════════════════════════════════════════════════
    // 2) Leaves Report
    // ══════════════════════════════════════════════════════════════
    public function leavesReport(int $month, int $year): array
    {
        return Cache::remember("report:leaves:{$month}-{$year}", now()->addMinutes(self::CACHE_MINUTES), function () use ($month, $year) {
            $requests = EmployeeRequest::whereNotNull('details->leave_type_id')
                ->whereMonth('created_at', $month)
                ->whereYear('created_at', $year)
                ->get();

            $total = $requests->count();
            $approved = $requests->where('status', 'approved')->count();
            $pending = $requests->where('status', 'pending')->count();
            $rejected = $requests->where('status', 'rejected')->count();

            $pct = fn ($n) => $total > 0 ? round(($n / $total) * 100, 1) . '%' : '0%';

            // ── تصنيف حسب نوع الإجازة (PHP grouping بدل SQL JSON خام، لنفس فلسفة الكود الموجود) ──
            $byType = $requests->groupBy(fn ($r) => $r->details['leave_type_name'] ?? 'Other')
                ->map(fn ($group, $type) => [
                    'type'       => $type,
                    'count'      => $group->count(),
                    'percentage' => $total > 0 ? round(($group->count() / $total) * 100, 1) . '%' : '0%',
                ])
                ->values();

            // ── متوسط المدة: من الأعمدة الحقيقية start_date/end_date ──
            $approvedWithDates = EmployeeRequest::whereNotNull('details->leave_type_id')
                ->where('status', 'approved')
                ->whereMonth('start_date', $month)
                ->whereYear('start_date', $year)
                ->whereNotNull('end_date')
                ->selectRaw('AVG(DATEDIFF(end_date, start_date) + 1) as avg_days')
                ->value('avg_days');

            // ── أكثر الموظفين طلباً للإجازة (بالأيام) ──
            $topEmployees = EmployeeRequest::whereNotNull('details->leave_type_id')
                ->where('status', 'approved')
                ->whereMonth('start_date', $month)
                ->whereYear('start_date', $year)
                ->whereNotNull('start_date')
                ->whereNotNull('end_date')
                ->with('employeeProfile')
                ->get()
                ->groupBy('employee_profile_id')
                ->map(function ($group) {
                    $profile = $group->first()->employeeProfile;
                    $days = $group->sum(fn ($r) => Carbon::parse($r->start_date)->diffInDays(Carbon::parse($r->end_date)) + 1);
                    return ['name' => $profile?->full_name ?? 'Unknown', 'days' => $days];
                })
                ->sortByDesc('days')
                ->take(5)
                ->values();

            return [
                'summary' => [
                    'total_submitted' => $total,
                    'approved'        => $approved,
                    'pending'         => $pending,
                    'rejected'        => $rejected,
                ],
                'status_percentages' => [
                    'approved_pct' => $pct($approved),
                    'pending_pct'  => $pct($pending),
                    'rejected_pct' => $pct($rejected),
                ],
                'breakdown_by_type' => $byType,
                'key_indicators'    => [
                    'avg_duration_days' => round($approvedWithDates ?? 0, 1),
                    'approval_rate'     => $pct($approved),
                ],
                'top_employees' => $topEmployees,
            ];
        });
    }

    // ══════════════════════════════════════════════════════════════
    // 3) Attendance Report
    // ══════════════════════════════════════════════════════════════
    public function attendanceReport(int $month, int $year): array
    {
        return Cache::remember("report:attendance:{$month}-{$year}", now()->addMinutes(self::CACHE_MINUTES), function () use ($month, $year) {
            $present = AttendanceRecord::whereIn('status', ['present', 'late', 'half_day'])
                ->whereMonth('date', $month)->whereYear('date', $year)->count();

            $absent = AttendanceRecord::where('status', 'absent')
                ->whereMonth('date', $month)->whereYear('date', $year)->count();

            $late = AttendanceRecord::where('status', 'late')
                ->whereMonth('date', $month)->whereYear('date', $year)->count();

            $avgHoursWorked = AttendanceRecord::whereMonth('date', $month)->whereYear('date', $year)
                ->avg('hours_worked');

            // ── الأوفرتايم: مصدر واحد فقط = payroll_records (راجع قرار المشكلة 6) ──
            $totalOvertimeHours = PayrollRecord::where('payroll_month', $month)
                ->where('payroll_year', $year)
                ->sum('overtime_hours');

            // ── توزيع الغياب حسب نوع الإجازة المعتمدة بنفس الفترة ──
            $absenceBreakdown = EmployeeRequest::whereNotNull('details->leave_type_id')
                ->where('status', 'approved')
                ->whereMonth('start_date', $month)->whereYear('start_date', $year)
                ->get()
                ->groupBy(fn ($r) => $r->details['leave_type_name'] ?? 'Other')
                ->map(fn ($g, $type) => ['type' => $type, 'count' => $g->count()])
                ->values();

            $absenceBreakdownTotal = $absenceBreakdown->sum('count');
            $absenceBreakdown = $absenceBreakdown->map(function ($item) use ($absenceBreakdownTotal) {
                $item['percentage'] = $absenceBreakdownTotal > 0
                    ? round(($item['count'] / $absenceBreakdownTotal) * 100) . '%'
                    : '0%';
                return $item;
            });

            $totalRecords = $present + $absent;
            $complianceRate = $totalRecords > 0 ? round(($present / $totalRecords) * 100, 1) . '%' : 'N/A';

            $absenceFrequency = AttendanceRecord::where('status', 'absent')
                ->whereMonth('date', $month)->whereYear('date', $year)
                ->distinct('employee_profile_id')
                ->count('employee_profile_id');

            // ── الأقسام الأعلى بالأوفرتايم (من payroll_records، نفس منطق تقرير الرواتب) ──
            $departmentsHighOvertime = PayrollRecord::query()
                ->join('users', 'users.id', '=', 'payroll_records.user_id')
                ->join('employee_profiles', 'employee_profiles.user_id', '=', 'users.id')
                ->join('departments', 'departments.id', '=', 'employee_profiles.department_id')
                ->where('payroll_records.payroll_month', $month)
                ->where('payroll_records.payroll_year', $year)
                ->select('departments.name as department')
                ->selectRaw('SUM(payroll_records.overtime_hours) as hours')
                ->groupBy('departments.name')
                ->orderByDesc('hours')
                ->limit(5)
                ->get();

            return [
                'overview' => [
                    'present' => $present,
                    'absent'  => $absent,
                    'late'    => $late,
                ],
                'time_tracking' => [
                    'avg_hours_worked'     => round($avgHoursWorked ?? 0, 1),
                    'total_overtime_hours' => (float)$totalOvertimeHours,
                ],
                'absence_breakdown'         => $absenceBreakdown,
                'compliance_rate'           => $complianceRate,
                'absence_frequency'         => $absenceFrequency,
                'departments_high_overtime' => $departmentsHighOvertime,
                // ⚠️ قيد معروف وموّثق (راجع قرار المشكلة 4):
                // absent محسوب فقط من سجلات attendance_records الموجودة فعلياً،
                // ولا يوجد Job حالياً ينشئ سجل absent تلقائي لموظف لم يسجل حضور أصلاً.
                // خطة مستقبلية موّثقة لبناء Job + GitHub Actions cron.
                'data_notes' => [
                    'absent_calculation' => 'Based on existing attendance_records only. No automated daily absence-marking job yet.',
                ],
            ];
        });
    }

    // ══════════════════════════════════════════════════════════════
    // 4) Employees Report
    // ══════════════════════════════════════════════════════════════
    public function employeesReport(int $month, int $year): array
    {
        return Cache::remember("report:employees:{$month}-{$year}", now()->addMinutes(self::CACHE_MINUTES), function () use ($month, $year) {
            $totalEmployees = EmployeeProfile::where('employment_status', '!=', 'terminated')->count();

            $newHires = EmployeeProfile::whereMonth('start_date', $month)
                ->whereYear('start_date', $year)->count();

            $employeesLeft = EmployeeProfile::whereNotNull('resignation_date')
                ->whereMonth('resignation_date', $month)
                ->whereYear('resignation_date', $year)->count();

            $stabilityRate = $totalEmployees > 0
                ? round((($totalEmployees - $employeesLeft) / $totalEmployees) * 100, 1) . '%'
                : 'N/A';

            // ── دوران آخر 6 أشهر ──
            $turnover = [];
            for ($i = 5; $i >= 0; $i--) {
                $date = Carbon::create($year, $month, 1)->subMonths($i);
                $hires = EmployeeProfile::whereMonth('start_date', $date->month)
                    ->whereYear('start_date', $date->year)->count();
                $left = EmployeeProfile::whereNotNull('resignation_date')
                    ->whereMonth('resignation_date', $date->month)
                    ->whereYear('resignation_date', $date->year)->count();
                $turnover[] = ['month' => $date->format('M'), 'hires' => $hires, 'left' => $left];
            }

            // ── مستوى الخبرة: محسوب من سنوات الأقدمية (tenure)، وليس من عمود grade ──
            // السبب: عمود grade نص حر غير موحّد الصيغة، الاعتماد عليه غير مضمون.
            // الأقدمية (start_date) بيانات حقيقية ومضمونة الوجود لكل موظف نشط.
            $activeProfiles = EmployeeProfile::where('employment_status', '!=', 'terminated')
                ->whereNotNull('start_date')->get();

            $experienceLevels = ['Junior' => 0, 'Mid-level' => 0, 'Senior' => 0];
            $tenureBuckets = ['<1 yr' => 0, '1-3 yrs' => 0, '3-5 yrs' => 0, '5+ yrs' => 0];
            $totalTenureYears = 0;

            foreach ($activeProfiles as $profile) {
                $years = Carbon::parse($profile->start_date)->diffInYears(now());
                $totalTenureYears += $years;

                if ($years < 2) $experienceLevels['Junior']++;
                elseif ($years <= 5) $experienceLevels['Mid-level']++;
                else $experienceLevels['Senior']++;

                if ($years < 1) $tenureBuckets['<1 yr']++;
                elseif ($years < 3) $tenureBuckets['1-3 yrs']++;
                elseif ($years < 5) $tenureBuckets['3-5 yrs']++;
                else $tenureBuckets['5+ yrs']++;
            }

            $activeCount = $activeProfiles->count();

            $experienceLevelsFormatted = collect($experienceLevels)->map(fn ($count, $level) => [
                'level'      => $level,
                'percentage' => $activeCount > 0 ? round(($count / $activeCount) * 100) : 0,
            ])->values();

            $tenureDistribution = collect($tenureBuckets)->map(fn ($count, $range) => [
                'range' => $range,
                'count' => $count,
            ])->values();

            $avgTenureYears = $activeCount > 0 ? round($totalTenureYears / $activeCount, 1) : 0;
            $seniorityRatio = $activeCount > 0
                ? round(($experienceLevels['Senior'] / $activeCount) * 100) . '%'
                : '0%';

            // ── Diversity: avg_age فقط (قرار نهائي — راجع المشكلة 1) ──
            $avgAge = EmployeeProfile::whereNotNull('date_of_birth')
                ->where('employment_status', '!=', 'terminated')
                ->get()
                ->avg(fn ($e) => Carbon::parse($e->date_of_birth)->age);

            return [
                'summary' => [
                    'total_employees' => $totalEmployees,
                    'new_hires'       => $newHires,
                    'employees_left'  => $employeesLeft,
                    'stability_rate'  => $stabilityRate,
                ],
                'turnover'            => $turnover,
                'experience_levels'   => $experienceLevelsFormatted,
                'tenure_distribution' => $tenureDistribution,
                'diversity'           => [
                    'avg_age' => round($avgAge ?? 0, 1),
                    // ⚠️ gender/nationality محذوفتين نهائياً — الحقول غير موجودة بقاعدة البيانات (قرار المشكلة 1)
                ],
                'avg_tenure_years'    => $avgTenureYears,
                'seniority_ratio'     => $seniorityRatio,
            ];
        });
    }
}
