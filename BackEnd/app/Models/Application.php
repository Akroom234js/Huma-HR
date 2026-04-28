<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Application extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للملء (Fillable)
     */
    protected $fillable = [
        'job_posting_id',
        'user_id',
        'full_name',
        'email',
        'phone',
        'resume_path',
        'cover_letter_path',
        'status',
        'current_stage',
        'feedback',
        'submitted_at',
        'reviewed_at',
    ];

    /**
     * تحويل البيانات (Casts)
     */
    protected $casts = [
        'submitted_at' => 'datetime',
        'reviewed_at' => 'datetime',
    ];

    /**
     * العلاقات
     */

    /**
     * الطلب ينتمي إلى وظيفة واحدة
     */
    public function jobPosting(): BelongsTo
    {
        return $this->belongsTo(JobPosting::class);
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

    /**
     * النطاقات المسماة (Named Scopes)
     */

    /**
     * الطلبات المعلقة
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * الطلبات المراجعة
     */
    public function scopeReviewed($query)
    {
        return $query->where('status', 'reviewed');
    }

    /**
     * الطلبات المختارة
     */
    public function scopeShortlisted($query)
    {
        return $query->where('status', 'shortlisted');
    }

    /**
     * الطلبات قيد المقابلة
     */
    public function scopeInterviewing($query)
    {
        return $query->where('status', 'interviewing');
    }

    /**
     * الطلبات المعروضة
     */
    public function scopeOffered($query)
    {
        return $query->where('status', 'offered');
    }

    /**
     * الطلبات المقبولة
     */
    public function scopeHired($query)
    {
        return $query->where('status', 'hired');
    }

    /**
     * الطلبات المرفوضة
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * الطلبات المسحوبة
     */
    public function scopeWithdrawn($query)
    {
        return $query->where('status', 'withdrawn');
    }

    /**
     * الطلبات لوظيفة معينة
     */
    public function scopeForJobPosting($query, int $jobPostingId)
    {
        return $query->where('job_posting_id', $jobPostingId);
    }

    /**
     * الطلبات حسب الحالة
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }

    /**
     * الطلبات المقدمة خلال فترة زمنية معينة
     */
    public function scopeSubmittedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('submitted_at', [$startDate, $endDate]);
    }
}
