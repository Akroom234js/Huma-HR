<?php

namespace App\Services;

use App\Models\Task;
use Carbon\Carbon;

class TaskPerformanceService
{
    // معاملات الصعوبة
    public const DIFFICULTY_MULTIPLIERS = [
        'easy'   => 0.8,
        'medium' => 1.0,
        'hard'   => 1.3,
    ];

    // معاملات الأولوية
    public const PRIORITY_MULTIPLIERS = [
        'low'    => 0.8,
        'medium' => 1.0,
        'high'   => 1.2,
        'urgent' => 1.5,
    ];

    /**
     * حساب درجة المهمة الفردية اعتماداً على إعدادات القالب الديناميكية
     */
    public function calculateSingleTaskScore(Task $task, array $taskConfig): ?float
    {
        if (is_null($task->completion_score) || is_null($task->quality_score)) {
            return null;
        }

        // جلب الإعدادات المخصصة من القالب أو تطبيق الافتراضيات
        $completionWeight  = floatval($taskConfig['sub_components']['completion_weight'] ?? 60.00) / 100;
        $qualityWeight     = floatval($taskConfig['sub_components']['quality_weight'] ?? 40.00) / 100;
        $penaltyRate       = floatval($taskConfig['sub_components']['late_penalty_per_day_percent'] ?? 5.00) / 100;
        $maxPenaltyPercent = floatval($taskConfig['sub_components']['max_late_penalty_percent'] ?? 50.00) / 100;

        // 1. حساب نسبة خصم التأخير اليومية المجمعة من درجة الإتمام بحد أقصى (Max Cap)
        $daysLate = max(0, intval($task->days_late));
        $totalPenaltyRate = min($maxPenaltyPercent, $daysLate * $penaltyRate);

        $completionAfterPenalty = max(0, floatval($task->completion_score) * (1 - $totalPenaltyRate));

        // 2. الدرجة الخام للمهمة
        $rawScore = ($completionAfterPenalty * $completionWeight)
                  + (floatval($task->quality_score) * $qualityWeight);

        // 3. تطبيق معاملات الصعوبة والأولوية للمهمة
        $diffMultiplier     = self::DIFFICULTY_MULTIPLIERS[$task->difficulty] ?? 1.0;
        $priorityMultiplier = self::PRIORITY_MULTIPLIERS[$task->priority]    ?? 1.0;

        // 4. الدرجة الفعلية الموزونة
        return round($rawScore * ($diffMultiplier + $priorityMultiplier), 2);
    }

    /**
     * حساب الحد الأقصى الممكن لمهمة واحدة
     */
    public function getMaxPossibleTaskScore(Task $task): float
    {
        $diffMultiplier     = self::DIFFICULTY_MULTIPLIERS[$task->difficulty] ?? 1.0;
        $priorityMultiplier = self::PRIORITY_MULTIPLIERS[$task->priority]    ?? 1.0;

        return round(100.0 * ($diffMultiplier + $priorityMultiplier), 2);
    }

    /**
     * حساب الدرجة التجميعية الموزونة لجميع المهام المقيّمة
     */
    public function calculateAggregateScoreForEmployee(
        int    $employeeProfileId,
        Carbon $startDate,
        Carbon $endDate,
        array  $taskConfig
    ): ?float {
        // جلب المهام المقيّمة فقط ضمن تواريخ الدورة
        $tasks = Task::forEmployee($employeeProfileId)
                     ->scored()
                     ->betweenDates($startDate->toDateString(), $endDate->toDateString())
                     ->get();

        if ($tasks->isEmpty()) {
            return null;
        }

        $totalActualScore      = 0.00;
        $totalMaxPossibleScore = 0.00;

        foreach ($tasks as $task) {
            $actual = $this->calculateSingleTaskScore($task, $taskConfig);
            if (!is_null($actual)) {
                $totalActualScore      += $actual;
                $totalMaxPossibleScore += $this->getMaxPossibleTaskScore($task);
            }
        }

        if ($totalMaxPossibleScore === 0.00) {
            return 0.00;
        }

        return round(($totalActualScore / $totalMaxPossibleScore) * 100, 2);
    }
}
