<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    use ApiResponse;

    // GET /api/departments
    public function index(): JsonResponse
    {
        $departments = Department::select('id', 'name', 'description')
            ->withCount('employees')
            ->orderBy('name')
            ->get();

        return $this->successResponse(
            data: $departments,
            message: 'Departments retrieved successfully.'
        );
    }

    // GET /api/departments/{id}
    public function show(int $id): JsonResponse
    {
        $department = Department::withCount('employees')->find($id);

        if (!$department) {
            return $this->errorResponse('Department not found.', 404);
        }

        return $this->successResponse($department, 'Department retrieved successfully.');
    }

    // POST /api/departments
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
            'head_id' => 'nullable|exists:employee_profiles,id',
            'employee_ids' => 'nullable|array',
            'employee_ids.*' => 'exists:employee_profiles,id',
        ]);

        $department = DB::transaction(function () use ($request) {
            $dept = Department::create($request->only(['name', 'description']));

            // Update local employees to this department and set their manager if head_id is provided
            if ($request->filled('employee_ids')) {
                EmployeeProfile::whereIn('id', $request->employee_ids)
                    ->update(['department_id' => $dept->id]);
            }

            if ($request->filled('head_id')) {
                $head = EmployeeProfile::find($request->head_id);
                $head->update(['department_id' => $dept->id]);
                
                // Optional: set the head as manager for all assigned employees
                if ($request->filled('employee_ids')) {
                    EmployeeProfile::whereIn('id', $request->employee_ids)
                        ->update(['manager_id' => $head->id]);
                }
            }

            return $dept;
        });

        return $this->successResponse($department, 'Department created successfully.', 201);
    }

    // PUT /api/departments/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $department = Department::find($id);
        if (!$department) {
            return $this->errorResponse('Department not found.', 404);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
            'description' => 'nullable|string',
        ]);

        $department->update($request->only(['name', 'description']));

        return $this->successResponse($department, 'Department updated successfully.');
    }

    // DELETE /api/departments/{id}
    public function destroy(int $id): JsonResponse
    {
        $department = Department::find($id);
        if (!$department) {
            return $this->errorResponse('Department not found.', 404);
        }

        // Check if there are employees assigned to this department
        if ($department->employees()->exists()) {
            return $this->errorResponse('Cannot delete department with assigned employees.', 422);
        }

        $department->delete();

        return $this->successResponse(null, 'Department deleted successfully.');
    }
}
