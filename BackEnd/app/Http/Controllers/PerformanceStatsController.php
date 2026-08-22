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

        // ── متوسط الدرجات النهائية ────────────────────────────
        $avgScore = null;
        $evalQuery = PerformanceEvaluation::where('status', 'evaluated');
        if ($activeCycle) {
            $evalQuery->where('performance_cycle_id', $activeCycle->id);
        }
        
        $avgEvalScore = $evalQuery->avg('final_score');
        if ($avgEvalScore) {
            $avgScore = round($avgEvalScore, 2);
        } else {
            // حساب متوسط تقييم المهام المسجلة فعلياً
            $scoredTasks = Task::where('status', 'scored')->get();
            if ($scoredTasks->count() > 0) {
                $avgScore = round($scoredTasks->avg(fn($t) => $t->task_score), 2);
            }
        }

        // ── متوسط تقييم الأقسام من جداول قاعدة البيانات ────────
        $departments = Department::with(['employees'])->get();
        $departmentAverages = $departments->map(function ($dept) use ($activeCycle) {
            $empIds = $dept->employees->pluck('id');
            
            // هل يوجد تقييمات موحدة للدورة في هذا القسم؟
            $evalScore = PerformanceEvaluation::whereIn('employee_profile_id', $empIds)
                ->when($activeCycle, fn($q) => $q->where('performance_cycle_id', $activeCycle->id))
                ->where('status', 'evaluated')
                ->avg('final_score');

            if ($evalScore !== null && $evalScore > 0) {
                $finalDeptScore = round($evalScore, 2);
            } else {
                // حساب متوسط درجات مهام موظفي هذا القسم
                $deptScoredTasks = Task::whereIn('employee_profile_id', $empIds)
                    ->where('status', 'scored')
                    ->get();

                if ($deptScoredTasks->count() > 0) {
                    $finalDeptScore = round($deptScoredTasks->avg(fn($t) => $t->task_score), 2);
                } else {
                    $finalDeptScore = 0;
                }
            }

            return [
                'department_id'   => $dept->id,
                'department_name' => $dept->name,
                'avg_score'       => $finalDeptScore,
                'employees_count' => $dept->employees->count(),
            ];
        })->values();

        // ── نسبة الإنجاز ─────────────────────────────────────────
        $completionRate = 0;
        if ($activeCycle) {
            $totalEvals = PerformanceEvaluation::where('performance_cycle_id', $activeCycle->id)->count();
            $evaluatedEvals = PerformanceEvaluation::where('performance_cycle_id', $activeCycle->id)
                ->where('status', 'evaluated')
                ->count();

            if ($totalEvals > 0) {
                $completionRate = round(($evaluatedEvals / $totalEvals) * 100, 2);
            }
        }

        if ($completionRate === 0) {
            $totalTasks = Task::count();
            $completedTasks = Task::whereIn('status', ['scored', 'pending_review'])->count();
            if ($totalTasks > 0) {
                $completionRate = round(($completedTasks / $totalTasks) * 100, 2);
            }
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
