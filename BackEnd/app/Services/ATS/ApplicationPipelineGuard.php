<?php

namespace App\Services\ATS;

use App\Exceptions\InvalidStatusTransitionException;
use App\Models\Application;

/**
 * =====================================================================
 * ApplicationPipelineGuard — حارس مراحل الطلب
 * =====================================================================
 *
 * ليش هاد الكلاس موجود؟
 * ──────────────────────
 * بدونه HR يقدر ينقل طلب من 'pending' مباشرة لـ 'hired'
 * أو يرجع طلب من 'rejected' لـ 'reviewed'
 * هاد يكسر منطق النظام كاملاً والتقارير تطلع غلط
 *
 * كيف يشتغل؟
 * ──────────
 * عنده جدول انتقالات — لكل حالة قائمة بالحالات المسموح الذهاب إليها
 * لما ApplicationService تحاول تغير الحالة، بتسأل الـ Guard أولاً
 * لو مش مسموح → يرمي InvalidStatusTransitionException
 * لو مسموح    → يكمل العملية
 *
 * مثال:
 *   pending → reviewed    ✅ مسموح
 *   pending → hired       ❌ مش مسموح → Exception
 *   hired   → reviewed    ❌ حالة نهائية → Exception
 */
class ApplicationPipelineGuard
{
    /**
     * جدول الانتقالات المسموحة
     * المفتاح   = الحالة الحالية
     * القيمة    = الحالات التي يمكن الانتقال إليها
     */
    private const ALLOWED_TRANSITIONS = [

        // pending: أول حالة — الطلب استُلم وينتظر التقييم
        Application::STATUS_PENDING => [
            Application::STATUS_REVIEWED,   // HR راجعه يدوياً
            Application::STATUS_REJECTED,   // رفض مباشر بدون مراجعة
            Application::STATUS_WITHDRAWN,  // المتقدم سحب طلبه
        ],

        // reviewed: تحت المراجعة البشرية
        Application::STATUS_REVIEWED => [
            Application::STATUS_SHORTLISTED, // HR اختاره للقائمة القصيرة
            Application::STATUS_REJECTED,
            Application::STATUS_WITHDRAWN,
        ],

        // shortlisted: على القائمة القصيرة
        Application::STATUS_SHORTLISTED => [
            Application::STATUS_INTERVIEWING, // جدولة مقابلة
            Application::STATUS_REJECTED,
            Application::STATUS_WITHDRAWN,
        ],

        // interviewing: في مرحلة المقابلة
        Application::STATUS_INTERVIEWING => [
            Application::STATUS_OFFERED,    // تقديم عرض وظيفي
            Application::STATUS_REJECTED,
            Application::STATUS_NO_SHOW,    // ما حضر المقابلة
            Application::STATUS_WITHDRAWN,
        ],

        // no_show: ما حضر المقابلة
        // HR يقدر يعطيه فرصة ثانية أو يرفضه
        Application::STATUS_NO_SHOW => [
            Application::STATUS_INTERVIEWING, // فرصة ثانية
            Application::STATUS_REJECTED,
            Application::STATUS_WITHDRAWN,
        ],

        // offered: تم تقديم عرض وظيفي
        Application::STATUS_OFFERED => [
            Application::STATUS_HIRED,      // قبل العرض ✅
            Application::STATUS_REJECTED,   // رفض العرض
            Application::STATUS_EXPIRED,    // انتهت صلاحية العرض (Scheduler)
            Application::STATUS_WITHDRAWN,
        ],

        // ─── حالات نهائية — لا يوجد انتقال منها ───────────────
        // لو حاولت تنقل من أي منها → Exception فوراً
        Application::STATUS_HIRED     => [], // ✅ تم التوظيف
        Application::STATUS_REJECTED  => [], // ❌ مرفوض نهائياً
        Application::STATUS_WITHDRAWN => [], // 🚪 سحب الطلب
        Application::STATUS_EXPIRED   => [], // ⏰ انتهى العرض
    ];

    /**
     * هل هاد الانتقال مسموح؟ (بدون رمي Exception)
     * يُستخدم لما تريد تتحقق بدون توقف التنفيذ
     *
     * مثال الاستخدام:
     *   if ($guard->canTransition('pending', 'hired')) { ... }
     */
    public function canTransition(string $fromStatus, string $toStatus): bool
    {
        $allowed = self::ALLOWED_TRANSITIONS[$fromStatus] ?? [];
        return in_array($toStatus, $allowed);
    }

    /**
     * تحقق وارمِ Exception إذا الانتقال غير مسموح
     * هاد هو الاستخدام الأساسي داخل ApplicationService
     *
     * مثال الاستخدام:
     *   $guard->assertCanTransition($application, 'hired');
     *   // لو مش مسموح → InvalidStatusTransitionException
     *   // لو مسموح    → لا شي، الكود يكمل
     */
    public function assertCanTransition(Application $application, string $toStatus): void
    {
        if (!$this->canTransition($application->status, $toStatus)) {

            $allowed = self::ALLOWED_TRANSITIONS[$application->status] ?? [];
            $allowedList = empty($allowed) ? 'none (final status)' : implode(', ', $allowed);

            throw new InvalidStatusTransitionException(
                "Cannot transition application #{$application->id} " .
                "from '{$application->status}' to '{$toStatus}'. " .
                "Allowed: [{$allowedList}]"
            );
        }
    }

    /**
     * إرجاع كل الانتقالات المسموح بها من حالة معينة
     *
     * ليش مفيد؟
     * الـ Frontend يسأل: شو الأزرار اللي أعرضها للـ HR؟
     * بدل ما تكتب الـ logic في الـ Frontend، تسأل الـ API
     * والـ API يرجع الانتقالات المسموحة فقط
     *
     * مثال: GET /applications/5/allowed-transitions
     * Response: { "allowed": ["shortlisted", "rejected", "withdrawn"] }
     */
    public function getAllowedTransitions(string $fromStatus): array
    {
        return self::ALLOWED_TRANSITIONS[$fromStatus] ?? [];
    }

    /**
     * هل هاي حالة نهائية؟ (لا يمكن تغييرها)
     *
     * مثال الاستخدام:
     *   if ($guard->isFinalStatus($application->status)) {
     *       // أخبر HR إن هاد الطلب مغلق نهائياً
     *   }
     */
    public function isFinalStatus(string $status): bool
    {
        $transitions = self::ALLOWED_TRANSITIONS[$status] ?? null;
        return $transitions !== null && empty($transitions);
    }
}
