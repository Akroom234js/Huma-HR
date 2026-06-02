<?php

namespace App\Services;

use App\Models\PerformanceCycle;
use App\Models\PerformanceEvaluation;
use App\Models\EmployeeProfile;
use App\Models\ManagerEvaluation;
use App\Models\PeerEvaluation;
use App\Services\TaskPerformanceService;
use App\Services\PeerEvaluationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class PerformanceOrchestrationService
{
    public function __construct(
        private TaskPerformanceService $taskService,
        private PeerEvaluationService  $peerService,
    ) {}

    // ─────────────────────────────────────────────────────────────
    // حساب وحفظ تقييم موظف واحد في دورة محددة
    // يُستدعى من ProcessPerformanceJob
    // ─────────────────────────────────────────────────────────────
    public function evaluate(int $cycleId, int $employeeProfileId): PerformanceEvaluation
    {
        $cycle    = PerformanceCycle::findOrFail($cycleId);
        $employee = EmployeeProfile::findOrFail($employeeProfileId);

        // جلب المكونات المفعلة وأوزانها
        $components = $cycle->components()
            ->where('is_active', true)
            ->pluck('weight', 'component_key'); // ['tasks' => 40, 'manager' => 25, ...]

        // ✅ Carbon::parse() لتحويل التاريخ بشكل صحيح
        $startDate = Carbon::parse($cycle->start_date);
        $endDate   = Carbon::parse($cycle->end_date);

        // ── جمع الدرجات الفرعية ──────────────────────────────────
        $scores = [
            'tasks'           => null,
            'manager'         => null,
            'peer'            => null,
            'attendance'      => null,
            'overtime'        => null,
            'self_assessment' => null,
        ];

        if ($components->has('tasks')) {
            $scores['tasks'] = $this->taskService->calculateAggregateScoreForEmployee(
                $employeeProfileId,
                $startDate,
                $endDate
            ) ?? 0;
        }

        if ($components->has('manager')) {
            $managerEval = ManagerEvaluation::where('performance_cycle_id', $cycleId)
                ->where('employee_profile_id', $employeeProfileId)
                ->first();
            $scores['manager'] = $managerEval?->final_score ?? 0;
        }

        if ($components->has('peer')) {
            $scores['peer'] = $this->peerService->calculateRawPeerScore($cycleId, $employeeProfileId);
        }

        // ── حساب الدرجة النهائية المرجحة ────────────────────────
        $finalScore = 0.0;

        foreach ($components as $key => $weight) {
            $score       = floatval($scores[$key] ?? 0);
            $finalScore += ($score * $weight) / 100;
        }

        $finalScore = round($finalScore, 2);

        // ── حفظ أو تحديث الـ snapshot ───────────────────────────
        return DB::transaction(function () use (
            $cycleId, $employeeProfileId, $employee,
            $scores, $finalScore
        ) {
            return PerformanceEvaluation::updateOrCreate(
                [
                    'performance_cycle_id' => $cycleId,
                    'employee_profile_id'  => $employeeProfileId,
                ],
                [
                    'department_id'     => $employee->department_id,
                    'employment_status' => $employee->employment_status,
                    'tasks_score'       => $scores['tasks'],
                    'manager_score'     => $scores['manager'],
                    'peer_score'        => $scores['peer'],
                    'attendance_score'  => $scores['attendance'],
                    'overtime_score'    => $scores['overtime'],
                    'self_score'        => $scores['self_assessment'],
                    'final_score'       => $finalScore,
                    'status'            => 'evaluated',
                    'evaluated_at'      => now(),
                ]
            );
        });
    }
}
