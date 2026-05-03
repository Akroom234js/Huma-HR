<?php

namespace App\Http\Controllers;

use App\Models\SalaryStructure;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalaryStructureController extends Controller
{
    use ApiResponse;

    // GET /api/salary-structures
    public function index(Request $request): JsonResponse
    {
        $structures = \App\Models\Position::all();
        return $this->successResponse($structures, 'Positions (Salary structures) retrieved successfully.');
    }

    // POST /api/salary-structures (Not really needed now, but keep for compatibility)
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => 'required|string',
            'department_id' => 'required|exists:departments,id',
            'min_salary' => 'required|numeric',
            'max_salary' => 'required|numeric',
            'tax_percent' => 'nullable|numeric|min:0|max:100',
            'insurance_amount' => 'nullable|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
        ]);

        $structure = \App\Models\Position::create($validated);
        return $this->successResponse($structure, 'Position created successfully.', 201);
    }

    // PUT /api/salary-structures/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $position = \App\Models\Position::find($id);
        if (!$position) {
            return $this->errorResponse('Position not found.', 404);
        }

        $validated = $request->validate([
            'min_salary' => 'sometimes|required|numeric',
            'max_salary' => 'sometimes|required|numeric',
            'tax_percent' => 'nullable|numeric|min:0|max:100',
            'insurance_amount' => 'nullable|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
            'apply_to_all_employees' => 'nullable|boolean'
        ]);

        $position->update($request->only([
            'min_salary', 'max_salary', 'tax_percent', 'insurance_amount', 'allowances'
        ]));

        if ($request->apply_to_all_employees) {
            // Apply all changes to ALL employees in this position
            \App\Models\EmployeeProfile::where('job_title', $position->title)->update([
                'salary' => $position->min_salary,
                'tax_percent' => $position->tax_percent,
                'insurance_amount' => $position->insurance_amount,
                'allowances' => $position->allowances,
            ]);
        }

        return $this->successResponse($position, 'Position salary structure updated.');
    }

    // DELETE /api/salary-structures/{id}
    public function destroy(int $id): JsonResponse
    {
        $structure = SalaryStructure::find($id);
        if (!$structure) {
            return $this->errorResponse('Salary structure not found.', 404);
        }

        $structure->delete();
        return $this->successResponse(null, 'Salary structure deleted successfully.');
    }

    // GET /api/salary-structures/employees
    public function employees(): JsonResponse
    {
        $employees = \App\Models\EmployeeProfile::with(['user'])->get();
        return $this->successResponse($employees, 'Employees salary data retrieved successfully.');
    }

    // PATCH /api/salary-structures/employees/{id}
    public function updateEmployeeSalary(Request $request, int $id): JsonResponse
    {
        $profile = \App\Models\EmployeeProfile::find($id);
        if (!$profile) return $this->errorResponse('Employee not found.', 404);

        $request->validate([
            'salary' => 'nullable|numeric',
            'tax_percent' => 'nullable|numeric|min:0|max:100',
            'insurance_amount' => 'nullable|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
        ]);

        $oldTax = $profile->tax_percent;
        $oldInsurance = $profile->insurance_amount;

        $updateData = [
            'tax_percent' => $request->tax_percent ?? 0,
            'insurance_amount' => $request->insurance_amount ?? 0,
            'allowances' => $request->allowances ?? 0,
        ];

        // Only update salary if provided (as requested, it's removed from frontend)
        if ($request->has('salary')) {
             $position = \App\Models\Position::where('title', $profile->job_title)->first();
             if ($position && ($request->salary < $position->min_salary || $request->salary > $position->max_salary)) {
                 return $this->errorResponse("Salary must be between {$position->min_salary} and {$position->max_salary} for this position.", 422);
             }
             $updateData['salary'] = $request->salary;
        }

        $profile->update($updateData);

        // Record the Tax & Insurance Adjustment in the current month's unpaid payroll
        $currentMonth = now()->month;
        $currentYear = now()->year;
        
        $payroll = \App\Models\PayrollRecord::where('user_id', $profile->user_id)
            ->where('payroll_month', $currentMonth)
            ->where('payroll_year', $currentYear)
            ->where('status', 'unpaid')
            ->first();

        if ($payroll) {
            $hasChanges = false;

            // Handle Tax Changes
            if ($oldTax != $profile->tax_percent) {
                $hasChanges = true;
                $taxAmount = ($profile->salary * $profile->tax_percent) / 100;
                
                $taxDeduction = \App\Models\PayrollDeduction::where('payroll_record_id', $payroll->id)
                    ->where('deduction_type', 'tax')
                    ->first();
                    
                if ($taxDeduction) {
                    $taxDeduction->update([
                        'amount' => $taxAmount,
                        'reason' => "Tax adjusted to {$profile->tax_percent}%",
                        'applied_by' => auth()->user()->name ?? 'System',
                        'applied_date' => now(),
                    ]);
                } else {
                    \App\Models\PayrollDeduction::create([
                        'payroll_record_id' => $payroll->id,
                        'deduction_type' => 'tax',
                        'amount' => $taxAmount,
                        'is_addition' => false,
                        'reason' => "Tax adjusted to {$profile->tax_percent}%",
                        'applied_by' => auth()->user()->name ?? 'System',
                        'applied_date' => now(),
                    ]);
                }
            }

            // Handle Insurance Changes
            if ($oldInsurance != $profile->insurance_amount) {
                $hasChanges = true;
                $insDeduction = \App\Models\PayrollDeduction::where('payroll_record_id', $payroll->id)
                    ->where('deduction_type', 'insurance')
                    ->first();
                    
                if ($insDeduction) {
                    $insDeduction->update([
                        'amount' => $profile->insurance_amount,
                        'reason' => "Insurance adjusted",
                        'applied_by' => auth()->user()->name ?? 'System',
                        'applied_date' => now(),
                    ]);
                } else {
                    \App\Models\PayrollDeduction::create([
                        'payroll_record_id' => $payroll->id,
                        'deduction_type' => 'insurance',
                        'amount' => $profile->insurance_amount,
                        'is_addition' => false,
                        'reason' => "Insurance adjusted",
                        'applied_by' => auth()->user()->name ?? 'System',
                        'applied_date' => now(),
                    ]);
                }
            }

            if ($hasChanges || $request->has('salary') || $request->has('allowances')) {
                // Recalculate net salary
                $payroll->allowances_amount = $profile->allowances;
                if ($request->has('salary')) {
                    $payroll->basic_salary = $profile->salary;
                }
                $additionsSum = $payroll->deductions()->where('is_addition', true)->sum('amount');
                $deductionsSum = $payroll->deductions()->where('is_addition', false)->sum('amount');
                
                $payroll->bonuses_amount = $additionsSum;
                $payroll->final_net_salary = $payroll->basic_salary + $payroll->allowances_amount + $payroll->overtime_amount + $additionsSum - $deductionsSum;
                $payroll->save();
            }
        }

        return $this->successResponse($profile, 'Employee settings updated and adjustments recorded successfully.');
    }
}
