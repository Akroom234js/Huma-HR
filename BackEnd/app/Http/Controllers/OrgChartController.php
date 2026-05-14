<?php

namespace App\Http\Controllers;

use App\Http\Requests\AssignEmployeeToPositionRequest;
use App\Http\Requests\MovePositionRequest;
use App\Http\Requests\StorePositionRequest;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\Position;
use App\Services\OrgChartService;
use Illuminate\Http\JsonResponse;

class OrgChartController extends Controller
{
    public function __construct(private OrgChartService $service) {}

    // ── GET /api/org-chart ─────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        $positions = Position::with([
            'department:id,name',
            'employee:id,position_id,full_name,job_title,profile_pic',
        ])->get();

        return response()->json(['data' => $this->service->buildChartData($positions)]);
    }

    // ── GET /api/org-chart/department/{id} ────────────────────────────────
    public function byDepartment(int $id): JsonResponse
    {
        abort_unless(Department::find($id), 404, 'Department not found.');

        $positions = Position::with([
            'department:id,name',
            'employee:id,position_id,full_name,job_title,profile_pic',
        ])->where('department_id', $id)->get();

        return response()->json(['data' => $this->service->buildChartData($positions)]);
    }

    // ── POST /api/positions ───────────────────────────────────────────────
    public function store(StorePositionRequest $request): JsonResponse
    {
        $data = $request->validated();

        if (isset($data['parent_position_id']) && $data['parent_position_id']) {
            if ($this->service->wouldCreateCycle(0, $data['parent_position_id'])) {
                return response()->json(['message' => 'This would create a cycle in the hierarchy.'], 422);
            }
        }

        $position = Position::create($data);
        $position->update(['hierarchy_level' => $this->service->recalculateLevel($position)]);

        return response()->json(['data' => $position], 201);
    }

    // ── PUT /api/positions/{position} ─────────────────────────────────────
    public function update(StorePositionRequest $request, Position $position): JsonResponse
    {
        $data = $request->validated();

        $newParent = $data['parent_position_id'] ?? $position->parent_position_id;
        if ($this->service->wouldCreateCycle($position->id, $newParent)) {
            return response()->json(['message' => 'This would create a cycle in the hierarchy.'], 422);
        }

        $position->update($data);
        $position->update(['hierarchy_level' => $this->service->recalculateLevel($position)]);
        $this->service->updateDescendantLevels($position->load('children'), $position->hierarchy_level);

        return response()->json(['data' => $position]);
    }

    // ── PATCH /api/positions/{position}/move ──────────────────────────────
    public function move(MovePositionRequest $request, Position $position): JsonResponse
    {
        $newParentId = $request->validated()['parent_position_id'];

        if ($this->service->wouldCreateCycle($position->id, $newParentId)) {
            return response()->json(['message' => 'Moving this position would create a cycle.'], 422);
        }

        $position->update(['parent_position_id' => $newParentId]);
        $newLevel = $this->service->recalculateLevel($position);
        $this->service->updateDescendantLevels($position->load('children'), $newLevel);

        return response()->json(['data' => $position->fresh()]);
    }

    // ── DELETE /api/positions/{position} ──────────────────────────────────
    public function destroy(Position $position): JsonResponse
    {
        // Employees referencing this position will be nulled via DB constraint (nullOnDelete)
        // Children positions: parent becomes null (nullOnDelete on FK)
        $position->delete();

        return response()->json(null, 204);
    }

    // ── PATCH /api/positions/{position}/assign ────────────────────────────
    public function assign(AssignEmployeeToPositionRequest $request, Position $position): JsonResponse
    {
        $employeeId = $request->validated()['employee_profile_id'];

        // Vacate the position's current occupant
        EmployeeProfile::where('position_id', $position->id)
            ->update(['position_id' => null]);

        // Unassign employee from their previous position
        $employee = EmployeeProfile::findOrFail($employeeId);
        $employee->update(['position_id' => $position->id]);

        return response()->json(['message' => 'Employee assigned successfully.']);
    }

    // ── PATCH /api/positions/{position}/unassign ──────────────────────────
    public function unassign(Position $position): JsonResponse
    {
        EmployeeProfile::where('position_id', $position->id)
            ->update(['position_id' => null]);

        return response()->json(['message' => 'Position is now vacant.']);
    }
}
