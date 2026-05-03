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
use Illuminate\Support\Facades\Auth;

class BonusRuleController extends Controller
{
    use ApiResponse;

    public function index(): JsonResponse
    {
        return $this->successResponse(BonusRule::all(), 'Bonus rules retrieved.');
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string',
            'target_type' => 'required|in:department,employee,all',
            'target_id' => 'nullable|integer',
            'amount' => 'required|numeric|min:0',
            'is_percentage' => 'nullable|boolean',
            'frequency' => 'required|in:monthly,once',
            'apply_month' => 'nullable|string',
            'condition_type' => 'nullable|in:none,attendance,performance',
            'condition_value' => 'nullable|string',
        ]);

        $rule = BonusRule::create($validated);
        return $this->successResponse($rule, 'Bonus rule created.', 201);
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

        $activeRules = BonusRule::where('is_active', true)->get();
        $appliedCount = 0;

        return DB::transaction(function () use ($activeRules, $monthInt, $year, $request, &$appliedCount) {
            foreach ($activeRules as $rule) {
                // Check frequency/month constraints
                if ($rule->frequency === 'once' && $rule->apply_month !== $request->month) {
                    continue;
                }

                // Find target payroll records
                $query = PayrollRecord::where('payroll_month', $monthInt)
                    ->where('payroll_year', $year)
                    ->where('status', 'unpaid');

                if ($rule->target_type === 'employee') {
                    $profile = EmployeeProfile::where('id', $rule->target_id)
                        ->orWhere('employee_id', (string)$rule->target_id)
                        ->orWhere('user_id', $rule->target_id)
                        ->first();
                    
                    if ($profile) {
                        $query->where('user_id', $profile->user_id);
                    } else {
                        $query->where('user_id', -1);
                    }
                } elseif ($rule->target_type === 'department') {
                    $query->whereHas('user.employeeProfile', function ($q) use ($rule) {
                        $q->where('department_id', $rule->target_id);
                    });
                }

                $payrolls = $query->get();

                foreach ($payrolls as $payroll) {
                    $bonusAmount = $rule->amount;
                    if ($rule->is_percentage) {
                        $bonusAmount = ($payroll->basic_salary * $rule->amount) / 100;
                    }

                    // Remove existing bonus applied from this exact rule to avoid duplicates
                    PayrollDeduction::where('payroll_record_id', $payroll->id)
                        ->where('deduction_type', 'bonus')
                        ->where('reason', "Rule: {$rule->name}")
                        ->delete();

                    // Create addition
                    PayrollDeduction::create([
                        'payroll_record_id' => $payroll->id,
                        'deduction_type' => 'bonus',
                        'amount' => $bonusAmount,
                        'is_addition' => true,
                        'reason' => "Rule: {$rule->name}",
                        'applied_by' => 'System (Rule)',
                        'applied_date' => now(),
                    ]);

                    // Recalculate net
                    $additions = $payroll->deductions()->where('is_addition', true)->sum('amount');
                    $deductions = $payroll->deductions()->where('is_addition', false)->sum('amount');
                    
                    $payroll->bonuses_amount = $additions;
                    $payroll->final_net_salary = $payroll->basic_salary + $payroll->allowances_amount + $payroll->overtime_amount + $additions - $deductions;
                    $payroll->save();

                    $appliedCount++;
                }
            }

            return $this->successResponse(['applied_count' => $appliedCount], "Applied rules to $appliedCount records.");
        });
    }
}
