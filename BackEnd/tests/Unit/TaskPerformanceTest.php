<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Services\TaskPerformanceService;
use App\Models\Task;
use Illuminate\Foundation\Testing\RefreshDatabase;

class TaskPerformanceTest extends TestCase
{
    use RefreshDatabase;

    protected TaskPerformanceService $service;

    protected function setUp(): void
    {
        parent::setUp();
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
        $this->service = new TaskPerformanceService();
    }

    /**
     * مساعد لإنشاء مهمة وهمية بسرعة
     */
    protected function makeTask(array $attrs): Task
    {
        return new Task(array_merge([
            'employee_profile_id' => 1,
            'assigned_by'         => 1,
            'title'               => 'Test Task',
            'due_date'            => now(),
            'difficulty'          => 'medium',
            'priority'            => 'medium',
            'status'              => 'scored',
            'late_penalty_per_day'=> 0,
            'days_late'           => 0,
            'completion_score'    => null,
            'quality_score'       => null,
        ], $attrs));
    }

    // ─────────────────────────────────────────────────────────────────
    // اختبارات: calculateSingleTaskScore
    // ─────────────────────────────────────────────────────────────────

    /**
     * مهمة غير مقيّمة → يجب أن ترجع null
     */
    public function test_unscored_task_returns_null(): void
    {
        $task = $this->makeTask([]);
        $this->assertNull($this->service->calculateSingleTaskScore($task));
    }

    /**
     * مهمة متوسطة الصعوبة والأولوية بدون تأخير
     * Raw Score = (80×0.6) + (90×0.4) = 48 + 36 = 84
     * Multiplier = 1.0 (medium) + 1.0 (medium) = 2.0
     * Final = 84 × 2.0 = 168.00
     * MaxPossible = 100 × 2.0 = 200.00
     * Aggregate = (168/200) × 100 = 84.00%  ← نفس الدرجة الخام تقريباً (نقطة الارتكاز تعمل ✅)
     */
    public function test_medium_task_no_penalty_score(): void
    {
        $task = $this->makeTask([
            'difficulty'       => 'medium',
            'priority'         => 'medium',
            'completion_score' => 80,
            'quality_score'    => 90,
            'days_late'        => 0,
            'late_penalty_per_day' => 0,
        ]);

        $score    = $this->service->calculateSingleTaskScore($task);
        $maxScore = $this->service->getMaxPossibleTaskScore($task);

        $this->assertEquals(168.00, $score);
        $this->assertEquals(200.00, $maxScore);
    }

    /**
     * مهمة صعبة وعاجلة → مكافأة كبيرة (Reward Boost)
     * Raw Score = (90×0.6) + (85×0.4) = 54 + 34 = 88
     * Multiplier = 1.3 (hard) + 1.5 (urgent) = 2.8
     * Final = 88 × 2.8 = 246.40
     * MaxPossible = 100 × 2.8 = 280.00
     */
    public function test_hard_urgent_task_gets_reward_boost(): void
    {
        $task = $this->makeTask([
            'difficulty'       => 'hard',
            'priority'         => 'urgent',
            'completion_score' => 90,
            'quality_score'    => 85,
            'days_late'        => 0,
            'late_penalty_per_day' => 0,
        ]);

        $score    = $this->service->calculateSingleTaskScore($task);
        $maxScore = $this->service->getMaxPossibleTaskScore($task);

        $this->assertEquals(246.40, $score);
        $this->assertEquals(280.00, $maxScore);
    }

    /**
     * مهمة سهلة ومنخفضة الأولوية → وزن خفيف
     * Raw Score = (95×0.6) + (95×0.4) = 57 + 38 = 95
     * Multiplier = 0.8 (easy) + 0.8 (low) = 1.6
     * Final = 95 × 1.6 = 152.00
     * MaxPossible = 100 × 1.6 = 160.00
     */
    public function test_easy_low_priority_task_has_light_weight(): void
    {
        $task = $this->makeTask([
            'difficulty'       => 'easy',
            'priority'         => 'low',
            'completion_score' => 95,
            'quality_score'    => 95,
            'days_late'        => 0,
            'late_penalty_per_day' => 0,
        ]);

        $score    = $this->service->calculateSingleTaskScore($task);
        $maxScore = $this->service->getMaxPossibleTaskScore($task);

        $this->assertEquals(152.00, $score);
        $this->assertEquals(160.00, $maxScore);
    }

