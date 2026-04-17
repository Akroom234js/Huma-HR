<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEmployeeMovementRequest;
use App\Http\Resources\EmployeeMovementResource;
use App\Models\EmployeeMovement;
use App\Models\EmployeeProfile;
use App\Models\SalaryAdjustment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;

class EmployeeMovementController extends Controller
{
    use ApiResponse;

    // ── GET /api/employee-movements ──────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr,manager
    public function index(Request $request): JsonResponse
    {
        $movements = EmployeeMovement::with(['employeeProfile', 'createdBy'])
            ->when($request->filled('search'),
                fn($q) => $q->search($request->search)
            )
            ->when($request->filled('type'),
                fn($q) => $q->ofType($request->type)
            )
            ->when($request->filled('date_from') || $request->filled('date_to'),
                fn($q) => $q->dateRange($request->date_from, $request->date_to)
            )
            ->orderByDesc('movement_date')
            ->paginate($request->get('per_page', 15));

        return $this->successResponse(
            data: [
                'movements'  => EmployeeMovementResource::collection($movements)->resolve(),
                'pagination' => [
                    'total'        => $movements->total(),
                    'per_page'     => $movements->perPage(),
                    'current_page' => $movements->currentPage(),
                    'last_page'    => $movements->lastPage(),
                ],
            ],
            message: 'Movements retrieved successfully.'
        );
    }

    // ── POST /api/employee-movements ─────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function store(StoreEmployeeMovementRequest $request): JsonResponse
    {
        $employee = EmployeeProfile::findOrFail($request->employee_profile_id);

        return DB::transaction(function () use ($request, $employee) {

            $movement = match ($request->movement_type) {
                'promotion'         => $this->handlePromotion($request, $employee),
                'transfer'          => $this->handleTransfer($request, $employee),
                'department_change' => $this->handleDepartmentChange($request, $employee),
                'salary_adjustment' => $this->handleSalaryAdjustment($request, $employee),
            };

            return $this->successResponse(
                data: new EmployeeMovementResource($movement->load(['employeeProfile', 'createdBy'])),
                message: 'Movement recorded successfully.',
                statusCode: 201
            );
        });
    }

    // ── GET /api/employee-movements/{id} ─────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $movement = EmployeeMovement::with(['employeeProfile', 'createdBy'])->find($id);

        if (! $movement) {
            return $this->errorResponse(message: 'Movement not found.', statusCode: 404);
        }

