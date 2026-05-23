<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;          // ✅ إضافة: Soft Delete
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    use HasFactory;
    use SoftDeletes; // ✅ إضافة — ليش؟
                     // بدل الحذف النهائي، يضيف deleted_at timestamp
                     // لو حذفت طلب بالغلط تقدر ترجعه بـ restore()
                     // الـ Analytics ما بتتأثر لأن السجلات موجودة
                     // مطلوب قانونياً في بعض الدول (سجل التوظيف)

    // =========================================================
    // ✅ إضافة: Status Constants
    // =========================================================
    // ليش؟ بدل ما تكتب 'shortlisted' كـ string في 10 أماكن مختلفة
    // لو احتجت تغير الاسم بتغيره من هون بس
    // وبيمنع Typo — لو كتبت STATUS_SHORTLISTED غلط بيعطيك error فوراً
    // بدل ما تكتشف الغلط بعد ساعات من الـ debugging
    public const STATUS_PENDING      = 'pending';
    public const STATUS_REVIEWED     = 'reviewed';
    public const STATUS_SHORTLISTED  = 'shortlisted';
    public const STATUS_INTERVIEWING = 'interviewing';
    public const STATUS_OFFERED      = 'offered';
    public const STATUS_HIRED        = 'hired';
    public const STATUS_REJECTED     = 'rejected';
    public const STATUS_WITHDRAWN    = 'withdrawn';
    public const STATUS_NO_SHOW      = 'no_show';
    public const STATUS_EXPIRED      = 'offer_expired';

    /**
     * الحقول القابلة للملء (Fillable)
     */
    protected $fillable = [
        'job_posting_id',
        'user_id',
        'full_name',
        'email',
        'phone',
        'date_of_birth',
        'address',
        'emergency_contacts',
        'resume_path',
        'cover_letter_path',
        'status',
        'current_stage',
        'feedback',
        'submitted_at',
        'reviewed_at',
        'match_score',
        'ai_analysis',
        'evaluated_at',
    ];

    /**
     * تحويل البيانات (Casts)
     */
    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at'  => 'datetime',
        'date_of_birth' => 'date',

        // ✅ إضافة: evaluated_at cast
        // ليش؟ بدونه evaluated_at بيرجع كـ string
        // لو حاولت تعمل $application->evaluated_at->diffForHumans()
        // بيطلع خطأ: "Call to a member function on string"
        // مع الـ cast بيرجع Carbon object تقدر تستخدم معه كل دوال التاريخ
        'evaluated_at' => 'datetime',

        // ✅ إضافة: ai_analysis cast
        // ليش؟ بدونه ai_analysis بيتخزن كـ JSON string وبيرجع كـ string
        // لو بدك توصل لـ strengths لازم تعمل:
        //   json_decode($application->ai_analysis, true)['strengths']
        // مع الـ cast تكتب مباشرة:
        //   $application->ai_analysis['strengths']
        // Laravel بيعمل json_encode/decode تلقائياً
        'ai_analysis'  => 'array',

        // ✅ إضافة: match_score cast
        // ليش؟ MySQL أحياناً بيرجع الأرقام كـ string
        // الـ cast يضمن إنك دايماً تشتغل مع float مش string
        // مهم لما تعمل مقارنات: if ($score >= 80.0)
        'match_score'  => 'float',
    ];

    // =========================================================
    // العلاقات — نفس ما عندك + لا تعديل
    // =========================================================

    /**
     * الطلب ينتمي إلى وظيفة واحدة
     * ✅ withTrashed(): لو الوظيفة اتحذفت (SoftDelete)، لا تزال بيانات الطلب تظهر
     *    بدونها: jobPosting يرجع null → ApplicationResource يكسر عند عرض القائمة
     */
    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class)->withTrashed();
    }

    /**
     * الطلب قد يكون مرتبطاً بمستخدم واحد
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * الطلب له العديد من المقابلات
     */
    public function interviews(): HasMany
    {
        return $this->hasMany(Interview::class);
    }

    /**
     * الطلب قد يكون له عرض واحد
     */
    public function offer(): HasOne
    {
        return $this->hasOne(Offer::class);
    }

    /**
     * الطلب له العديد من المرفقات
     */
    public function attachments(): HasMany
    {
        return $this->hasMany(Attachment::class);
    }

    // =========================================================
    // Named Scopes — نفس ما عندك بالضبط
    // =========================================================

    public function scopePending($query)
    {
        return $query->where('status', self::STATUS_PENDING);
        // ✅ تعديل بسيط: استخدمنا الـ Constant بدل string مباشر
        // الفايدة: لو غيرت قيمة الـ status من هون بس بيتغير في كل مكان
    }

    public function scopeReviewed($query)
    {
        return $query->where('status', self::STATUS_REVIEWED);
    }

    public function scopeShortlisted($query)
    {
        return $query->where('status', self::STATUS_SHORTLISTED);
    }

    public function scopeInterviewing($query)
    {
        return $query->where('status', self::STATUS_INTERVIEWING);
    }

    public function scopeOffered($query)
    {
        return $query->where('status', self::STATUS_OFFERED);
    }

    public function scopeHired($query)
    {
        return $query->where('status', self::STATUS_HIRED);
    }

    public function scopeRejected($query)
    {
        return $query->where('status', self::STATUS_REJECTED);
    }

    public function scopeWithdrawn($query)
    {
        return $query->where('status', self::STATUS_WITHDRAWN);
    }

    public function scopeForJobPosting($query, int $jobPostingId)
    {
        return $query->where('job_posting_id', $jobPostingId);
    }

    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    public function scopeSubmittedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('submitted_at', [$startDate, $endDate]);
    }

    // =========================================================
    // ✅ إضافة: Scopes جديدة مفيدة
    // =========================================================

    /**
     * ✅ جديد: الطلبات اللي اتقيّمت بالـ AI
     * ليش مفيد؟ HR يقدر يشوف الطلبات الجاهزة للمراجعة
     * (اللي خلّص الـ AI تقييمها) منفصلة عن اللي لسا ما اتقيّمت
     */
    public function scopeEvaluated($query)
    {
        return $query->whereNotNull('evaluated_at');
    }

    /**
     * ✅ جديد: الطلبات اللي لسا ما اتقيّمت
     * ليش مفيد؟ لو الـ Queue توقف، HR يشوف الطلبات العالقة
     */
    public function scopePendingEvaluation($query)
    {
        return $query->whereNull('evaluated_at');
    }

    /**
     * ✅ جديد: الطلبات بنقاط عالية (فوق حد معين)
     * ليش مفيد؟ HR يفلتر المرشحين الممتازين بسرعة
     * الاستخدام: Application::highScore(80)->get()
     */
    public function scopeHighScore($query, float $threshold = 80.0)
    {
        return $query->where('match_score', '>=', $threshold);
    }

    /**
     * ✅ جديد: العروض المنتهية الصلاحية
     * ليش مفيد؟ يستخدمه الـ Scheduler اليومي
     * لتحويل العروض المنتهية تلقائياً لـ offer_expired
     */
    public function scopeExpiredOffers($query)
    {
        return $query->where('status', self::STATUS_OFFERED)
                     ->whereHas('offer', fn($q) =>
                         $q->where('expiry_date', '<', now())
                           ->whereNull('responded_at')
                     );
    }
}
