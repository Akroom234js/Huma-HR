<?php

namespace App\Jobs;

use App\Models\PerformanceCycle;
use App\Models\PerformanceTemplate;
use App\Models\EmployeeProfile;
use App\Models\PerformanceEvaluation;
use App\Models\PerformanceAction;
use App\Services\TaskPerformanceService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class ProcessPerformanceJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries   = 3;
    public int $timeout = 300;

    public function __construct(private readonly PerformanceCycle $cycle) {}

    public function handle(TaskPerformanceService $taskService): void
    {
        Log::info("ProcessPerformanceJob: Starting for cycle #{$this->cycle->id} — {$this->cycle->title}");

        // جلب القالب المرتبط بالدورة
        $template = $this->cycle->template ?: PerformanceTemplate::find($this->cycle->performance_template_id);
        if (!$template) {
            Log::error("ProcessPerformanceJob: Template not found for cycle #{$this->cycle->id}");
            $this->cycle->update(['status' => 'active']);
            return;
        }

        $config = $template->config;
        $components = collect($config['components'] ?? [])->filter(fn($c) => !empty($c['is_active']));

        // جلب جميع الموظفين النشطين مع التحميل المسبق للعلاقات لتفادي N+1
        $employees = EmployeeProfile::where('employment_status', 'active')
            ->with(['department'])
            ->get();

        foreach ($employees as $employee) {
            try {
                DB::transaction(function () use ($employee, $components, $taskService) {
                    $this->processEmployee($employee, $components, $taskService);
                });
            } catch (\Exception $e) {
                Log::error("ProcessPerformanceJob: Failed for employee #{$employee->id}: " . $e->getMessage());
            }
        }

        $this->cycle->update(['status' => 'completed']);

        Log::info("ProcessPerformanceJob: Completed for cycle #{$this->cycle->id}");
    }

    private function processEmployee(
        EmployeeProfile $employee,
        \Illuminate\Support\Collection $components,
        TaskPerformanceService $taskService
    ): void {
        $startDate = Carbon::parse($this->cycle->start_date);
        $endDate   = Carbon::parse($this->cycle->end_date);

        $taskScore = null;
        if ($components->has('tasks')) {
            $taskScore = $taskService->calculateAggregateScoreForEmployee(
                $employee->id, $startDate, $endDate, $components->get('tasks')
            ) ?? 0;
        }

        $managerScore = null;
        if ($components->has('manager')) {
            $managerEval = \App\Models\ManagerEvaluation::where('performance_cycle_id', $this->cycle->id)
                ->where('employee_profile_id', $employee->id)
                ->first();
            
            if ($managerEval) {
                $subWeights = $components->get('manager')['sub_components'] ?? [];
                $wProf = floatval($subWeights['professionalism']['weight'] ?? 33.33);
                $wResp = floatval($subWeights['responsibility']['weight'] ?? 33.33);
                $wProb = floatval($subWeights['problem_solving']['weight'] ?? 33.34);

                $weightedScore = ($managerEval->professionalism * ($wProf / 100))
                               + ($managerEval->responsibility * ($wResp / 100))
                               + ($managerEval->problem_solving * ($wProb / 100));
                
                $managerScore = round($weightedScore * 10, 2);
            } else {
                $managerScore = 0;
            }
        }

        $peerScore = null;
        if ($components->has('peer')) {
            $peerEvals = \App\Models\PeerEvaluation::where('performance_cycle_id', $this->cycle->id)
                ->where('employee_profile_id', $employee->id)
                ->get();
            if ($peerEvals->isNotEmpty()) {
                $avg = $peerEvals->avg(fn($p) => ($p->collaboration_score + $p->teamwork_score) / 2);
                $peerScore = round($avg * 10, 2);
            } else {
                $peerScore = 0;
            }
        }

        $attendanceScore = null;
        if ($components->has('attendance')) {
            $attendanceScore = $this->calculateAttendanceScore($employee->id, $startDate, $endDate, $components->get('attendance'));
        }

        $overtimeScore = null;
        if ($components->has('overtime')) {
            $overtimeScore = $this->calculateOvertimeScore($employee->id, $startDate, $endDate, $components->get('overtime'));
        }

        $selfScore = null;

        $scoreMap = [
            'tasks'           => $taskScore,
            'manager'         => $managerScore,
            'peer'            => $peerScore,
            'attendance'      => $attendanceScore,
            'overtime'        => $overtimeScore,
            'self_assessment' => $selfScore,
        ];

        $finalScore = 0.0;
        foreach ($components as $key => $component) {
            $score       = floatval($scoreMap[$key] ?? 0);
            $finalScore += ($score * floatval($component['weight'])) / 100;
        }
        $finalScore = round($finalScore, 2);

        $decision = $this->determineDecision($finalScore);

        // حفظ التقييم النهائي
        $evaluation = PerformanceEvaluation::updateOrCreate(
            [
                'performance_cycle_id' => $this->cycle->id,
                'employee_profile_id'  => $employee->id,
            ],
            [
                'department_id'     => $employee->department_id,
                'employment_status' => $employee->employment_status,
                'tasks_score'       => $taskScore,
                'manager_score'     => $managerScore,
                'peer_score'        => $peerScore,
                'attendance_score'  => $attendanceScore,
                'overtime_score'    => $overtimeScore,
                'self_score'        => $selfScore,
                'final_score'       => $finalScore,
                'status'            => 'evaluated',
                'evaluated_at'      => now(),
            ]
        );

        // إنشاء الإجراء التلقائي المقترح لـ HR
        if (! PerformanceAction::where('performance_evaluation_id', $evaluation->id)->exists()) {
            $hrProfile = EmployeeProfile::whereHas('user', function ($q) {
                $q->whereHas('roles', fn($r) => $r->where('name', 'hr')->where('guard_name', 'api'));
            })->first();

            PerformanceAction::create([
                'performance_evaluation_id' => $evaluation->id,
                'action_type'               => $this->decisionToActionType($decision),
                'details'                   => "Auto-generated. Final score: {$finalScore}. Decision: {$decision}.",
                'status'                    => 'pending_approval',
                'created_by'                => $hrProfile?->id ?? $employee->manager_id,
            ]);
        }
    }

    private function calculateAttendanceScore(int $employeeId, Carbon $start, Carbon $end, array $attendanceConfig): float
    {
        $records = \App\Models\AttendanceRecord::where('employee_profile_id', $employeeId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get();

        if ($records->isEmpty()) {
            return 0;
        }

        $sub = $attendanceConfig['sub_components'] ?? [];
        $ptsFull = intval($sub['points_full_attendance'] ?? 10);
        $ptsMinor = intval($sub['points_minor_late'] ?? 7);
        $ptsRepeated = intval($sub['points_repeated_late'] ?? 4);
        $ptsAbsent = intval($sub['points_absent'] ?? 0);

        $totalPoints = 0;
        foreach ($records as $record) {
            $totalPoints += match ($record->status) {
                'present'       => $ptsFull,
                'late'          => $ptsMinor,
                'repeated_late' => $ptsRepeated,
                'absent'        => $ptsAbsent,
                default         => round($ptsFull / 2),
            };
        }

        return round(($totalPoints / ($records->count() * $ptsFull)) * 100, 2);
    }

    private function calculateOvertimeScore(int $employeeId, Carbon $start, Carbon $end, array $overtimeConfig): float
    {
        $employee    = EmployeeProfile::find($employeeId);
        $deptHours   = \App\Models\DepartmentHour::where('dept', $employee?->department?->name)->first();
        $standardHrs = 8;

        if ($deptHours) {
            $startTime   = Carbon::parse($deptHours->start_time);
            $endTime     = Carbon::parse($deptHours->end_time);
            $standardHrs = $startTime->diffInHours($endTime);
        }

        $records = \App\Models\AttendanceRecord::where('employee_profile_id', $employeeId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get();

        $totalOvertimeHours = 0;
        foreach ($records as $record) {
            $totalOvertimeHours += max(0, floatval($record->hours_worked) - $standardHrs);
        }

        $sub = $overtimeConfig['sub_components'] ?? [];
        $multiplier = floatval($sub['multiplier'] ?? 2.00);
        $maxCap     = floatval($sub['max_score_cap'] ?? 100.00);

        return min($maxCap, round($totalOvertimeHours * $multiplier, 2));
    }

    private function determineDecision(float $score): string
    {
        return match (true) {
            $score >= 90 => 'promotion_bonus',
            $score >= 75 => 'bonus',
            $score >= 60 => 'training_required',
            default      => 'warning',
        };
    }

    private function decisionToActionType(string $decision): string
    {
        return match ($decision) {
            'promotion_bonus'  => 'promotion',
            'bonus'            => 'bonus',
            'training_required'=> 'training', // تم تحسينها إلى training بدلاً من warning
            default            => 'warning',
        };
    }

    public function failed(\Throwable $e): void
    {
        Log::critical("ProcessPerformanceJob: All attempts failed for cycle #{$this->cycle->id}: " . $e->getMessage());
        $this->cycle->update(['status' => 'active']);
    }
}