        return $this->successResponse(
            data: new EmployeeMovementResource($movement),
            message: 'Movement retrieved successfully.'
        );
    }

    // ── DELETE /api/employee-movements/{id} ──────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function destroy(int $id): JsonResponse
    {
        $movement = EmployeeMovement::find($id);

        if (! $movement) {
            return $this->errorResponse(message: 'Movement not found.', statusCode: 404);
        }

        $movement->delete(); // cascade يحذف salary_adjustment تلقائياً

        return $this->successResponse(message: 'Movement deleted successfully.');
    }
    // ── GET /api/employee-movements/types ────────────────────────────────────
    // يرجع الأنواع الأربعة للـ dropdown
    public function types(): JsonResponse
    {
        return $this->successResponse(
            data: [
                ['value' => 'promotion',         'label' => 'Promotion'],
                ['value' => 'transfer',           'label' => 'Transfer'],
                ['value' => 'department_change',  'label' => 'Department Change'],
                ['value' => 'salary_adjustment',  'label' => 'Salary Adjustment'],
            ],
            message: 'Movement types retrieved successfully.'
        );
    }

    // ══════════════════════════════════════════════════════════════════════════
    // Private Handlers — كل نوع حركة له handler منفصل
    // ══════════════════════════════════════════════════════════════════════════

    // ── Promotion ─────────────────────────────────────────────────────────────
    private function handlePromotion(StoreEmployeeMovementRequest $request, EmployeeProfile $employee): EmployeeMovement
    {
        $previousPosition = $employee->job_title ?? '-';

        // تحديث بيانات الموظف
        $employee->update([
            'job_title'  => $request->new_position,
            'manager_id' => $request->manager_id ?? $employee->manager_id,
        ]);

        // تسجيل الحركة
        $movement = EmployeeMovement::create([
            'employee_profile_id' => $employee->id,
            'movement_type'       => 'promotion',
            'previous_value'      => $previousPosition,
            'new_value'           => $request->new_position,
            'movement_date'       => $request->effective_date,
            'notes'               => $request->notes,
            'created_by'          => Auth::id(),
        ]);

        // تسجيل في audit log
        $employee->logChange('job_title', $previousPosition, $request->new_position, Auth::user()->email);

        return $movement;
    }

    // ── Transfer ──────────────────────────────────────────────────────────────
    private function handleTransfer(StoreEmployeeMovementRequest $request, EmployeeProfile $employee): EmployeeMovement
    {
        $previousPosition = $employee->job_title ?? '-';

        $employee->update([
            'job_title'  => $request->new_position,
            'manager_id' => $request->manager_id ?? $employee->manager_id,
        ]);

        $movement = EmployeeMovement::create([
            'employee_profile_id' => $employee->id,
            'movement_type'       => 'transfer',
            'previous_value'      => $previousPosition,
            'new_value'           => $request->new_position,
            'movement_date'       => $request->effective_date,
            'notes'               => $request->adjustment_reason ?? $request->notes,
            'created_by'          => Auth::id(),
        ]);

        $employee->logChange('job_title', $previousPosition, $request->new_position, Auth::user()->email);

        return $movement;
    }

    // ── Department Change ─────────────────────────────────────────────────────
    private function handleDepartmentChange(StoreEmployeeMovementRequest $request, EmployeeProfile $employee): EmployeeMovement
    {
        // التحقق إن الـ manager_id ينتمي لمدراء القسم الجديد
        $managerBelongsToDept = EmployeeProfile::where('id', $request->manager_id)
            ->where('department_id', $request->new_department_id)
            ->whereHas('user', fn($q) => $q->whereHas('roles', fn($r) =>
                $r->where('name', 'department_manager')
            ))
            ->exists();

        if (! $managerBelongsToDept) {
            throw new \InvalidArgumentException('Selected manager does not belong to the new department.');
        }

        $previousDeptId = $employee->department_id;
        $previousDept   = $employee->department?->name ?? '-';

        $employee->update([
            'department_id' => $request->new_department_id,
            'manager_id'    => $request->manager_id,
        ]);
        $newDept = $employee->fresh()->department?->name ?? $request->new_department_id;

        $movement = EmployeeMovement::create([
            'employee_profile_id' => $employee->id,
            'movement_type'       => 'department_change',
            'previous_value'      => $previousDept,
            'new_value'           => $newDept,
            'movement_date'       => $request->effective_date,
            'notes'               => $request->notes,
            'created_by'          => Auth::id(),
        ]);

        $employee->logChange('department_id', $previousDeptId, $request->new_department_id, Auth::user()->email);

        return $movement;
    }

    // ── Salary Adjustment ─────────────────────────────────────────────────────
    private function handleSalaryAdjustment(StoreEmployeeMovementRequest $request, EmployeeProfile $employee): EmployeeMovement
    {
        $currentSalary = $employee->salary ?? 0;

        // 1. تسجيل الحركة العامة
        $movement = EmployeeMovement::create([
            'employee_profile_id' => $employee->id,
            'movement_type'       => 'salary_adjustment',
            'previous_value'      => (string) $currentSalary,
            'new_value'           => (string) $request->new_salary,
            'movement_date'       => $request->effective_date,
            'notes'               => $request->notes,
            'created_by'          => Auth::id(),
        ]);

        // 2. تسجيل التفاصيل في salary_adjustments
        SalaryAdjustment::create([
            'employee_profile_id' => $employee->id,
            'employee_movement_id'=> $movement->id,
            'adjustment_type_id'  => $request->adjustment_type_id,
            'custom_type_name'    => $request->custom_type_name,
            'current_salary'      => $currentSalary,
            'new_salary'          => $request->new_salary,
            'effective_date'      => $request->effective_date,
            'adjustment_reason'   => $request->adjustment_reason,
            'created_by'          => Auth::id(),
        ]);

        // 3. تحديث الراتب في employee_profiles
        $employee->update(['salary' => $request->new_salary]);

        $employee->logChange('salary', $currentSalary, $request->new_salary, Auth::user()->email);

        return $movement;
    }
}
