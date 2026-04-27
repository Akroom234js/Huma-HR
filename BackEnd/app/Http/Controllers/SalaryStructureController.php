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
        $structures = SalaryStructure::all();
        return $this->successResponse($structures, 'Salary structures retrieved successfully.');
    }

    // POST /api/salary-structures
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'job_level' => 'required|string',
            'job_title' => 'required|string',
            'min_salary' => 'required|numeric',
            'max_salary' => 'required|numeric',
            'currency' => 'nullable|string|max:3',
        ]);

        $structure = SalaryStructure::create($validated);
        return $this->successResponse($structure, 'Salary structure created successfully.', 201);
    }

    // PUT /api/salary-structures/{id}
    public function update(Request $request, int $id): JsonResponse
    {
        $structure = SalaryStructure::find($id);
        if (!$structure) {
            return $this->errorResponse('Salary structure not found.', 404);
        }

        $validated = $request->validate([
            'job_level' => 'sometimes|required|string',
            'job_title' => 'sometimes|required|string',
            'min_salary' => 'sometimes|required|numeric',
            'max_salary' => 'sometimes|required|numeric',
            'currency' => 'sometimes|required|string|max:3',
        ]);

        $structure->update($validated);
        return $this->successResponse($structure, 'Salary structure updated successfully.');
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
}
