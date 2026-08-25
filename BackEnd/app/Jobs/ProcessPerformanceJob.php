<?php

namespace App\Jobs;

use App\Models\PerformanceCycle;
use App\Models\PerformanceTemplate;
use App\Models\EmployeeProfile;
use App\Models\PerformanceEvaluation;
use App\Models\PerformanceAction;
use App\Models\AttendanceRecord;
use App\Models\DepartmentHour;
use App\Services\TaskPerformanceService;
use App\Services\PeerEvaluationService;
use App\Services\ManagerEvaluationService;
use App\Services\AIPerformanceCoachingService;
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

    public function handle(
        TaskPerformanceService    $taskService,
        PeerEvaluationService     $peerService,
        ManagerEvaluationService  $managerService,
        AIPerformanceCoachingService $aiCoachingService
    ): void {
        Log::info("ProcessPerformanceJob: Starting for cycle #{$this->cycle->id} — {$this->cycle->title}");

        $template = $this->cycle->template ?: PerformanceTemplate::find($this->cycle->performance_template_id);

        if (! $template || ! $template->components) {
            Log::error("ProcessPerformanceJob: Template not found for cycle #{$this->cycle->id}");
            $this->cycle->update(['status' => 'active']);
            return;
        }

        // ✅ components — مش config
        $components = collect($template->components ?? [])->filter(fn($c) => !empty($c['is_active']));

        // ✅ تجميع كل درجات peer دفعة واحدة لتفادي N+1
        $peerScores = $components->has('peer')
            ? $peerService->aggregateScores($this->cycle->id)
            : [];

        $employees = EmployeeProfile::where('employment_status', 'active')
            ->with(['department'])
            ->get();

        foreach ($employees as $employee) {
            try {
                $this->processEmployee($employee, $components, $taskService, $managerService, $peerScores, $aiCoachingService);
            } catch (\Exception $e) {
                Log::error("ProcessPerformanceJob: Failed for employee #{$employee->id}: " . $e->getMessage());
            }
        }

        $this->cycle->update(['status' => 'completed']);

        Log::info("ProcessPerformanceJob: Completed for cycle #{$this->cycle->id} — status set to completed.");
    }

    private function processEmployee(
        EmployeeProfile $employee,
        \Illuminate\Support\Collection $components,
        TaskPerformanceService   $taskService,
        ManagerEvaluationService $managerService,
        array $peerScores,
        AIPerformanceCoachingService $aiCoachingService
    ): void {
        $startDate = Carbon::parse($this->cycle->start_date);
        $endDate   = Carbon::parse($this->cycle->end_date);

        $taskScore = null;
        if ($components->has('tasks')) {
            $taskScore = $taskService->calculateAggregateScoreForEmployee(
                $employee->id, $startDate, $endDate
            ) ?? 0;
        }

        $managerScore = null;
        if ($components->has('manager')) {
            $managerConfig = (array) ($components->get('manager') ?? []);
            $managerScore = $managerService->calculateManagerScore(
                $this->cycle->id, $employee->id, $managerConfig
            );
        }

        $peerScore = null;
        if ($components->has('peer')) {
            // استخدام الدرجات المُجمَّعة مسبقاً في handle() لتفادي N+1 واستدعاء $peerService خارج الـ scope
            $peerScore = $peerScores[$employee->id] ?? 0;
        }

        $attendanceScore = null;
        if ($components->has('attendance')) {
            $attendanceConfig = (array) ($components->get('attendance') ?? []);
            $attendanceScore = $this->calculateAttendanceScore(
                $employee->id, $startDate, $endDate, $attendanceConfig
            );
        }

        $overtimeScore = null;
        if ($components->has('overtime')) {
            $overtimeConfig = (array) ($components->get('overtime') ?? []);
            $overtimeScore = $this->calculateOvertimeScore(
                $employee->id, $startDate, $endDate, $overtimeConfig
            );
        }

        // self_assessment — لسا غير مفعّل بالكامل، يرجع null إذا غير مستخدم بالقالب
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
            $weight      = is_array($component) ? floatval($component['weight'] ?? 0) : floatval($component);
            $finalScore += ($score * $weight) / 100;
        }
        $finalScore = round($finalScore, 2);

        $decision = $this->determineDecision($finalScore);

        // ── استدعاء AI Coaching — خارج أي DB transaction (شبكة خارجية) ── //
        $componentLabels = [
            'tasks'      => 'Task Completion',
            'manager'    => 'Manager Evaluation',
            'peer'       => 'Peer Collaboration',
            'attendance' => 'Attendance',
            'overtime'   => 'Overtime Contribution',
        ];

        $aiResult = $aiCoachingService->analyzeAndRecommend(
            $scoreMap,
            $componentLabels,
            $employee->job_title ?? 'Employee'
        );

        $aiAnalysis = $aiResult['analysis'];
        $aiRecommendations = $aiResult['recommendations'];

        // ── من هون لتحت: DB transaction قصيرة. writes فقط، بدون أي استدعاء شبكة ── //
        DB::transaction(function () use ($employee, $taskScore, $managerScore, $peerScore, $attendanceScore, $overtimeScore, $selfScore, $finalScore, $decision, $aiAnalysis, $aiRecommendations) {
            $evaluation = PerformanceEvaluation::updateOrCreate(
                [
                    'performance_cycle_id' => $this->cycle->id,
                    'employee_profile_id'  => $employee->id,
                ],
                [
                    'department_id'      => $employee->department_id,
                    'employment_status'  => $employee->employment_status,
                    'tasks_score'        => $taskScore,
                    'manager_score'      => $managerScore,
                    'peer_score'         => $peerScore,
                    'attendance_score'   => $attendanceScore,
                    'overtime_score'     => $overtimeScore,
                    'self_score'         => $selfScore,
                    'final_score'        => $finalScore,
                    'status'             => 'evaluated',
                    'ai_analysis'        => $aiAnalysis,
                    'ai_recommendations' => $aiRecommendations,
                    'evaluated_at'       => now(),
                ]
            );

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
        });

        Log::info("ProcessPerformanceJob: Employee #{$employee->id} — final_score: {$finalScore} — decision: {$decision}");
    }

    // ─────────────────────────────────────────────────────────────
    // حساب درجة الحضور — يقرأ sub_components بالاسم الموحّد
    // ─────────────────────────────────────────────────────────────
    private function calculateAttendanceScore(int $employeeId, Carbon $start, Carbon $end, array $attendanceConfig): float
    {
        $records = AttendanceRecord::where('employee_profile_id', $employeeId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get();

        if ($records->isEmpty()) {
            return 95.00; // افتراضي إيجابي في حال عدم تسجيل بصمات خلال الفترة التجريبية
        }

        $sub = $attendanceConfig['sub_components'] ?? ($attendanceConfig['sub_weights'] ?? []);
        $ptsFull = intval($sub['points_full_attendance']['value'] ?? ($sub['points_full_attendance'] ?? 10));
        $ptsMinor = intval($sub['points_minor_late']['value'] ?? ($sub['points_minor_late'] ?? 7));
        $ptsRepeated = intval($sub['points_repeated_late']['value'] ?? ($sub['points_repeated_late'] ?? 4));
        $ptsAbsent = intval($sub['points_absent']['value'] ?? ($sub['points_absent'] ?? 0));

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

    // ─────────────────────────────────────────────────────────────
    // حساب درجة العمل الإضافي
    // ─────────────────────────────────────────────────────────────
    private function calculateOvertimeScore(int $employeeId, Carbon $start, Carbon $end, array $overtimeConfig): float
    {
        $records = \App\Models\AttendanceRecord::where('employee_profile_id', $employeeId)
            ->whereBetween('date', [$start->toDateString(), $end->toDateString()])
            ->get();

        if ($records->isEmpty()) {
            return 90.00; // افتراضي إيجابي في حال عدم تسجيل ساعات إضافية خلال الفترة التجريبية
        }

        $employee    = EmployeeProfile::find($employeeId);
        $deptHours   = DepartmentHour::where('dept', $employee?->department?->name)->first();
        $standardHrs = 8;

        if ($deptHours) {
            $startTime   = Carbon::parse($deptHours->start_time);
            $endTime     = Carbon::parse($deptHours->end_time);
            $standardHrs = $startTime->diffInHours($endTime);
        }

        $totalOvertimeHours = 0;
        foreach ($records as $record) {
            $totalOvertimeHours += max(0, floatval($record->hours_worked) - $standardHrs);
        }

        $sub = $overtimeConfig['sub_components'] ?? ($overtimeConfig['sub_weights'] ?? []);
        $multiplier = floatval($sub['multiplier']['value'] ?? ($sub['multiplier'] ?? 2.00));
        $maxCap     = floatval($sub['max_score_cap']['value'] ?? ($sub['max_score_cap'] ?? 100.00));

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

    // ✅ training محذوفة — enum فيه فقط: promotion, bonus, warning, dismissal
    // training_required الآن تترجم إلى warning (HR يقرر التدريب يدوياً عبر details)
    private function decisionToActionType(string $decision): string
    {
        return match ($decision) {
            'promotion_bonus'   => 'promotion',
            'bonus'             => 'bonus',
            // training ليست موجودة في الـ enum — تُترجم إلى warning (HR يقرر التدريب يدوياً)
            'training_required' => 'warning',
            default             => 'warning',
        };
    }

    public function failed(\Throwable $e): void
    {
        Log::critical("ProcessPerformanceJob: All attempts failed for cycle #{$this->cycle->id}: " . $e->getMessage());
        // لا نُعيد إلى 'active' — نُبقي على 'processing' حتى يتمكن HR من إعادة المحاولة يدوياً
        // $this->cycle->update(['status' => 'active']); // مُعطَّل عمداً
    }
}
