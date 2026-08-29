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
            ->when($request->filled('position_id'),
                fn($q) => $q->where('position_id', (int) $request->position_id)
            )
            ->when($request->filled('job_title'),
                fn($q) => $q->where(function($sub) use ($request) {
                    $sub->where('job_title', 'like', "%{$request->job_title}%")
                        ->orWhere('position_id', $request->job_title);
                })
            )
            ->paginate($request->get('per_page', 50));

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
        $profileTitles = EmployeeProfile::select('job_title')
            ->whereNotNull('job_title')
            ->distinct()
            ->pluck('job_title')
            ->toArray();

        $definedTitles = \App\Models\Position::pluck('title')->toArray();

        $allPositions = array_unique(array_merge($profileTitles, $definedTitles));
        sort($allPositions);

        return $this->successResponse(
            data: array_values($allPositions),
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

    // ── GET /api/employees/managers ──────────────────────────────────────────
    public function managers(Request $request): JsonResponse
    {
        $query = EmployeeProfile::whereHas('user', fn($q) =>
            $q->where('account_status', 'active')
        );

        if ($request->filled('department_id')) {
            $query->where('department_id', (int) $request->department_id);
        } else {
            $query->whereHas('user', fn($q) =>
                $q->whereHas('roles', fn($r) =>
                    $r->whereIn('name', ['manager', 'department_manager', 'hr'])
                )
            );
        }

        $managers = $query->get(['id', 'full_name', 'job_title', 'department_id']);

        return $this->successResponse(
            data: $managers,
            message: 'Managers retrieved successfully.'
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
            $updateData = $request->only([
                'full_name', 'employee_id', 'date_of_birth', 'marital_status',
                'phone_number', 'address', 'emergency_contacts', 'manager_id',
                'branch', 'city', 'grade', 'job_title', 'employment_status',
                'department_id', 'position_id', 'start_date', 'internal_transfer_date',
                'resignation_date', 'salary',
            ]);

            if ($request->hasFile('profile_pic')) {
                if ($employee->profile_pic) {
                    Storage::disk('public')->delete($employee->profile_pic);
                }
                $updateData['profile_pic'] = $request->file('profile_pic')
                    ->store('profile_pictures', 'public');
            }

            $employee->update($updateData);

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

    // ── GET /api/my-profile ──────────────────────────────────────────────
    public function myProfile(Request $request): JsonResponse
    {
        $employee = $request->user()->employeeProfile;

        if (! $employee) {
            return $this->errorResponse(
                message: 'Employee profile not found.',
                statusCode: 404
            );
        }

        $employee->load(['user', 'department', 'manager']);

        return $this->successResponse(
            data: new EmployeeResource($employee),
            message: 'My profile retrieved successfully.'
        );
    }

    // ── PUT /api/my-profile ──────────────────────────────────────────────
    public function updateMyProfile(Request $request): JsonResponse
    {
        $employee = $request->user()->employeeProfile;

        if (! $employee) {
            return $this->errorResponse(
                message: 'Employee profile not found.',
                statusCode: 404
            );
        }

        $validated = $request->validate([
            'phone_number'       => 'sometimes|nullable|string|max:20',
            'address'            => 'sometimes|nullable|string',
            'marital_status'     => 'sometimes|nullable|in:single,married,divorced,widowed',
            'emergency_contacts' => 'sometimes|nullable|string',
            'profile_pic'        => 'sometimes|nullable|image|mimes:jpg,jpeg,png|max:2048',
        ]);

        $employee = DB::transaction(function () use ($request, $employee, $validated) {
            $updateData = array_diff_key($validated, ['profile_pic' => '']);

            if ($request->hasFile('profile_pic')) {
                if ($employee->profile_pic) {
                    Storage::disk('public')->delete($employee->profile_pic);
                }
                $updateData['profile_pic'] = $request->file('profile_pic')
                    ->store('profile_pictures', 'public');
            }

            $employee->update($updateData);

            return $employee;
        });

        return $this->successResponse(
            data: new EmployeeResource($employee->fresh(['user', 'department', 'manager'])),
            message: 'My profile updated successfully.'
        );
    }

    // ── GET /api/my-department/employees ──────────────────────────────────────
    public function myTeam(): JsonResponse
    {
        $manager = auth()->user()->employeeProfile;

        if (!$manager) {
            return $this->errorResponse('Profile not found.', null, 404);
        }

        $team = EmployeeProfile::with(['user', 'department'])
            ->where('department_id', $manager->department_id)
            ->where('id', '!=', $manager->id)
            ->get();

        return $this->successResponse(
            data: EmployeeResource::collection($team)->resolve(),
            message: 'Team members retrieved successfully.'
        );
    }

    // ── GET /api/my-department/employees ─────────────────────────────────────
    // Middleware: auth:sanctum (any role)
    // يُرجع زملاء نفس القسم باستثناء الموظف نفسه — للاستخدام في تقييم الأقران
    public function myDepartmentEmployees(): JsonResponse
    {
        $employee = auth()->user()->employeeProfile;

        if (!$employee || !$employee->department_id) {
            return $this->successResponse(
                data: [],
                message: 'No department assigned.'
            );
        }

        $colleagues = EmployeeProfile::with(['user', 'department'])
            ->where('department_id', $employee->department_id)
            ->where('id', '!=', $employee->id)
            ->whereHas('user', fn($q) => $q->where('account_status', 'active'))
            ->get();

        return $this->successResponse(
            data: EmployeeResource::collection($colleagues)->resolve(),
            message: 'Department employees retrieved successfully.'
        );
    }

    // ── GET /api/employee/org-summary ─────────────────────────────────────────
    // Middleware: auth:sanctum (any role)
    // يُرجع إجمالي موظفي الشركة وموظفي قسم الموظف الحالي للاستخدام في Dashboard الموظف
    public function orgSummary(): JsonResponse
    {
        $employee = auth()->user()->employeeProfile;

        $companyCount = EmployeeProfile::whereHas('user', fn($q) => $q->where('account_status', 'active'))->count();

        $deptCount = 0;
        $deptName = null;

        if ($employee && $employee->department_id) {
            $deptCount = EmployeeProfile::where('department_id', $employee->department_id)
                ->whereHas('user', fn($q) => $q->where('account_status', 'active'))
                ->count();
            $deptName = $employee->department?->name;
        }

        return $this->successResponse(
            data: [
                'company_employees_count'    => $companyCount,
                'department_employees_count' => $deptCount,
                'department_name'            => $deptName,
            ],
            message: 'Organization summary retrieved successfully.'
        );
    }
}