    /**
     * مهمة مع عقوبة تأخير:
     * completion_score = 80 → بعد خصم 3 أيام × 5 نقاط = 80 - 15 = 65
     * Raw Score = (65×0.6) + (70×0.4) = 39 + 28 = 67
     * Multiplier = 1.0 + 1.0 = 2.0
     * Final = 67 × 2.0 = 134.00
     */
    public function test_late_penalty_reduces_completion_score(): void
    {
        $task = $this->makeTask([
            'difficulty'          => 'medium',
            'priority'            => 'medium',
            'completion_score'    => 80,
            'quality_score'       => 70,
            'days_late'           => 3,
            'late_penalty_per_day'=> 5,
        ]);

        $score = $this->service->calculateSingleTaskScore($task);
        $this->assertEquals(134.00, $score);
    }

    /**
     * عقوبة التأخير لا تجعل الدرجة سالبة (الحد الأدنى صفر)
     * completion_score = 30 → 30 - (10×5) = 30 - 50 = -20 → يُقيّد إلى 0
     * Raw Score = (0×0.6) + (60×0.4) = 0 + 24 = 24
     * Multiplier = 1.0 + 1.0 = 2.0
     * Final = 24 × 2.0 = 48.00
     */
    public function test_late_penalty_never_goes_below_zero(): void
    {
        $task = $this->makeTask([
            'difficulty'          => 'medium',
            'priority'            => 'medium',
            'completion_score'    => 30,
            'quality_score'       => 60,
            'days_late'           => 10,
            'late_penalty_per_day'=> 5,
        ]);

        $score = $this->service->calculateSingleTaskScore($task);
        $this->assertEquals(48.00, $score);
    }

    // ─────────────────────────────────────────────────────────────────
    // اختبارات: calculateAggregateScoreForEmployee
    // ─────────────────────────────────────────────────────────────────

    /**
     * التحقق من حساب الدرجة التجميعية الموزونة لمهمتين معاً:
     *
     * مهمة 1 (سهلة، منخفضة): completion=90, quality=90
     *   Raw = (90×0.6) + (90×0.4) = 90
     *   Score = 90 × (0.8+0.8) = 90 × 1.6 = 144.00
     *   Max   = 100 × 1.6 = 160.00
     *
     * مهمة 2 (صعبة، عاجلة): completion=80, quality=80
     *   Raw = (80×0.6) + (80×0.4) = 80
     *   Score = 80 × (1.3+1.5) = 80 × 2.8 = 224.00
     *   Max   = 100 × 2.8 = 280.00
     *
     * Aggregate = ((144+224) / (160+280)) × 100
     *           = (368 / 440) × 100
     *           = 83.64%
     */
    public function test_aggregate_score_is_weighted_correctly(): void
    {
        // نسجّل المهام في قاعدة البيانات الاختبارية
        $user = \App\Models\User::forceCreate([
            'email'    => 'emp@huma.com',
            'password' => bcrypt('pass'),
        ]);
        $employee = \App\Models\EmployeeProfile::forceCreate([
            'user_id'   => $user->id,
            'full_name' => 'Test Employee',
        ]);
        $assigner = \App\Models\EmployeeProfile::forceCreate([
            'user_id'   => $user->id,
            'full_name' => 'Assigner',
        ]);

        $cycleStart = now()->startOfYear();
        $cycleEnd   = now()->endOfYear();

        // مهمة 1: سهلة، أولوية منخفضة
        Task::forceCreate([
            'employee_profile_id'  => $employee->id,
            'assigned_by'          => $assigner->id,
            'title'                => 'Easy Task',
            'due_date'             => now()->addMonth()->toDateString(),
            'difficulty'           => 'easy',
            'priority'             => 'low',
            'status'               => 'scored',
            'completion_score'     => 90,
            'quality_score'        => 90,
            'days_late'            => 0,
            'late_penalty_per_day' => 0,
        ]);

        // مهمة 2: صعبة، عاجلة
        Task::forceCreate([
            'employee_profile_id'  => $employee->id,
            'assigned_by'          => $assigner->id,
            'title'                => 'Hard Urgent Task',
            'due_date'             => now()->addMonths(2)->toDateString(),
            'difficulty'           => 'hard',
            'priority'             => 'urgent',
            'status'               => 'scored',
            'completion_score'     => 80,
            'quality_score'        => 80,
            'days_late'            => 0,
            'late_penalty_per_day' => 0,
        ]);

        $aggregate = $this->service->calculateAggregateScoreForEmployee(
            $employee->id,
            $cycleStart,
            $cycleEnd
        );

        $this->assertEquals(83.64, $aggregate);
    }

    /**
     * موظف ليس لديه مهام مقيّمة → يجب أن ترجع null
     */
    public function test_employee_with_no_scored_tasks_returns_null(): void
    {
        $aggregate = $this->service->calculateAggregateScoreForEmployee(
            999999,
            now()->startOfYear(),
            now()->endOfYear()
        );

        $this->assertNull($aggregate);
    }
}
