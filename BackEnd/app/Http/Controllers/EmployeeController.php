<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\UpdateEmployeeRequest;
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
                fn($q) => $q->department($request->department_id)
            )
            ->when($request->filled('job_title'),
                fn($q) => $q->jobTitle($request->job_title)
            )
            ->paginate($request->get('per_page', 15));

        return $this->successResponse(
            data: [
                'employees'  => $employees->map(fn($emp) => $this->formatEmployee($emp)),
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

    // ── GET /api/employees/{id} ──────────────────────────────────────────────
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
            data: $this->formatEmployee($employee),
            message: 'Employee retrieved successfully.'
        );
    }

    // ── PUT /api/employees/{id} ──────────────────────────────────────────────
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

            // رفع صورة جديدة إذا أُرسلت
            if ($request->hasFile('profile_pic')) {
                // حذف الصورة القديمة أولاً
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
            data: $this->formatEmployee($employee->fresh(['user', 'department'])),
            message: 'Employee updated successfully.'
        );
    }

    // ── DELETE /api/employees/{id} ───────────────────────────────────────────
    public function destroy(int $id): JsonResponse
    {
        $employee = EmployeeProfile::find($id);

        if (! $employee) {
            return $this->errorResponse(
                message: 'Employee not found.',
                statusCode: 404
            );
        }

        // حذف الصورة من الـ storage
        if ($employee->profile_pic) {
            Storage::disk('public')->delete($employee->profile_pic);
        }

        // حذف الـ user — cascade يحذف الـ profile تلقائياً
        $employee->user->delete();

        return $this->successResponse(
            message: 'Employee deleted successfully.'
        );
    }

    // ── Helper: تنسيق بيانات الموظف ─────────────────────────────────────────
    private function formatEmployee(EmployeeProfile $employee): array
    {
        return [
            'id'                => $employee->id,
            'user_id'           => $employee->user_id,
            'employee_id'       => $employee->employee_id,
            'full_name'         => $employee->full_name,
            'email'             => $employee->user?->email,
            'job_title'         => $employee->job_title,
            'employment_status' => $employee->employment_status,
            'department'        => $employee->department?->name ?? null,
            'department_id'     => $employee->department_id ?? null,
            'phone_number'      => $employee->phone_number,
            'branch'            => $employee->branch,
            'city'              => $employee->city,
            'grade'             => $employee->grade,
            'start_date'        => $employee->start_date,
            // ← Accessor من الـ Model بدل ما نعيد حساب الـ URL هنا
            'profile_pic'       => $employee->profile_pic_url,
        ];
    }
}
