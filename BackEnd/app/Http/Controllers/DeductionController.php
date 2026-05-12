<?php

namespace App\Http\Controllers;

use App\Models\PayrollDeduction;
use App\Models\PayrollRecord;
use App\Models\EmployeeProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class DeductionController extends Controller
{
    use ApiResponse;

    // GET /api/deductions
    public function index(): JsonResponse
    {
        $deductions = PayrollDeduction::with(['payrollRecord.user.employeeProfile'])
            ->orderByDesc('created_at')
            ->limit(50)
            ->get();

        return $this->successResponse($deductions, 'Deductions retrieved successfully.');
    }

    // POST /api/deductions
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id' => 'required|exists:users,id',
            'deduction_type' => 'required|in:absence,lateness,penalty,tax,insurance,other,bonus,reward',
            'amount' => 'required|numeric|min:0',
            'is_addition' => 'nullable|boolean',
            'absence_days' => 'nullable|integer|min:0',
            'reason' => 'nullable|string',
            'month' => 'required|string', // e.g. "April 2026"
        ]);

        return DB::transaction(function () use ($request) {
            $monthYear = explode(' ', $request->month);
            $monthName = $monthYear[0];
            $year = $monthYear[1] ?? now()->year;

            $monthMap = [
                'January' => 1, 'February' => 2, 'March' => 3, 'April' => 4,
                'May' => 5, 'June' => 6, 'July' => 7, 'August' => 8,
                'September' => 9, 'October' => 10, 'November' => 11, 'December' => 12
            ];
            $monthInt = $monthMap[$monthName] ?? now()->month;

            // 1. Get or Create Payroll Record
            $payroll = PayrollRecord::where('user_id', $request->user_id)
                ->where('payroll_month', $monthInt)
                ->where('payroll_year', $year)
                ->first();

            if (!$payroll) {
                $profile = EmployeeProfile::where('user_id', $request->user_id)->first();
                $payroll = PayrollRecord::create([
                    'user_id' => $request->user_id,
                    'payroll_month' => $monthInt,
                    'payroll_year' => $year,
                    'basic_salary' => $profile->salary ?? 0,
                    'allowances_amount' => $profile->allowances ?? 0,
                    'final_net_salary' => ($profile->salary ?? 0) + ($profile->allowances ?? 0),
                    'status' => 'unpaid',
                ]);
            }

            // 2. Create Deduction
            $deduction = PayrollDeduction::create([
                'payroll_record_id' => $payroll->id,
                'deduction_type' => $request->deduction_type,
                'amount' => $request->amount,
                'is_addition' => $request->is_addition ?? false,
                'absence_days' => $request->absence_days ?? 0,
                'reason' => $request->reason,
                'applied_by' => Auth::user()->name,
                'applied_date' => now(),
            ]);

            // 3. Update Payroll Record Net Salary
            $additionsSum = $payroll->deductions()->where('is_addition', true)->sum('amount');
            $deductionsSum = $payroll->deductions()->where('is_addition', false)->sum('amount');

            $payroll->bonuses_amount = $additionsSum;
            $payroll->final_net_salary = $payroll->basic_salary + $payroll->allowances_amount + $payroll->overtime_amount + $additionsSum - $deductionsSum;
            $payroll->save();

            return $this->successResponse($deduction, 'Deduction recorded and payroll updated successfully.', 201);
        });
    }

    // PATCH /api/deductions/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $deduction = PayrollDeduction::find($id);
        if (!$deduction) return $this->errorResponse('Deduction not found.', 404);

        $request->validate([
            'amount' => 'required|numeric|min:0',
            'reason' => 'nullable|string',
        ]);

        return DB::transaction(function () use ($request, $deduction) {
            $deduction->update($request->only(['amount', 'reason']));

            // Update Payroll Record Net Salary
            $payroll = $deduction->payrollRecord;
            $additionsSum = $payroll->deductions()->where('is_addition', true)->sum('amount');
            $deductionsSum = $payroll->deductions()->where('is_addition', false)->sum('amount');

            $payroll->bonuses_amount = $additionsSum;
            $payroll->final_net_salary = $payroll->basic_salary + $payroll->allowances_amount + $payroll->overtime_amount + $additionsSum - $deductionsSum;
            $payroll->save();

            return $this->successResponse($deduction, 'Deduction updated successfully.');
        });
    }

    // DELETE /api/deductions/{id}
    public function destroy(int $id): JsonResponse
    {
        $deduction = PayrollDeduction::find($id);
        if (!$deduction) return $this->errorResponse('Deduction not found.', 404);

        return DB::transaction(function () use ($deduction) {
            $payroll = $deduction->payrollRecord;
            $deduction->delete();

            // Update Payroll Record Net Salary
            $additionsSum = $payroll->deductions()->where('is_addition', true)->sum('amount');
            $deductionsSum = $payroll->deductions()->where('is_addition', false)->sum('amount');

            $payroll->bonuses_amount = $additionsSum;
            $payroll->final_net_salary = $payroll->basic_salary + $payroll->allowances_amount + $payroll->overtime_amount + $additionsSum - $deductionsSum;
            $payroll->save();

            return $this->successResponse(null, 'Deduction deleted and payroll updated.');
        });
    }
}
