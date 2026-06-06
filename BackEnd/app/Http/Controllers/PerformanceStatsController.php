<?php

namespace App\Http\Controllers;

use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\PerformanceCycle;
use App\Models\PerformanceEvaluation;
use App\Models\Task;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PerformanceStatsController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────────────────────
    // HR يجلب إحصائيات عامة عن الشركة (Company Overview)
    // GET /api/performance/stats
    // HR فقط
    // يُعيد:
    //   - إجمالي الموظفين
    //   - معلومات الدورة النشطة (اسمها + نسبة الإنجاز)
    //   - إحصائيات المهام (حالاتها)
    //   - معدل تقييم كل قسم (لرسم PerformanceDepartment)
    //   - نسبة حالات المهام (لرسم TaskStatusPool)
    //   - ملخص الدورات (الحالية والسابقة) لجدول CycleTable
    // ─────────────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        // ── 1. الدورة النشطة حالياً ──────────────────────────────
        $activeCycle = PerformanceCycle::with('template')
            ->where('status', 'active')
            ->latest()
            ->first();

        // ── 2. إجمالي الموظفين النشطين ───────────────────────────
        $totalEmployees = EmployeeProfile::where('employment_status', 'active')->count();

        // ── 3. إحصائيات المهام ────────────────────────────────────
        $taskStats = Task::select('status', DB::raw('count(*) as count'))
            ->groupBy('status')
            ->pluck('count', 'status')
            ->toArray();

        $totalTasks     = array_sum($taskStats);
        $completedTasks = ($taskStats['scored'] ?? 0) + ($taskStats['completed'] ?? 0);
        $completionRate = $totalTasks > 0
            ? round(($completedTasks / $totalTasks) * 100, 1)
            : 0;

        // تنسيق حالات المهام لرسم TaskStatusPool (الدائري)
        $taskStatusPool = [
            ['label' => 'مقيّمة',          'key' => 'scored',         'count' => $taskStats['scored']         ?? 0],
            ['label' => 'مكتملة',          'key' => 'completed',      'count' => $taskStats['completed']      ?? 0],
            ['label' => 'بانتظار المراجعة','key' => 'pending_review', 'count' => $taskStats['pending_review'] ?? 0],
            ['label' => 'قيد التنفيذ',     'key' => 'in_progress',    'count' => $taskStats['in_progress']    ?? 0],
            ['label' => 'معلقة',           'key' => 'pending',        'count' => $taskStats['pending']        ?? 0],
            ['label' => 'بحاجة مراجعة',   'key' => 'revision',       'count' => $taskStats['revision']       ?? 0],
        ];

        // ── 4. معدل تقييم الأقسام (لرسم PerformanceDepartment) ──
        $departmentAverages = [];

        if ($activeCycle) {
            // نجلب متوسط final_score لكل قسم في الدورة النشطة
            $deptScores = PerformanceEvaluation::select(
                    'department_id',
                    DB::raw('ROUND(AVG(final_score), 2) as avg_score'),
                    DB::raw('COUNT(*) as employee_count')
                )
                ->where('performance_cycle_id', $activeCycle->id)
                ->whereNotNull('final_score')
                ->groupBy('department_id')
                ->get();

            // جلب أسماء الأقسام
            $deptIds   = $deptScores->pluck('department_id')->filter()->unique()->values();
            $deptNames = Department::whereIn('id', $deptIds)->pluck('name', 'id');

            foreach ($deptScores as $row) {
                $departmentAverages[] = [
                    'department_id'   => $row->department_id,
                    'department_name' => $deptNames[$row->department_id] ?? 'غير محدد',
                    'avg_score'       => (float) $row->avg_score,
                    'employee_count'  => $row->employee_count,
                ];
            }
        }

        // ── 5. ملخص الدورات لجدول CycleTable ─────────────────────
        $cycles = PerformanceCycle::select(
                'id', 'title', 'status', 'start_date', 'end_date'
            )
            ->orderByDesc('created_at')
            ->limit(10)
            ->get()
            ->map(function ($c) {
                // نسبة الإنجاز = عدد الموظفين اللي اتقيّموا / الكل
                $totalEvals   = PerformanceEvaluation::where('performance_cycle_id', $c->id)->count();
                $scoredEvals  = PerformanceEvaluation::where('performance_cycle_id', $c->id)
                    ->whereNotNull('final_score')
                    ->count();
                $cycleCompletion = $totalEvals > 0
                    ? round(($scoredEvals / $totalEvals) * 100, 1)
                    : 0;

                return [
                    'id'              => $c->id,
                    'title'           => $c->title,
                    'status'          => $c->status,
                    'start_date'      => $c->start_date?->format('Y-m-d'),
                    'end_date'        => $c->end_date?->format('Y-m-d'),
                    'total_employees' => $totalEvals,
                    'completion_rate' => $cycleCompletion,
                ];
            });

        // ── 6. إحصائيات الدورة النشطة للـ Cards ──────────────────
        $activeCycleStats = null;
        if ($activeCycle) {
            $totalInCycle  = PerformanceEvaluation::where('performance_cycle_id', $activeCycle->id)->count();
            $scoredInCycle = PerformanceEvaluation::where('performance_cycle_id', $activeCycle->id)
                ->whereNotNull('final_score')
                ->count();

            $activeCycleStats = [
                'id'              => $activeCycle->id,
                'title'           => $activeCycle->title,
                'template_name'   => $activeCycle->template?->name,
                'start_date'      => $activeCycle->start_date?->format('Y-m-d'),
                'end_date'        => $activeCycle->end_date?->format('Y-m-d'),
                'total_employees' => $totalInCycle,
                'scored'          => $scoredInCycle,
                'completion_rate' => $totalInCycle > 0
                    ? round(($scoredInCycle / $totalInCycle) * 100, 1)
                    : 0,
            ];
        }

        // ── Build Response ────────────────────────────────────────
        return $this->successResponse([
            // Cards
            'total_employees'    => $totalEmployees,
            'active_cycle'       => $activeCycleStats,
            'task_completion_rate' => $completionRate,

            // Charts
            'task_status_pool'   => $taskStatusPool,        // TaskStatusPool.jsx
            'department_averages'=> $departmentAverages,    // PerformanceDepartment.jsx

            // Tables
            'cycles'             => $cycles,                // CycleTable.jsx
        ], 'Performance stats retrieved successfully.');
    }
}
