<?php

namespace App\Exceptions;

use Exception;

/**
 * =====================================================================
 * DuplicateApplicationException
 * =====================================================================
 *
 * متى يُرمى هاد الـ Exception؟
 * ──────────────────────────────
 * لما شخص يحاول يتقدم على نفس الوظيفة وطلبه لسا فعّال
 *
 * مثال:
 *   Ahmad تقدم على وظيفة Laravel Developer
 *   طلبه بحالة 'reviewed'
 *   حاول يتقدم مرة ثانية
 *   → يُرمى هاد الـ Exception
 *   → ApplicationController يمسكه ويرجع 422
 *
 * ليش نستخدم Exception مخصص بدل if/return عادي؟
 * ─────────────────────────────────────────────
 * لأن ApplicationService قد تُستدعى من أماكن كثيرة:
 *   - ApplicationController (HTTP)
 *   - Artisan Command (CLI)
 *   - Job Queue (Background)
 * كل مكان يتعامل مع الـ Exception بطريقته
 * بدل ما تكرر نفس الـ if في كل مكان
 */
class DuplicateApplicationException extends Exception
{
    public function __construct(string $message = 'You have already applied for this position.')
    {
        parent::__construct($message);
    }
}
