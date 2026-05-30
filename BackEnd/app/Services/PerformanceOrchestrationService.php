<?php

namespace App\Services;

use App\Models\PerformanceCycle;
use App\Models\PerformanceEvaluation;
use App\Models\EmployeeProfile;
use App\Services\TaskPerformanceService;
use App\Services\ManagerEvaluationService;
use App\Services\PeerEvaluationService;
use App\Services\AttendanceService;

class PerformanceOrchestrationService
{
    protected $taskService;
    protected $managerService;
    protected $peerService;
    protected $attendanceService;

    public function __construct(
        TaskPerformanceService $taskService,
        ManagerEvaluationService $managerService,
        PeerEvaluationService $peerService,
        AttendanceService $attendanceService
    ) {
        $this->taskService = $taskService;
        $this->managerService = $managerService;
        $this->peerService = $peerService;
        $this->attendanceService = $attendanceService;
    }

    /**
     * Compute and persist the overall performance evaluation for an employee in a specific cycle.
     */
    public function evaluate(int $cycleId, int $employeeProfileId): PerformanceEvaluation
    {
        $cycle = PerformanceCycle::findOrFail($cycleId);
        $components = $cycle->components()->pluck('weight', 'component'); // e.g., ['task'=>15, 'manager'=>30,...]

        // Retrieve sub‑scores from specialized services
        $taskScore = $this->taskService->calculateAggregateScoreForEmployee($employeeProfileId, $cycle->start_date, $cycle->end_date);
        $managerScore = $this->managerService->calculateScore($employeeProfileId, $cycleId);
        $peerScore = $this->peerService->calculateScore($employeeProfileId, $cycleId);
        $attendanceScore = $this->attendanceService->calculateScore($employeeProfileId, $cycleId);

        // Apply weighting (default to 0 if component missing)
        $total = 0.0;
        $total += ($components['task'] ?? 0) * ($taskScore ?? 0) / 100;
        $total += ($components['manager'] ?? 0) * ($managerScore ?? 0) / 100;
        $total += ($components['peer'] ?? 0) * ($peerScore ?? 0) / 100;
        $total += ($components['attendance'] ?? 0) * ($attendanceScore ?? 0) / 100;

        // Persist (create or update)
        return DB::transaction(function () use ($cycleId, $employeeProfileId, $taskScore, $managerScore, $peerScore, $attendanceScore, $total) {
            $evaluation = PerformanceEvaluation::updateOrCreate(
                [
                    'performance_cycle_id' => $cycleId,
                    'employee_profile_id'   => $employeeProfileId,
                ],
                [
                    'task_score'       => $taskScore,
                    'manager_score'    => $managerScore,
                    'peer_score'       => $peerScore,
                    'attendance_score' => $attendanceScore,
                    'total_score'      => $total,
                ]
            );
            return $evaluation;
        });
    }
}

?>
