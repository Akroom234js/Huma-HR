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
    // الموظف يشوف نتيجة تقييمه هو بس
    // GET /performance/my-evaluation
    // أي موظف مسجّل دخول
    // ─────────────────────────────────────────────────────────────
    public function myEvaluation(Request $request): JsonResponse
    {
        $employeeProfile = auth()->user()->employeeProfile;

        if (! $employeeProfile) {
            return $this->errorResponse('Employee profile not found.', null, 404);
        }

        // فلترة بالدورة إذا أُرسل cycle_id — وإلا يرجع آخر تقييم
        $query = PerformanceEvaluation::with(['performanceCycle', 'department'])
            ->where('employee_profile_id', $employeeProfile->id)
            ->where('status', 'evaluated');

        if ($request->has('cycle_id')) {
            $query->where('performance_cycle_id', $request->cycle_id);
        } else {
            $query->orderByDesc('id');
        }

        $evaluation = $query->first();

        if (! $evaluation) {
            return $this->successResponse(null, 'No evaluation found yet.');
        }

        return $this->successResponse(
            $this->formatEvaluation($evaluation),
            'Your performance evaluation retrieved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // HR يشوف نتائج كل الموظفين في دورة معينة
    // GET /performance/evaluations/{cycleId}
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function byCycle(int $cycleId): JsonResponse
    {
        $cycle = PerformanceCycle::find($cycleId);

        if (! $cycle) {
            return $this->errorResponse('Performance cycle not found.', null, 404);
        }

        $evaluations = PerformanceEvaluation::with(['employee', 'department', 'actions'])
            ->where('performance_cycle_id', $cycleId)
            ->get()
            ->map(fn($e) => $this->formatEvaluation($e));

        return $this->successResponse([
            'cycle' => [
                'id'     => $cycle->id,
                'title'  => $cycle->title,
                'status' => $cycle->status,
            ],
            'evaluations' => $evaluations,
            'summary' => [
                'total'    => $evaluations->count(),
                'evaluated'=> $evaluations->where('status', 'evaluated')->count(),
                'avg_score'=> round($evaluations->whereNotNull('final_score')->avg('final_score'), 2),
            ],
        ], 'Cycle evaluations retrieved successfully.');
    }

    // ─────────────────────────────────────────────────────────────
    // HR يشوف تقييم موظف محدد
    // GET /performance/evaluations/{cycleId}/{employeeId}
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function show(int $cycleId, int $employeeId): JsonResponse
    {
        $evaluation = PerformanceEvaluation::with([
            'performanceCycle',
            'employee',
            'department',
            'actions',
        ])
            ->where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeId)
            ->first();

        if (! $evaluation) {
            return $this->errorResponse(
                'No evaluation found for this employee in this cycle.',
                null,
                404
            );
        }

        return $this->successResponse(
            $this->formatEvaluation($evaluation),
            'Performance evaluation retrieved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Helper — تنسيق التقييم للـ response
    // ─────────────────────────────────────────────────────────────
    private function formatEvaluation(PerformanceEvaluation $evaluation): array
    {
        return [
            'id'                  => $evaluation->id,
            'cycle'               => $evaluation->performanceCycle ? [
                'id'         => $evaluation->performanceCycle->id,
                'title'      => $evaluation->performanceCycle->title,
                'start_date' => $evaluation->performanceCycle->start_date?->format('Y-m-d'),
                'end_date'   => $evaluation->performanceCycle->end_date?->format('Y-m-d'),
            ] : null,
            'employee'            => $evaluation->employee ? [
                'id'        => $evaluation->employee->id,
                'name'      => $evaluation->employee->full_name,
                'job_title' => $evaluation->employee->job_title,
            ] : null,
            'department'          => $evaluation->department?->name,
            'employment_status'   => $evaluation->employment_status,
            'status'              => $evaluation->status,

            // الدرجات الفرعية
            'scores' => [
                'tasks'      => $evaluation->tasks_score,
                'manager'    => $evaluation->manager_score,
                'peer'       => $evaluation->peer_score,
                'attendance' => $evaluation->attendance_score,
                'overtime'   => $evaluation->overtime_score,
                'self'       => $evaluation->self_score,
            ],

            'final_score'         => $evaluation->final_score,

            // القرار المقترح بناءً على الدرجة
            'decision'            => $this->determineDecision($evaluation->final_score),

            // AI
            'ai_analysis'         => $evaluation->ai_analysis,
            'ai_recommendations'  => $evaluation->ai_recommendations,

            // الإجراءات المرتبطة
            'actions'             => $evaluation->actions?->map(fn($a) => [
                'id'          => $a->id,
                'action_type' => $a->action_type,
                'status'      => $a->status,
                'details'     => $a->details,
            ]),

            'evaluated_at'        => $evaluation->evaluated_at?->format('Y-m-d H:i:s'),
        ];
    }

    private function determineDecision(?float $score): ?string
    {
        if (is_null($score)) return null;

        return match (true) {
            $score >= 90 => 'promotion',
            $score >= 75 => 'bonus',
            $score >= 60 => 'training_required',
            default      => 'warning',
        };
    }
}
