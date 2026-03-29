<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePositionRequest;
use App\Http\Requests\UpdatePositionRequest;
use App\Http\Resources\PositionResource;
use App\Models\Position;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PositionController extends Controller
{
    use ApiResponse;

    // ── GET /api/positions ────────────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr|manager
    public function index(Request $request): JsonResponse
    {
        $positions = Position::with('department')
            ->withCount('jobPostings as openings')
            ->when($request->filled('search'),
                fn($q) => $q->search($request->search)
            )
            ->when($request->filled('department_id'),
                fn($q) => $q->byDepartment((int) $request->department_id)
            )
            ->orderBy('title')
            ->paginate($request->get('per_page', 15));

        return $this->successResponse(
            data: [
                'positions'  => PositionResource::collection($positions)->resolve(),
                'pagination' => [
                    'total'        => $positions->total(),
                    'per_page'     => $positions->perPage(),
                    'current_page' => $positions->currentPage(),
                    'last_page'    => $positions->lastPage(),
                ],
            ],
            message: 'Positions retrieved successfully.'
        );
    }

    // ── GET /api/positions/{id} ───────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr|manager
    public function show(int $id): JsonResponse
    {
        $position = Position::with('department')->find($id);

        if (! $position) {
            return $this->errorResponse(
                message: 'Position not found.',
                statusCode: 404
            );
        }

        return $this->successResponse(
            data: new PositionResource($position),
            message: 'Position retrieved successfully.'
        );
    }

    // ── POST /api/positions ───────────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function store(StorePositionRequest $request): JsonResponse
    {
        $position = Position::create($request->validated());

        return $this->successResponse(
            data: new PositionResource($position->load('department')),
            message: 'Position created successfully.',
            statusCode: 201
        );
    }

    // ── PUT /api/positions/{id} ───────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function update(UpdatePositionRequest $request, int $id): JsonResponse
    {
        $position = Position::find($id);

        if (! $position) {
            return $this->errorResponse(
                message: 'Position not found.',
                statusCode: 404
            );
        }

        $position->update($request->validated());

        return $this->successResponse(
            data: new PositionResource($position->fresh('department')),
            message: 'Position updated successfully.'
        );
    }

    // ── DELETE /api/positions/{id} ────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function destroy(int $id): JsonResponse
    {
        $position = Position::find($id);

        if (! $position) {
            return $this->errorResponse(
                message: 'Position not found.',
                statusCode: 404
            );
        }

        // تحقق إن ما في موظفين بهذا المنصب
        $inUse = \App\Models\EmployeeProfile::where('job_title', $position->title)->exists();

        if ($inUse) {
            return $this->errorResponse(
                message: 'Cannot delete — this position is assigned to one or more employees.',
                statusCode: 422
            );
        }

        $position->delete();

        return $this->successResponse(
            message: 'Position deleted successfully.'
        );
    }
}
