<?php

namespace App\Http\Controllers;

use App\Models\PerformanceCycle;
use App\Models\PerformanceEvaluation;
use App\Models\PerformanceAction;
use App\Models\Task;
use App\Models\Department;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class PerformanceStatsController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────────────────────
    // إحصائيات عامة للـ HR Dashboard
    // GET /performance/stats
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        // ── الدورة النشطة ─────────────────────────────────────────
        $activeCycle = PerformanceCycle::where('status', 'active')
            ->with('template')
            ->latest()
            ->first();

        // ── إحصائيات الدورات ──────────────────────────────────────
        $cycleStats = [
            'active'     => PerformanceCycle::where('status', 'active')->count(),
            'processing' => PerformanceCycle::where('status', 'processing')->count(),
            'completed'  => PerformanceCycle::where('status', 'completed')->count(),
            'draft'      => PerformanceCycle::where('status', 'draft')->count(),
        ];

        // ── إحصائيات المهام ───────────────────────────────────────
        $taskStats = [
            'pending'        => Task::where('status', 'pending')->count(),
            'in_progress'    => Task::where('status', 'in_progress')->count(),
            'pending_review' => Task::where('status', 'pending_review')->count(),
            'needs_revision' => Task::where('status', 'needs_revision')->count(),
            'scored'         => Task::where('status', 'scored')->count(),
            'overdue'        => Task::where('status', 'overdue')->count(),
        ];

        // ── إحصائيات الإجراءات المعلقة ───────────────────────────
        $pendingActions = PerformanceAction::where('status', 'pending_approval')->count();

        // ── متوسط الدرجات النهائية (آخر دورة مكتملة) ────────────
        $avgScore = null;
        $lastCompleted = PerformanceCycle::where('status', 'completed')->latest()->first();

        if ($lastCompleted) {
            $avgScore = PerformanceEvaluation::where('performance_cycle_id', $lastCompleted->id)
                ->where('status', 'evaluated')
                ->avg('final_score');
            $avgScore = $avgScore ? round($avgScore, 2) : null;
        }

        // ── متوسط تقييم الأقسام (آخر دورة مكتملة) ───────────────
        $departmentAverages = [];
        if ($lastCompleted) {
            $deptScores = PerformanceEvaluation::where('performance_cycle_id', $lastCompleted->id)
                ->where('status', 'evaluated')
                ->with('department')
                ->get()
                ->groupBy('department_id')
                ->map(function ($evals) {
                    $dept = $evals->first()->department;
                    return [
                        'department_id'   => $dept?->id,
                        'department_name' => $dept?->name,
                        'avg_score'       => round($evals->avg('final_score'), 2),
                        'employees_count' => $evals->count(),
                    ];
                })
                ->values();

            $departmentAverages = $deptScores;
        }

        // ── نسبة الإنجاز في الدورة النشطة ────────────────────────
        $completionRate = null;
        if ($activeCycle) {
            $totalEvals    = PerformanceEvaluation::where('performance_cycle_id', $activeCycle->id)->count();
            $evaluatedEvals = PerformanceEvaluation::where('performance_cycle_id', $activeCycle->id)
                ->where('status', 'evaluated')
                ->count();

            $completionRate = $totalEvals > 0
                ? round(($evaluatedEvals / $totalEvals) * 100, 2)
                : 0;
        }

        return $this->successResponse([
            'active_cycle' => $activeCycle ? [
                'id'         => $activeCycle->id,
                'title'      => $activeCycle->title,
                'start_date' => $activeCycle->start_date?->format('Y-m-d'),
                'end_date'   => $activeCycle->end_date?->format('Y-m-d'),
                'status'     => $activeCycle->status,
            ] : null,
            'cycles'              => $cycleStats,
            'tasks'               => $taskStats,
            'pending_actions'     => $pendingActions,
            'avg_score'           => $avgScore,
            'completion_rate'     => $completionRate,
            'department_averages' => $departmentAverages,
        ], 'Performance statistics retrieved successfully.');
    }
}
