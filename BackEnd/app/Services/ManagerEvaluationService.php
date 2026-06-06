<?php

namespace App\Services;

use App\Models\ManagerEvaluation;
use App\Models\PerformanceCycle;
use App\Models\EmployeeProfile;
use Illuminate\Support\Facades\Log;

class ManagerEvaluationService
{
    /**
     * Store a manager evaluation. Only one submission per manager per employee per cycle is allowed.
     * Assumes the manager is identified by $managerId (user id) and the evaluatee is $employeeId.
     */
    public function storeEvaluation(int $cycleId, int $managerId, int $employeeId, int $score, ?string $comment = null): ManagerEvaluation
    {
        // Prevent duplicate submission
        $exists = ManagerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('manager_id', $managerId)
            ->where('employee_profile_id', $employeeId)
            ->exists();
        if ($exists) {
            throw new \Exception('Manager has already evaluated this employee in this cycle.');
        }

        return ManagerEvaluation::create([
            'performance_cycle_id' => $cycleId,
            'manager_id'           => $managerId,
            'employee_profile_id'  => $employeeId,
            'score'                => $score,
            'comment'              => $comment,
        ]);
    }

    /**
     * Get average manager score per employee for a given cycle.
     */
    public function averageScores(int $cycleId): array
    {
        return ManagerEvaluation::where('performance_cycle_id', $cycleId)
            ->get()
            ->groupBy('employee_profile_id')
            ->map(fn($group) => round($group->avg('score'), 2))
            ->toArray(); // [employeeId => avgScore]
    }

    /**
     * Calculate weighted manager score based on sub‑component configuration.
     *
     * @param int   $cycleId   ID of the performance cycle.
     * @param int   $employeeId ID of the employee being evaluated.
     * @param array $managerComponentConfig Config array containing sub_components with weights.
     * @return float Weighted score rounded to 2 decimals.
     */
    public function calculateManagerScore(int $cycleId, int $employeeId, array $managerComponentConfig): float
    {
        $managerEval = ManagerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeId)
            ->first();

        if (!$managerEval) {
            return 0.0;
        }

        $subWeights = $managerComponentConfig['sub_components'] ?? [];
        $wProf = floatval($subWeights['professionalism']['weight'] ?? 33.33);
        $wResp = floatval($subWeights['responsibility']['weight'] ?? 33.33);
        $wProb = floatval($subWeights['problem_solving']['weight'] ?? 33.34);

        $weightedScore = ($managerEval->professionalism * ($wProf / 100))
                       + ($managerEval->responsibility * ($wResp / 100))
                       + ($managerEval->problem_solving * ($wProb / 100));

        return round($weightedScore * 10, 2);
    }
}
?>
