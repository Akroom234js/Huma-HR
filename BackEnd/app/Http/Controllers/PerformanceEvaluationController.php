<?php

namespace App\Http\Controllers;

use App\Models\PerformanceEvaluation;
use App\Models\PerformanceCycle;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PerformanceEvaluationController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────────────────────
    // HR يشوف قائمة تقييمات جميع الموظفين في دورة معينة
    // GET /performance/evaluations/{cycleId}
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function index(Request $request, int $cycleId): JsonResponse
    {
        $cycle = PerformanceCycle::findOrFail($cycleId);

        $query = PerformanceEvaluation::with(['employee', 'performanceCycle'])
            ->where('performance_cycle_id', $cycleId);

        // فلترة بالقسم (اختياري)
        if ($request->has('department_id')) {
            $query->where('department_id', $request->department_id);
        }

        // فلترة بنطاق الدرجة (اختياري)
        if ($request->has('min_score')) {
            $query->where('final_score', '>=', $request->min_score);
        }
        if ($request->has('max_score')) {
            $query->where('final_score', '<=', $request->max_score);
        }

        // ترتيب بالدرجة الأعلى أولاً
        $evaluations = $query->orderByDesc('final_score')->get()
            ->map(fn($e) => $this->formatEvaluation($e));

        return $this->successResponse(
            [
                'cycle'       => [
                    'id'     => $cycle->id,
                    'title'  => $cycle->title,
                    'status' => $cycle->status,
                ],
                'total'       => $evaluations->count(),
                'evaluations' => $evaluations,
            ],
            'Performance evaluations retrieved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // HR/Manager/Employee يشوف تقييم موظف بعينه
    // GET /performance/evaluations/{cycleId}/{employeeId}
    // ─────────────────────────────────────────────────────────────
    public function show(int $cycleId, int $employeeId): JsonResponse
    {
        $evaluation = PerformanceEvaluation::with([
            'employee',
            'performanceCycle',
            'performanceAction',
        ])
        ->where('performance_cycle_id', $cycleId)
        ->where('employee_profile_id', $employeeId)
        ->firstOrFail();

        return $this->successResponse(
            $this->formatEvaluation($evaluation, detailed: true),
            'Performance evaluation retrieved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Helper — تنسيق بيانات التقييم للـ response
    // ─────────────────────────────────────────────────────────────
    private function formatEvaluation(PerformanceEvaluation $eval, bool $detailed = false): array
    {
        $data = [
            'id'           => $eval->id,
            'employee'     => $eval->employee ? [
                'id'                => $eval->employee->id,
                'name'              => $eval->employee->full_name,
                'employment_status' => $eval->employment_status,
            ] : null,
            'department_id' => $eval->department_id,
            'scores'        => [
                'tasks'      => $eval->tasks_score,
                'manager'    => $eval->manager_score,
                'peer'       => $eval->peer_score,
                'attendance' => $eval->attendance_score,
                'overtime'   => $eval->overtime_score,
                'self'       => $eval->self_score,
                'final'      => $eval->final_score,
            ],
            'status'       => $eval->status,
            'evaluated_at' => $eval->evaluated_at?->format('Y-m-d H:i:s'),
        ];

        // عرض الـ action المقترح في التفاصيل الكاملة
        if ($detailed && $eval->performanceAction) {
            $action = $eval->performanceAction;
            $data['action'] = [
                'id'          => $action->id,
                'action_type' => $action->action_type,
                'status'      => $action->status,
                'details'     => $action->details,
                'approved_at' => $action->approved_at?->format('Y-m-d H:i:s'),
            ];
        }

        return $data;
    }
}
