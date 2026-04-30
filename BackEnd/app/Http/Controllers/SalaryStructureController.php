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
        ]);

        $position->update($validated);

        // Auto-apply to ALL employees in this position
        \App\Models\EmployeeProfile::where('job_title', $position->title)->update([
            'tax_percent' => $position->tax_percent,
            'insurance_amount' => $position->insurance_amount,
        ]);

        return $this->successResponse($position, 'Position salary structure updated and applied to all employees.');
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
        $employees = \App\Models\EmployeeProfile::with(['user', 'position'])->get();
        return $this->successResponse($employees, 'Employees salary data retrieved successfully.');
    }

    // PATCH /api/salary-structures/employees/{id}
    public function updateEmployeeSalary(Request $request, int $id): JsonResponse
    {
        $profile = \App\Models\EmployeeProfile::find($id);
        if (!$profile) return $this->errorResponse('Employee not found.', 404);

        $request->validate([
            'salary' => 'required|numeric',
            'tax_percent' => 'nullable|numeric|min:0|max:100',
            'insurance_amount' => 'nullable|numeric|min:0',
            'allowances' => 'nullable|numeric|min:0',
        ]);

        // Check if salary is within range of the position
        $position = \App\Models\Position::where('title', $profile->job_title)->first();
        if ($position) {
            if ($request->salary < $position->min_salary || $request->salary > $position->max_salary) {
                return $this->errorResponse("Salary must be between {$position->min_salary} and {$position->max_salary} for this position.", 422);
            }
        }

        $profile->update([
            'salary' => $request->salary,
            'tax_percent' => $request->tax_percent ?? 0,
            'insurance_amount' => $request->insurance_amount ?? 0,
            'allowances' => $request->allowances ?? 0,
        ]);

        return $this->successResponse($profile, 'Employee salary settings updated successfully.');
    }
}
