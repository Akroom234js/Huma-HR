<?php

namespace App\Services;

use App\Models\PerformanceCycle;
use App\Models\PerformanceTemplate;
use App\Models\PerformanceEvaluation;
use App\Models\EmployeeProfile;
use App\Models\ManagerEvaluation;
use App\Models\PeerEvaluation;
use App\Services\TaskPerformanceService;
use App\Services\PeerEvaluationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

class PerformanceOrchestrationService
{
    public function __construct(
        private TaskPerformanceService $taskService,
        private PeerEvaluationService  $peerService,
    ) {}

    /**
     * حساب وحفظ تقييم موظف واحد في دورة محددة بناءً على القالب الديناميكي
     */
    public function evaluate(int $cycleId, int $employeeProfileId): PerformanceEvaluation
    {
        $cycle    = PerformanceCycle::findOrFail($cycleId);
        $employee = EmployeeProfile::findOrFail($employeeProfileId);

        $template = $cycle->template ?: PerformanceTemplate::findOrFail($cycle->performance_template_id);
        $components = $template->components ?? [];

        $startDate = Carbon::parse($cycle->start_date);
        $endDate   = Carbon::parse($cycle->end_date);

        // جمع الدرجات الفرعية
        $scores = [
            'tasks'           => null,
            'manager'         => null,
            'peer'            => null,
            'attendance'      => null,
            'overtime'        => null,
            'self_assessment' => null,
        ];

        // 1. حساب درجة المهام باستخدام الإعدادات الفرعية المستخرجة من القالب
        if (isset($components['tasks']) && $components['tasks']['is_active']) {
            $scores['tasks'] = $this->taskService->calculateAggregateScoreForEmployee(
                $employeeProfileId,
                $startDate,
                $endDate,
                $components['tasks']
            ) ?? 0;
        }

        // 2. حساب درجة المدير بالاعتماد على الأوزان الديناميكية للمكونات الفرعية
        if (isset($components['manager']) && $components['manager']['is_active']) {
            $managerEval = ManagerEvaluation::where('performance_cycle_id', $cycleId)
                ->where('employee_profile_id', $employeeProfileId)
                ->first();

            if ($managerEval) {
                $subWeights = $components['manager']['sub_components'] ?? [];

                $wProf = floatval($subWeights['professionalism']['weight'] ?? 33.33);
                $wResp = floatval($subWeights['responsibility']['weight'] ?? 33.33);
                $wProb = floatval($subWeights['problem_solving']['weight'] ?? 33.34);

                // حساب التقييم المرجح من 10 نقاط، ثم تحويلها لنسبة مئوية (ضرب بـ 10)
                $weightedScore = ($managerEval->professionalism * ($wProf / 100))
                               + ($managerEval->responsibility * ($wResp / 100))
                               + ($managerEval->problem_solving * ($wProb / 100));

                $scores['manager'] = round($weightedScore * 10, 2);
            } else {
                $scores['manager'] = 0;
            }
        }

        // 3. حساب درجة الزملاء
        if (isset($components['peer']) && $components['peer']['is_active']) {
            $scores['peer'] = $this->peerService->calculateRawPeerScore($cycleId, $employeeProfileId);
        }

        // 4. حساب درجة الحضور (سندمج سجل حضور الموظف لاحقاً)
        if (isset($components['attendance']) && $components['attendance']['is_active']) {
            $scores['attendance'] = 0;
        }

        // 5. حساب درجة العمل الإضافي
        if (isset($components['overtime']) && $components['overtime']['is_active']) {
            $scores['overtime'] = 0;
        }

        // ── حساب الدرجة النهائية المرجحة ────────────────────────
        $finalScore = 0.0;
        foreach ($components as $key => $component) {
            if (!empty($component['is_active'])) {
                $score = floatval($scores[$key] ?? 0);
                $weight = floatval($component['weight']);
                $finalScore += ($score * $weight) / 100;
            }
        }

        $finalScore = round($finalScore, 2);

        // حفظ أو تحديث الـ snapshot في قاعدة البيانات
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
