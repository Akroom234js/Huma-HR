<?php

namespace App\Http\Controllers;

use App\Models\PayrollRecord;
use App\Models\PayrollDeduction;
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

    public function overview(Request $request): JsonResponse
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

        $query = PayrollRecord::query()
            ->when($month, function ($q) use ($month) {
                return $q->where('payroll_month', $month);
            })
            ->when($year, function ($q) use ($year) {
                return $q->where('payroll_year', $year);
            });

        $totalMonthlyPayroll = (clone $query)->where('status', 'paid')
            ->sum('final_net_salary');

        $totalPaid = (clone $query)->where('status', 'paid')->count();
        $totalUnpaid = (clone $query)->where('status', 'unpaid')->count();
        $totalRecords = (clone $query)->count();

        $avgSalary = $totalPaid > 0 ? $totalMonthlyPayroll / $totalPaid : 0;

        $paidRecords = (clone $query)->with('user.employeeProfile.department')
            ->where('status', 'paid')
            ->get();
            
        $departments = [];
        
        foreach ($paidRecords as $record) {
            $deptName = optional(optional(optional($record->user)->employeeProfile)->department)->name ?? 'Other';
            
            if (!isset($departments[$deptName])) {
                $departments[$deptName] = [
                    'name' => $deptName,
                    'total_payroll' => 0,
                    'employee_count' => 0,
                ];
            }
            
            $departments[$deptName]['total_payroll'] += $record->final_net_salary;
            $departments[$deptName]['employee_count']++;
        }
        
        $departmentDistribution = [];
        foreach ($departments as $dept) {
            $deptAvg = $dept['employee_count'] > 0 ? $dept['total_payroll'] / $dept['employee_count'] : 0;
            $deptPercentage = $totalMonthlyPayroll > 0 ? round(($dept['total_payroll'] / $totalMonthlyPayroll) * 100, 2) : 0;
            
            $departmentDistribution[] = [
                'name' => $dept['name'],
                'total_payroll' => $dept['total_payroll'],
                'avg_salary' => $deptAvg,
                'employee_count' => $dept['employee_count'],
                'value' => $deptPercentage,
            ];
        }

        return $this->successResponse([
            'total_records' => $totalRecords,
            'total_paid' => $totalPaid,
            'total_unpaid' => $totalUnpaid,
            'total_payroll_amount' => $totalMonthlyPayroll,
            'avg_salary' => $avgSalary,
            'department_distribution' => $departmentDistribution
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
        $updatedCount = 0;

        foreach ($activeEmployees as $profile) {
            $payroll = PayrollRecord::where('user_id', $profile->user_id)
                ->where('payroll_month', $monthInt)
                ->where('payroll_year', $year)
                ->first();

            if (!$payroll) {
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
                        'is_addition' => false,
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
                        'is_addition' => false,
                        'reason' => "Automatic Insurance",
                        'applied_by' => 'System',
                        'applied_date' => now(),
                    ]);
                }

                // Update final net salary after auto-deductions
                $additionsSum = $payroll->deductions()->where('is_addition', true)->sum('amount');
                $deductionsSum = $payroll->deductions()->where('is_addition', false)->sum('amount');
                $payroll->final_net_salary = $payroll->basic_salary + $payroll->allowances_amount + $payroll->overtime_amount + $additionsSum - $deductionsSum;
                $payroll->save();

                $createdCount++;
            } else if ($payroll->status === 'unpaid') {
                $payroll->basic_salary = $profile->salary ?? 0;
                $payroll->allowances_amount = $profile->allowances ?? 0;

                // Auto-apply Tax if present
                if ($profile->tax_percent > 0) {
                    $taxAmount = ($profile->salary * $profile->tax_percent) / 100;
                    $taxDed = PayrollDeduction::where('payroll_record_id', $payroll->id)
                        ->where('deduction_type', 'tax')
                        ->first();
                    if ($taxDed) {
                        $taxDed->update(['amount' => $taxAmount, 'reason' => "Automatic Tax ({$profile->tax_percent}%)"]);
                    } else {
                        PayrollDeduction::create([
                            'payroll_record_id' => $payroll->id,
                            'deduction_type' => 'tax',
                            'amount' => $taxAmount,
                            'is_addition' => false,
                            'reason' => "Automatic Tax ({$profile->tax_percent}%)",
                            'applied_by' => 'System',
                            'applied_date' => now(),
                        ]);
                    }
                } else {
                    PayrollDeduction::where('payroll_record_id', $payroll->id)->where('deduction_type', 'tax')->delete();
                }

                // Auto-apply Insurance if present
                if ($profile->insurance_amount > 0) {
                    $insDed = PayrollDeduction::where('payroll_record_id', $payroll->id)
                        ->where('deduction_type', 'insurance')
                        ->first();
                    if ($insDed) {
                        $insDed->update(['amount' => $profile->insurance_amount]);
                    } else {
                        PayrollDeduction::create([
                            'payroll_record_id' => $payroll->id,
                            'deduction_type' => 'insurance',
                            'amount' => $profile->insurance_amount,
                            'is_addition' => false,
                            'reason' => "Automatic Insurance",
                            'applied_by' => 'System',
                            'applied_date' => now(),
                        ]);
                    }
                } else {
                    PayrollDeduction::where('payroll_record_id', $payroll->id)->where('deduction_type', 'insurance')->delete();
                }

                // Update final net salary
                $additionsSum = $payroll->deductions()->where('is_addition', true)->sum('amount');
                $deductionsSum = $payroll->deductions()->where('is_addition', false)->sum('amount');
                $payroll->final_net_salary = $payroll->basic_salary + $payroll->allowances_amount + $payroll->overtime_amount + $additionsSum - $deductionsSum;
                $payroll->save();

                $updatedCount++;
            }
        }

        return $this->successResponse(['created_count' => $createdCount, 'updated_count' => $updatedCount], "Payroll initialized. Created: $createdCount, Updated: $updatedCount.");
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

    // PATCH /api/payroll/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $payroll = PayrollRecord::find($id);
        if (!$payroll) return $this->errorResponse('Payroll record not found.', 404);
        if ($payroll->status === 'paid') return $this->errorResponse('Cannot edit paid payroll.', 400);

        $request->validate([
            'basic_salary' => 'nullable|numeric|min:0',
            'allowances_amount' => 'nullable|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $payroll->update($request->only(['basic_salary', 'allowances_amount', 'notes']));
        
        // Recalculate Net
        $additions = $payroll->deductions()->where('is_addition', true)->sum('amount');
        $deductions = $payroll->deductions()->where('is_addition', false)->sum('amount');
        $payroll->final_net_salary = $payroll->basic_salary + $payroll->allowances_amount + $payroll->overtime_amount + $additions - $deductions;
        $payroll->save();

        return $this->successResponse($payroll, 'Payroll updated successfully.');
    }

    // DELETE /api/payroll/{id}
    public function destroy(int $id): JsonResponse
    {
        $payroll = PayrollRecord::find($id);
        if (!$payroll) return $this->errorResponse('Payroll record not found.', 404);
        if ($payroll->status === 'paid') return $this->errorResponse('Cannot delete paid payroll.', 400);

        $payroll->deductions()->delete();
        $payroll->delete();

        return $this->successResponse(null, 'Payroll record deleted.');
    }

    // PATCH /api/payroll/{id}/revert
    public function revert(int $id): JsonResponse
    {
        $payroll = PayrollRecord::find($id);
        if (!$payroll) return $this->errorResponse('Payroll record not found.', 404);
        if ($payroll->status !== 'paid') return $this->errorResponse('Payroll is not paid.', 400);

        $payroll->update([
            'status' => 'unpaid',
            'paid_date' => null,
            'processed_by_id' => null
        ]);

        return $this->successResponse($payroll, 'Payment reverted successfully.');
    }
}
