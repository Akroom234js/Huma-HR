<?php

namespace App\Http\Controllers;

use App\Models\PayrollRecord;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class PayrollController extends Controller
{
    use ApiResponse;

    // GET /api/payroll
    public function index(Request $request): JsonResponse
    {
        $month = $request->month;
        $year = $request->year;

        if ($month && !is_numeric($month)) {
            $monthYear = explode(' ', $month);
            $monthName = $monthYear[0];
            $year = $monthYear[1] ?? now()->year;

            $monthMap = [
                'January' => 1, 'February' => 2, 'March' => 3, 'April' => 4,
                'May' => 5, 'June' => 6, 'July' => 7, 'August' => 8,
                'September' => 9, 'October' => 10, 'November' => 11, 'December' => 12
            ];
            $month = $monthMap[$monthName] ?? null;
        }

        $payroll = PayrollRecord::with([
                'user.employeeProfile.department', 
                'deductions', 
                'processor.employeeProfile'
            ])
            ->when($month, function ($q) use ($month) {
                return $q->where('payroll_month', $month);
            })
            ->when($year, function ($q) use ($year) {
                return $q->where('payroll_year', $year);
            })
            ->when($request->filled('department_id'), function ($q) use ($request) {
                return $q->whereHas('user.employeeProfile', function ($sq) use ($request) {
                    $sq->where('department_id', $request->department_id);
                });
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                return $q->whereHas('user.employeeProfile', function ($sq) use ($request) {
                    $sq->where('full_name', 'like', "%{$request->search}%");
                });
            })
            ->get();

        return $this->successResponse($payroll, 'Payroll retrieved successfully.');
    }

    // PATCH /api/payroll/{id}/pay
    public function pay(int $id): JsonResponse
    {
        $payroll = PayrollRecord::find($id);
        if (!$payroll) {
            return $this->errorResponse('Payroll record not found.', 404);
        }

        if ($payroll->status === 'paid') {
            return $this->errorResponse('Payroll already paid.', 400);
        }

        $payroll->update([
            'status'  => 'paid',
            'paid_date' => now(),
            'processed_by_id' => Auth::id(),
        ]);

        return $this->successResponse($payroll, 'Payroll marked as paid.');
    }

    // POST /api/payroll/pay-all
    public function payAll(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        
        $updated = PayrollRecord::whereIn('id', $ids)
            ->where('status', 'unpaid')
            ->update([
                'status'  => 'paid',
                'paid_date' => now(),
                'processed_by_id' => Auth::id(),
            ]);

        return $this->successResponse(['updated_count' => $updated], 'Selected payroll records marked as paid.');
    }

    // GET /api/payroll/overview
    public function overview(): JsonResponse
    {
        $totalMonthlyPayroll = PayrollRecord::where('status', 'paid')
            ->sum('final_net_salary');

        $totalEmployeesPaid = PayrollRecord::where('status', 'paid')->count();
        $totalEmployees = PayrollRecord::count();

        $avgSalary = $totalEmployeesPaid > 0 ? $totalMonthlyPayroll / $totalEmployeesPaid : 0;

        $departmentDistribution = \App\Models\PayrollRecord::where('status', 'paid')
            ->with('user.employeeProfile.department')
            ->get()
            ->groupBy(function ($record) {
                return $record->user?->employeeProfile?->department?->name ?? 'Other';
            })
            ->map(function ($group, $deptName) {
                $total = $group->sum('final_net_salary');
                return [
                    'name' => $deptName,
                    'totalPayroll' => $total,
                    'averageSalary' => $group->count() > 0 ? $total / $group->count() : 0,
                    'employees' => $group->count(),
                ];
            })
            ->values();

        // Calculate percentages
        $grandTotal = $departmentDistribution->sum('totalPayroll');
        $departmentDistribution = $departmentDistribution->map(function ($item) use ($grandTotal) {
            $item['ofTotal'] = $grandTotal > 0 ? round(($item['totalPayroll'] / $grandTotal) * 100, 1) . '%' : '0%';
            // Convert to format required for chart
            $item['value'] = $grandTotal > 0 ? round(($item['totalPayroll'] / $grandTotal) * 100, 1) : 0;
            return $item;
        });

        return $this->successResponse([
            'totalMonthlyPayroll' => $totalMonthlyPayroll,
            'totalEmployeesPaid' => $totalEmployeesPaid,
            'totalEmployees' => $totalEmployees,
            'avgSalary' => $avgSalary,
            'departmentDistribution' => $departmentDistribution
        ], 'Payroll overview retrieved successfully.');
    }

    // POST /api/payroll/initialize
    public function initialize(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'required|string', // e.g. "April 2026"
        ]);

        $monthYear = explode(' ', $request->month);
        $monthName = $monthYear[0];
        $year = $monthYear[1] ?? now()->year;

        // Map month name to integer
        $monthMap = [
            'January' => 1, 'February' => 2, 'March' => 3, 'April' => 4,
            'May' => 5, 'June' => 6, 'July' => 7, 'August' => 8,
            'September' => 9, 'October' => 10, 'November' => 11, 'December' => 12
        ];

        $monthInt = $monthMap[$monthName] ?? now()->month;

        $activeEmployees = \App\Models\EmployeeProfile::where('employment_status', 'active')->get();
        $createdCount = 0;

        foreach ($activeEmployees as $profile) {
            $exists = PayrollRecord::where('user_id', $profile->user_id)
                ->where('payroll_month', $monthInt)
                ->where('payroll_year', $year)
                ->exists();

            if (!$exists) {
                $payroll = PayrollRecord::create([
                    'user_id' => $profile->user_id,
                    'payroll_month' => $monthInt,
                    'payroll_year' => $year,
                    'basic_salary' => $profile->salary ?? 0,
                    'allowances_amount' => $profile->allowances ?? 0,
                    'final_net_salary' => ($profile->salary ?? 0) + ($profile->allowances ?? 0),
                    'status' => 'unpaid',
                ]);

                // Auto-apply Tax if present
                if ($profile->tax_percent > 0) {
                    $taxAmount = ($profile->salary * $profile->tax_percent) / 100;
                    PayrollDeduction::create([
                        'payroll_record_id' => $payroll->id,
                        'deduction_type' => 'tax',
                        'amount' => $taxAmount,
                        'reason' => "Automatic Tax ({$profile->tax_percent}%)",
                        'applied_by' => 'System',
                        'applied_date' => now(),
                    ]);
                }

                // Auto-apply Insurance if present
                if ($profile->insurance_amount > 0) {
                    PayrollDeduction::create([
                        'payroll_record_id' => $payroll->id,
                        'deduction_type' => 'insurance',
                        'amount' => $profile->insurance_amount,
                        'reason' => "Automatic Insurance",
                        'applied_by' => 'System',
                        'applied_date' => now(),
                    ]);
                }

                // Update final net salary after auto-deductions
                $payroll->final_net_salary = $payroll->basic_salary + $payroll->allowances_amount + $payroll->overtime_amount - $payroll->deductions()->sum('amount');
                $payroll->save();

                $createdCount++;
            }
        }

        return $this->successResponse(['created_count' => $createdCount], "Payroll initialized for $createdCount employees.");
    }

    // GET /api/employee/payroll
    public function employeeHistory(): JsonResponse
    {
        $userId = Auth::id();
        $history = PayrollRecord::with(['deductions'])
            ->where('user_id', $userId)
            ->orderBy('payroll_year', 'desc')
            ->orderBy('payroll_month', 'desc')
            ->get();

        return $this->successResponse($history, 'Payroll history retrieved successfully.');
    }
}
