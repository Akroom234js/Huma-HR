<?php

namespace App\Http\Controllers;

use App\Models\PerformanceAction;
use App\Models\PerformanceEvaluation;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerformanceActionController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────────────────────
    // HR يشوف قائمة الإجراءات
    // GET /performance/actions
    // فلترة اختيارية: status, cycle_id
    // ─────────────────────────────────────────────────────────────
    public function index(Request $request): JsonResponse
    {
        $query = PerformanceAction::with([
            'evaluation.employee',
            'evaluation.performanceCycle',
            'creator',
            'approver',
        ])->latest();

        // فلترة بالحالة
        if ($request->has('status')) {
            $query->where('status', $request->status);
        } else {
            // افتراضياً يعرض المعلقة
            $query->where('status', 'pending_approval');
        }

        // فلترة بالدورة
        if ($request->has('cycle_id')) {
            $query->whereHas('evaluation', function ($q) use ($request) {
                $q->where('performance_cycle_id', $request->cycle_id);
            });
        }

        $actions = $query->get()->map(fn($a) => $this->formatAction($a));

        return $this->successResponse($actions, 'Performance actions retrieved successfully.');
    }

    // ─────────────────────────────────────────────────────────────
    // HR يوافق على إجراء
    // PUT /performance/actions/{action}/approve
    // ─────────────────────────────────────────────────────────────
    public function approve(Request $request, PerformanceAction $action): JsonResponse
    {
        if ($action->status !== 'pending_approval') {
            return $this->errorResponse(
                'This action has already been processed.',
                null,
                422
            );
        }

        $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $hrProfile = auth()->user()->employeeProfile;

        $action->update([
            'status'      => 'approved',
            'details'     => $request->notes ?? $action->details,
            'approved_by' => $hrProfile->id,
            'approved_at' => now(),
        ]);

        return $this->successResponse(
            $this->formatAction($action->fresh(['evaluation.employee', 'evaluation.performanceCycle', 'approver'])),
            'Performance action approved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // HR يرفض إجراء
    // PUT /performance/actions/{action}/reject
    // ─────────────────────────────────────────────────────────────
    public function reject(Request $request, PerformanceAction $action): JsonResponse
    {
        if ($action->status !== 'pending_approval') {
            return $this->errorResponse(
                'This action has already been processed.',
                null,
                422
            );
        }

        $request->validate([
            'notes' => ['nullable', 'string', 'max:1000'],
        ]);

        $hrProfile = auth()->user()->employeeProfile;

        $action->update([
            'status'      => 'rejected',
            'details'     => $request->notes ?? $action->details,
            'approved_by' => $hrProfile->id,
            'approved_at' => now(),
        ]);

        return $this->successResponse(
            $this->formatAction($action->fresh(['evaluation.employee', 'evaluation.performanceCycle', 'approver'])),
            'Performance action rejected.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Helper — تنسيق بيانات الإجراء للـ response
    // ─────────────────────────────────────────────────────────────
    private function formatAction(PerformanceAction $action): array
    {
        return [
            'id'          => $action->id,
            'action_type' => $action->action_type,
            'status'      => $action->status,
            'details'     => $action->details,
            'employee'    => $action->evaluation?->employee ? [
                'id'   => $action->evaluation->employee->id,
                'name' => $action->evaluation->employee->full_name,
            ] : null,
            'cycle'       => $action->evaluation?->performanceCycle ? [
                'id'    => $action->evaluation->performanceCycle->id,
                'title' => $action->evaluation->performanceCycle->title,
            ] : null,
            'final_score' => $action->evaluation?->final_score,
            'created_by'  => $action->creator ? [
                'id'   => $action->creator->id,
                'name' => $action->creator->full_name,
            ] : null,
            'approved_by' => $action->approver ? [
                'id'   => $action->approver->id,
                'name' => $action->approver->full_name,
            ] : null,
            'approved_at' => $action->approved_at?->format('Y-m-d H:i:s'),
            'created_at'  => $action->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
