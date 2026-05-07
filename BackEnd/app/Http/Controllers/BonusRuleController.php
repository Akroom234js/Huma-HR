<?php

namespace App\Http\Controllers;

use App\Models\BonusRule;
use App\Models\PayrollRecord;
use App\Models\PayrollDeduction;
use App\Models\EmployeeProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BonusRuleController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        $rules = BonusRule::orderBy('created_at', 'desc')->get();
        return $this->successResponse($rules, 'Bonus rules retrieved.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'target_type' => 'required|in:all,department,employee',
            'target_id' => 'nullable|string',
            'amount' => 'required|numeric|min:0',
            'is_percentage' => 'required|boolean',
            'frequency' => 'required|in:monthly,once',
            'apply_month' => 'nullable|string',
            'condition_type' => 'nullable|string',
        ]);

        $rule = BonusRule::create($validated);
        return $this->successResponse($rule, 'Bonus rule created successfully.', 201);
    }

    public function update(Request $request, int $id): JsonResponse
    {
        $rule = BonusRule::find($id);
        if (!$rule) return $this->errorResponse('Rule not found.', 404);

        $rule->update($request->all());
        return $this->successResponse($rule, 'Bonus rule updated.');
    }

    public function destroy(int $id): JsonResponse
    {
        $rule = BonusRule::find($id);
        if (!$rule) return $this->errorResponse('Rule not found.', 404);

        $rule->delete();
        return $this->successResponse(null, 'Bonus rule deleted.');
    }

    public function apply(Request $request): JsonResponse
    {
        $request->validate([
            'month' => 'required|string', // e.g. "April 2026"
        ]);

        $monthYear = explode(' ', $request->month);
        $monthName = $monthYear[0];
        $year = $monthYear[1] ?? now()->year;

        $monthMap = [
            'January' => 1, 'February' => 2, 'March' => 3, 'April' => 4,
            'May' => 5, 'June' => 6, 'July' => 7, 'August' => 8,
            'September' => 9, 'October' => 10, 'November' => 11, 'December' => 12
        ];
        $monthInt = $monthMap[$monthName] ?? now()->month;

        $rules = BonusRule::where('is_active', true)->get();
        $appliedCount = 0;

        return DB::transaction(function () use ($rules, $monthInt, $year, $request, &$appliedCount) {
            foreach ($rules as $rule) {
                // Skip if frequency is 'once' and month doesn't match
                if ($rule->frequency === 'once' && $rule->apply_month !== $request->month) {
                    continue;
                }

                // Get target payroll records
                $query = PayrollRecord::where('payroll_month', $monthInt)
                    ->where('payroll_year', $year)
                    ->where('status', 'unpaid');

                if ($rule->target_type === 'department') {
                    $query->whereHas('user.employeeProfile', function ($q) use ($rule) {
                        $q->where('department_id', $rule->target_id);
                    });
                } elseif ($rule->target_type === 'employee') {
                    $query->where('user_id', $rule->target_id);
                }

                $records = $query->get();

                foreach ($records as $record) {
                    // Check if this rule was already applied to this record
                    $exists = PayrollDeduction::where('payroll_record_id', $record->id)
                        ->where('deduction_type', 'bonus')
                        ->where('reason', 'like', "Rule: {$rule->name}%")
                        ->exists();

                    if ($exists) continue;

                    $bonusAmount = $rule->is_percentage 
                        ? ($record->basic_salary * $rule->amount / 100)
                        : $rule->amount;

                    PayrollDeduction::create([
                        'payroll_record_id' => $record->id,
                        'deduction_type' => 'bonus',
                        'amount' => $bonusAmount,
                        'is_addition' => true,
                        'reason' => "Rule: {$rule->name}",
                        'applied_by' => 'System',
                        'applied_date' => now(),
                    ]);

                    // Update PayrollRecord
                    $additionsSum = $record->deductions()->where('is_addition', true)->sum('amount');
                    $deductionsSum = $record->deductions()->where('is_addition', false)->sum('amount');
                    
                    $record->bonuses_amount = $additionsSum;
                    $record->final_net_salary = $record->basic_salary + $record->allowances_amount + $record->overtime_amount + $additionsSum - $deductionsSum;
                    $record->save();

                    $appliedCount++;
                }
            }

            return $this->successResponse(['applied_to_records' => $appliedCount], "Applied rules to $appliedCount records.");
        });
    }
}
