<?php

namespace App\Services;

use App\Models\Task;
use Carbon\Carbon;

class TaskPerformanceService
{
    // ─── معاملات الصعوبة ──────────────────────────────────────────
    // المنطق: المهمة الأصعب تستحق مكافأة أعلى عند الإتمام
    // وتكون أقل تأثيراً سلبياً على التقييم عند الإخفاق مقارنةً بمهمة سهلة أُهملت
    public const DIFFICULTY_MULTIPLIERS = [
        'easy'   => 0.8,  // وزن خفيف — المهمة سهلة ولا تستحق مكافأة كبيرة
        'medium' => 1.0,  // نقطة الارتكاز المحايدة — المعيار الأساسي
        'hard'   => 1.3,  // مكافأة 30% إضافية على الإنجاز في المهام المعقدة
    ];

    // ─── معاملات الأولوية ─────────────────────────────────────────
    // المنطق: ما يحكم عليه المدير كمهمة عاجلة أو حرجة يجب أن يُعطى وزناً عالياً
    public const PRIORITY_MULTIPLIERS = [
        'low'    => 0.8,  // وزن خفيف — لا يضر الغياب عنها الموظف بشكل كبير
        'medium' => 1.0,  // نقطة الارتكاز المحايدة
        'high'   => 1.2,  // مكافأة 20% للمهام عالية الأهمية
        'urgent' => 1.5,  // مكافأة 50% للمهام الحرجة والعاجلة جداً
    ];

    // ─── نسب التوزيع الداخلي للمهمة ─────────────────────────────
    // 60% إتمام (Completion) + 40% جودة (Quality)
    public const COMPLETION_WEIGHT = 0.60;
    public const QUALITY_WEIGHT    = 0.40;

    // ─── التوابع الأساسية ─────────────────────────────────────────

    /**
     * حساب درجة المهمة الفردية مع تطبيق:
     * 1. خصم التأخير على درجة الإتمام أولاً
     * 2. الضرب في معاملات الصعوبة والأولوية
     *
     * @return float|null  null إذا لم تُقيَّم المهمة بعد
     */
    public function calculateSingleTaskScore(Task $task): ?float
    {
        if (is_null($task->completion_score) || is_null($task->quality_score)) {
            return null;
        }

        // 1. تطبيق خصم التأخير على درجة الإتمام (لا تنزل عن الصفر)
        $penalty = intval($task->days_late) * intval($task->late_penalty_per_day);
        $completionAfterPenalty = max(0, floatval($task->completion_score) - $penalty);

        // 2. الدرجة الأساسية الخام (Raw Score)
        $rawScore = ($completionAfterPenalty * self::COMPLETION_WEIGHT)
                  + (floatval($task->quality_score) * self::QUALITY_WEIGHT);

        // 3. معاملات الصعوبة والأولوية
        $diffMultiplier     = self::DIFFICULTY_MULTIPLIERS[$task->difficulty] ?? 1.0;
        $priorityMultiplier = self::PRIORITY_MULTIPLIERS[$task->priority]    ?? 1.0;

        // 4. الدرجة الفعلية الموزونة
        return round($rawScore * ($diffMultiplier + $priorityMultiplier), 2);
    }

    /**
     * حساب الحد الأقصى الممكن لمهمة واحدة (يُستخدم لحساب النسبة التجميعية لاحقاً)
     */
    public function getMaxPossibleTaskScore(Task $task): float
    {
        $diffMultiplier     = self::DIFFICULTY_MULTIPLIERS[$task->difficulty] ?? 1.0;
        $priorityMultiplier = self::PRIORITY_MULTIPLIERS[$task->priority]    ?? 1.0;

        // الحد الأقصى للدرجة الخام هو 100 (إتمام 100 + جودة 100)
        return round(100.0 * ($diffMultiplier + $priorityMultiplier), 2);
    }

    /**
     * حساب الدرجة التجميعية الموزونة لجميع المهام المقيّمة
     * لموظف معين خلال فترة دورة الأداء، والحصول على نتيجة من 100.
     *
     * المعادلة: (مجموع الدرجات الفعلية / مجموع الدرجات القصوى الممكنة) × 100
     *
     * @return float|null  null إذا لم توجد مهام مقيمة في الفترة المحددة
     */
    public function calculateAggregateScoreForEmployee(
        int    $employeeProfileId,
        Carbon $startDate,
        Carbon $endDate
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
            $actual = $this->calculateSingleTaskScore($task);
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
