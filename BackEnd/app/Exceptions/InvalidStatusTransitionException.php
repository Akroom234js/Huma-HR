<?php

namespace App\Exceptions;

use Exception;

/**
 * =====================================================================
 * InvalidStatusTransitionException
 * =====================================================================
 *
 * متى يُرمى هاد الـ Exception؟
 * ──────────────────────────────
 * لما HR يحاول ينقل طلب لحالة غير مسموح بها
 * بناءً على قواعد الـ Pipeline Guard
 *
 * أمثلة على انتقالات غير مسموحة:
 *   pending     → hired     ❌ (تخطي 4 مراحل)
 *   shortlisted → offered   ❌ (تخطي interviewing)
 *   hired       → reviewed  ❌ (الرجوع من حالة نهائية)
 *   rejected    → pending   ❌ (الرجوع من حالة نهائية)
 *
 * أمثلة على انتقالات مسموحة:
 *   pending     → reviewed    ✅
 *   reviewed    → shortlisted ✅
 *   shortlisted → rejected    ✅ (الرفض مسموح من أي مرحلة)
 *
 * ليش مهم هاد الـ Exception؟
 * ──────────────────────────
 * بدونه HR يقدر ينقل طلب من pending لـ hired مباشرة
 * هاد يكسر data integrity النظام كاملاً
 * والـ Analytics والتقارير تطلع غلط
 */
class InvalidStatusTransitionException extends Exception
{
    public function __construct(string $message = 'This status transition is not allowed.')
    {
        parent::__construct($message);
    }
}
