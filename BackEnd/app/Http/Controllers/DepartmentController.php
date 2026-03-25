<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;

use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

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
    }}
