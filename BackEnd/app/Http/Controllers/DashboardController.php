<?php

namespace App\Http\Controllers;

use App\Models\EmployeeProfile;
use App\Models\PerformanceEvaluation;
use App\Models\EmployeeRequest;
use App\Models\AttendanceRecord;
use App\Models\PayrollRecord;
use App\Models\PerformanceCycle;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    use ApiResponse;

    public function generalStats(): JsonResponse
    {
        // 1. Total Employees & New This Month
        $totalEmployees = EmployeeProfile::where("employment_status", "active")->count();
        $newEmployeesThisMonth = EmployeeProfile::where("employment_status", "active")
            ->whereMonth("hire_date", Carbon::now()->month)
            ->whereYear("hire_date", Carbon::now()->year)
            ->count();

        // 2. Performance Rate & Average Performance Rating
        $currentYear = Carbon::now()->year;
        $currentQuarter = Carbon::now()->quarter;

        $avgPerformanceRating = PerformanceEvaluation::where("status", "evaluated")
            ->avg("final_score");
        $avgPerformanceRating = $avgPerformanceRating ? round($avgPerformanceRating, 2) : 0.0;

        // Calculate change from last quarter
        $lastQuarter = $currentQuarter - 1;
        $lastQuarterYear = $currentYear;
        if ($lastQuarter === 0) {
            $lastQuarter = 4;
            $lastQuarterYear--;
        }

        $lastQuarterAvgPerformanceRating = PerformanceEvaluation::where("status", "evaluated")
            ->whereHas("performanceCycle", function ($query) use ($lastQuarter, $lastQuarterYear) {
                $query->whereYear("start_date", $lastQuarterYear)
                    ->whereRaw("QUARTER(start_date) = ?", [$lastQuarter]);
            })
            ->avg("final_score");
        $lastQuarterAvgPerformanceRating = $lastQuarterAvgPerformanceRating ? round($lastQuarterAvgPerformanceRating, 2) : 0.0;

        $performanceRatingChange = round($avgPerformanceRating - $lastQuarterAvgPerformanceRating, 2);
        $performanceRatingStatus = $performanceRatingChange >= 0 ? "Up" : "Down";

        // Simplified Performance Rate (e.g., based on average score out of 5, converted to percentage)
        $performanceRate = round(($avgPerformanceRating / 5.0) * 100); // Assuming max score is 5.0
        $performanceRateStatus = "Normal";
        if ($performanceRate > 90) $performanceRateStatus = "High";
        elseif ($performanceRate < 70) $performanceRateStatus = "Low";

        // 3. Employees on Leave Today & This Month
        $today = Carbon::today();
        $employeesOnLeaveToday = EmployeeRequest::where("status", "approved")
            ->where("type", "like", "%leave%") // Assuming leave requests contain \'leave\' in type
            ->where(function ($query) use ($today) {
                $query->whereDate(DB::raw("JSON_UNQUOTE(JSON_EXTRACT(details, \'$.start_date\'))"), "<=", $today)
                    ->whereDate(DB::raw("DATE_ADD(JSON_UNQUOTE(JSON_EXTRACT(details, \'$.start_date\')), INTERVAL JSON_UNQUOTE(JSON_EXTRACT(details, \'$.duration\')) - 1 DAY)"), ">=", $today);
            })
            ->get();

        $sickLeaveToday = $employeesOnLeaveToday->where("type", "sick leave")->count();
        $annualLeaveToday = $employeesOnLeaveToday->where("type", "annual leave")->count();

        $employeesOnLeaveThisMonth = EmployeeRequest::where("status", "approved")
            ->where("type", "like", "%leave%")
            ->whereMonth("created_at", Carbon::now()->month)
            ->whereYear("created_at", Carbon::now()->year)
            ->count();

        // 4. Overtime Hours & Change from Last Month
        $currentMonthOvertimeHours = PayrollRecord::whereMonth("payroll_month", Carbon::now()->month)
            ->whereYear("payroll_year", Carbon::now()->year)
            ->sum("overtime_hours");

        $lastMonth = Carbon::now()->subMonth();
        $lastMonthOvertimeHours = PayrollRecord::whereMonth("payroll_month", $lastMonth->month)
            ->whereYear("payroll_year", $lastMonth->year)
            ->sum("overtime_hours");

        $overtimeChangePercent = 0;
        if ($lastMonthOvertimeHours > 0) {
            $overtimeChangePercent = round((($currentMonthOvertimeHours - $lastMonthOvertimeHours) / $lastMonthOvertimeHours) * 100);
        }

        // 5. Monthly Salary Cost
        $monthlySalaryCost = PayrollRecord::whereMonth("payroll_month", Carbon::now()->month)
            ->whereYear("payroll_year", Carbon::now()->year)
            ->sum("final_net_salary");

        // 6. Employees Late Today
        $employeesLateToday = AttendanceRecord::whereDate("date", $today)
            ->where("status", "late")
            ->count();
        $employeesLateStatus = $employeesLateToday > 0 ? "Higher than usual" : "Normal"; // Simplified logic

        // 7. Month-over-month Comparison for Graph
        $dataComparison = [];
        $months = [
            Carbon::now()->subMonth()->format("Y-m"),
            Carbon::now()->format("Y-m"),
        ];

        foreach (["Attendance", "Productivity", "Job Satisfaction"] as $metric) {
            $lastMonthValue = 0;
            $thisMonthValue = 0;

            if ($metric === "Attendance") {
                // Simplified: Percentage of active employees who checked in
                $lastMonthAttendanceRecords = AttendanceRecord::whereYear("date", $lastMonth->year)
                    ->whereMonth("date", $lastMonth->month)
                    ->whereNotNull("check_in")
                    ->count();
                $lastMonthActiveEmployees = EmployeeProfile::where("employment_status", "active")->count();
                $lastMonthValue = $lastMonthActiveEmployees > 0 ? round(($lastMonthAttendanceRecords / ($lastMonthActiveEmployees * $lastMonth->daysInMonth)) * 100) : 0;

                $thisMonthAttendanceRecords = AttendanceRecord::whereYear("date", Carbon::now()->year)
                    ->whereMonth("date", Carbon::now()->month)
                    ->whereNotNull("check_in")
                    ->count();
                $thisMonthActiveEmployees = EmployeeProfile::where("employment_status", "active")->count();
                $thisMonthValue = $thisMonthActiveEmployees > 0 ? round(($thisMonthAttendanceRecords / ($thisMonthActiveEmployees * Carbon::now()->day)) * 100) : 0; // Up to current day

            } elseif ($metric === "Productivity") {
                // Simplified: Average task score from performance evaluations
                $lastMonthProductivity = PerformanceEvaluation::where("status", "evaluated")
                    ->whereHas("performanceCycle", function ($query) use ($lastMonth) {
                        $query->whereMonth("start_date", $lastMonth->month)
                            ->whereYear("start_date", $lastMonth->year);
                    })
                    ->avg("tasks_score");
                $lastMonthValue = $lastMonthProductivity ? round($lastMonthProductivity * 100 / 5) : 0; // Assuming max task score is 5

                $thisMonthProductivity = PerformanceEvaluation::where("status", "evaluated")
                    ->whereHas("performanceCycle", function ($query) use ($currentYear) {
                        $query->whereMonth("start_date", Carbon::now()->month)
                            ->whereYear("start_date", $currentYear);
                    })
                    ->avg("tasks_score");
                $thisMonthValue = $thisMonthProductivity ? round($thisMonthProductivity * 100 / 5) : 0;

            } elseif ($metric === "Job Satisfaction") {
                // Placeholder as no direct model exists. In a real scenario, this would come from surveys.
                $lastMonthValue = 55; // Example hardcoded value
                $thisMonthValue = 60; // Example hardcoded value
            }

            $dataComparison[] = [
                "name" => $metric,
                "LastMonth" => (string)$lastMonthValue,
                "ThisMonth" => (string)$thisMonthValue,
            ];
        }

        return $this->successResponse([
            "total_employees" => [
                "total" => $totalEmployees,
                "new_this_month" => $newEmployeesThisMonth,
            ],
            "performance_rate" => [
                "rate" => $performanceRate,
                "status" => $performanceRateStatus,
            ],
            "employees_on_leave_today" => [
                "total" => $employeesOnLeaveToday->count(),
                "sick" => $sickLeaveToday,
                "annual" => $annualLeaveToday,
            ],
            "overtime_hours" => [
                "total" => round($currentMonthOvertimeHours, 2),
                "change_from_last_month_percent" => $overtimeChangePercent,
            ],
            "monthly_salary_cost" => [
                "amount" => round($monthlySalaryCost, 2),
                "currency" => "$",
                "approx" => true,
            ],
            "employees_on_leave_this_month" => [
                "total" => $employeesOnLeaveThisMonth,
            ],
            "employees_late_today" => [
                "total" => $employeesLateToday,
                "status" => $employeesLateStatus,
            ],
            "average_performance_rating" => [
                "rating" => $avgPerformanceRating,
                "max_rating" => 5.0,
                "change_from_last_quarter" => $performanceRatingChange,
                "status" => $performanceRatingStatus,
            ],
            "month_over_month_comparison" => $dataComparison,
        ], "General dashboard stats retrieved successfully.");
    }
}
