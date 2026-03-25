<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateEmployeeRequest;
use App\Http\Resources\EmployeeResource;
use App\Models\EmployeeProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class EmployeeController extends Controller
{
    use ApiResponse;

    // ── GET /api/employees ───────────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr,manager
    public function index(Request $request): JsonResponse
    {
        $employees = EmployeeProfile::with(['user', 'department'])
            ->whereHas('user', fn($q) =>
                $q->where('account_status', 'active')
            )
            ->when($request->filled('search'),
                fn($q) => $q->search($request->search)
            )
            ->when($request->filled('status'),
                fn($q) => $q->status($request->status)
            )
            ->when($request->filled('department_id'),
                fn($q) => $q->department((int) $request->department_id)
            )
            ->when($request->filled('job_title'),
                fn($q) => $q->jobTitle($request->job_title)
            )
            ->paginate($request->get('per_page', 15));

        return $this->successResponse(
            data: [
                'employees'  => EmployeeResource::collection($employees)->resolve(),
                'pagination' => [
                    'total'        => $employees->total(),
                    'per_page'     => $employees->perPage(),
                    'current_page' => $employees->currentPage(),
                    'last_page'    => $employees->lastPage(),
                ],
            ],
            message: 'Employees retrieved successfully.'
        );
    }

    // ── GET /api/employees/positions ─────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr,manager
    // ⚠️ لازم يكون قبل {id} في الـ Routes
    public function positions(): JsonResponse
    {
        $positions = EmployeeProfile::select('job_title')
            ->whereNotNull('job_title')
            ->distinct()
            ->orderBy('job_title')
            ->pluck('job_title');

        return $this->successResponse(
            data: $positions,
            message: 'Positions retrieved successfully.'
        );
    }

    // ── GET /api/employees/statuses ──────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr,manager
    // ⚠️ لازم يكون قبل {id} في الـ Routes
    public function statuses(): JsonResponse
    {
        return $this->successResponse(
            data: ['active', 'on_leave', 'inactive', 'terminated'],
            message: 'Statuses retrieved successfully.'
        );
    }

    // ── GET /api/employees/{id} ──────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr,manager
    public function show(int $id): JsonResponse
    {
        $employee = EmployeeProfile::with(['user', 'department', 'manager'])->find($id);

        if (! $employee) {
            return $this->errorResponse(
                message: 'Employee not found.',
                statusCode: 404
            );
        }

        return $this->successResponse(
            data: new EmployeeResource($employee),
            message: 'Employee retrieved successfully.'
        );
    }

    // ── PUT /api/employees/{id} ──────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function update(UpdateEmployeeRequest $request, int $id): JsonResponse
    {
        $employee = EmployeeProfile::find($id);

        if (! $employee) {
            return $this->errorResponse(
                message: 'Employee not found.',
                statusCode: 404
            );
        }

        $employee = DB::transaction(function () use ($request, $employee) {

            if ($request->hasFile('profile_pic')) {
                if ($employee->profile_pic) {
                    Storage::disk('public')->delete($employee->profile_pic);
                }
                $employee->profile_pic = $request->file('profile_pic')
                    ->store('profile_pictures', 'public');
            }

            $employee->update($request->only([
                'full_name', 'employee_id', 'date_of_birth', 'marital_status',
                'phone_number', 'address', 'emergency_contacts', 'manager_id',
                'branch', 'city', 'grade', 'job_title', 'employment_status',
                'department_id', 'start_date', 'internal_transfer_date',
                'resignation_date',
            ]));

            return $employee;
        });

        return $this->successResponse(
            data: new EmployeeResource($employee->fresh(['user', 'department', 'manager'])),
            message: 'Employee updated successfully.'
        );
    }

    // ── DELETE /api/employees/{id} ───────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function destroy(int $id): JsonResponse
    {
        $employee = EmployeeProfile::find($id);

        if (! $employee) {
            return $this->errorResponse(
                message: 'Employee not found.',
                statusCode: 404
            );
        }

        if ($employee->profile_pic) {
            Storage::disk('public')->delete($employee->profile_pic);
        }

        $employee->user->delete();

        return $this->successResponse(
            message: 'Employee deleted successfully.'
        );
    }
}
