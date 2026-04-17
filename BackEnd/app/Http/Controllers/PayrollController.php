<?php

namespace App\Http\Controllers;

use App\Models\MonthlyPayroll;
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
        $payroll = MonthlyPayroll::with(['employeeProfile.department'])
            ->when($request->filled('month'), function ($q) use ($request) {
                return $q->where('month', $request->month);
            })
            ->when($request->filled('department_id'), function ($q) use ($request) {
                return $q->whereHas('employeeProfile', function ($sq) use ($request) {
                    $sq->where('department_id', $request->department_id);
                });
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                return $q->whereHas('employeeProfile', function ($sq) use ($request) {
                    $sq->where('full_name', 'like', "%{$request->search}%");
                });
            })
            ->get();

        return $this->successResponse($payroll, 'Payroll retrieved successfully.');
    }

    // PATCH /api/payroll/{id}/pay
    public function pay(int $id): JsonResponse
    {
        $payroll = MonthlyPayroll::find($id);
        if (!$payroll) {
            return $this->errorResponse('Payroll record not found.', 404);
        }

        if ($payroll->status === 'paid') {
            return $this->errorResponse('Payroll already paid.', 400);
        }

        $payroll->update([
            'status'  => 'paid',
            'paid_at' => now(),
            'paid_by' => Auth::id(),
        ]);

        return $this->successResponse($payroll, 'Payroll marked as paid.');
    }

    // POST /api/payroll/pay-all
    public function payAll(Request $request): JsonResponse
    {
        $ids = $request->input('ids', []);
        
        $updated = MonthlyPayroll::whereIn('id', $ids)
            ->where('status', 'unpaid')
            ->update([
                'status'  => 'paid',
                'paid_at' => now(),
                'paid_by' => Auth::id(),
            ]);

        return $this->successResponse(['updated_count' => $updated], 'Selected payroll records marked as paid.');
    }
}
