<?php

namespace App\Services;

use App\Models\Task;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * خدمة حساب أداء المهام
 *
 * ─── معادلة درجة مهمة واحدة ───────────────────────────────────────
 *  1. penalized_completion = max(0, completion_score - (days_late × late_penalty_per_day))
 *  2. raw_score            = (penalized_completion × 0.60) + (quality_score × 0.40)
 *  3. multiplier           = difficulty_multiplier + priority_multiplier
 *  4. score                = raw_score × multiplier
 *  5. max_possible         = 100 × multiplier
 *
 * ─── مضاعفات الصعوبة ──────────────────────────────────────────────
 *  easy   → 0.8
 *  medium → 1.0
 *  hard   → 1.3
 *
 * ─── مضاعفات الأولوية ─────────────────────────────────────────────
 *  low    → 0.8
 *  medium → 1.0
 *  high   → 1.3
 *  urgent → 1.5
 *
 * ─── الدرجة التجميعية ─────────────────────────────────────────────
 *  aggregate = (Σ score / Σ max_possible) × 100   [مقرّبة إلى منزلتين]
 */
class TaskPerformanceService
{
    // ─── Multiplier Tables ────────────────────────────────────────

    private const DIFFICULTY_MULTIPLIERS = [
        'easy'   => 0.8,
        'medium' => 1.0,
        'hard'   => 1.3,
    ];

    private const PRIORITY_MULTIPLIERS = [
        'low'    => 0.8,
        'medium' => 1.0,
        'high'   => 1.3,
        'urgent' => 1.5,
    ];

    // ─── Public Methods ───────────────────────────────────────────

    /**
     * حساب درجة مهمة واحدة (مع مضاعف الصعوبة والأولوية).
     * ترجع null إذا لم تكن المهمة مقيّمة بعد.
     */
    public function calculateSingleTaskScore(Task $task): ?float
    {
        if (is_null($task->completion_score) || is_null($task->quality_score)) {
            return null;
        }

        $multiplier = $this->getMultiplier($task);
        $rawScore   = $this->calculateRawScore($task);

        return round($rawScore * $multiplier, 2);
    }

    /**
     * الحد الأقصى الممكن لدرجة المهمة (100 × multiplier).
     */
    public function getMaxPossibleTaskScore(Task $task): float
    {
        return round(100 * $this->getMultiplier($task), 2);
    }

    /**
     * الدرجة التجميعية المرجّحة لموظف خلال فترة دورة أداء.
     *
     * @param  int    $employeeProfileId
     * @param  mixed  $startDate  Carbon|string
     * @param  mixed  $endDate    Carbon|string
     * @param  array  $config     إعدادات المكوّن (اختياري — من القالب)
     * @return float|null  نسبة مئوية (0–100) أو null إذا لم توجد مهام مقيّمة
     */
    public function calculateAggregateScoreForEmployee(
        int $employeeProfileId,
              $startDate,
              $endDate,
        array $config = []
    ): ?float {
        $start = Carbon::parse($startDate)->toDateString();
        $end   = Carbon::parse($endDate)->toDateString();

        $tasks = Task::where('employee_profile_id', $employeeProfileId)
            ->where('status', 'scored')
            ->whereBetween('due_date', [$start, $end])
            ->get();

        if ($tasks->isEmpty()) {
            return null;
        }

        $totalScore    = 0.0;
        $totalMaxScore = 0.0;

        foreach ($tasks as $task) {
            $score    = $this->calculateSingleTaskScore($task);
            $maxScore = $this->getMaxPossibleTaskScore($task);

            if ($score === null) {
                continue;
            }

            $totalScore    += $score;
            $totalMaxScore += $maxScore;
        }

        if ($totalMaxScore <= 0) {
            return null;
        }

        return round(($totalScore / $totalMaxScore) * 100, 2);
    }

    // ─── Private Helpers ─────────────────────────────────────────

    /**
     * المجموع الخام للدرجة (قبل ضرب المضاعف).
     * completion_score تُخفَّض بعقوبة التأخير ولا تقل عن 0.
     */
    private function calculateRawScore(Task $task): float
    {
        $penalty            = (int) $task->days_late * (int) $task->late_penalty_per_day;
        $penalizedCompletion = max(0, (float) $task->completion_score - $penalty);
        $quality             = (float) $task->quality_score;

        return ($penalizedCompletion * 0.60) + ($quality * 0.40);
    }

    /**
     * المضاعف الكلي = مضاعف الصعوبة + مضاعف الأولوية.
     */
    private function getMultiplier(Task $task): float
    {
        $difficultyMultiplier = self::DIFFICULTY_MULTIPLIERS[$task->difficulty] ?? 1.0;
        $priorityMultiplier   = self::PRIORITY_MULTIPLIERS[$task->priority]    ?? 1.0;

        return $difficultyMultiplier + $priorityMultiplier;
    }
}
