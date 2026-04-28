<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Interview extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للملء (Fillable)
     */
    protected $fillable = [
        'application_id',
        'interviewer_id',
        'interview_type',
        'scheduled_at',
        'conducted_at',
        'status',
        'feedback',
        'rating',
    ];

    /**
     * تحويل البيانات (Casts)
     */
    protected $casts = [
        'scheduled_at' => 'datetime',
        'conducted_at' => 'datetime',
        'rating' => 'integer',
    ];

    /**
     * العلاقات
     */

    /**
     * المقابلة تنتمي إلى طلب واحد
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    /**
     * المقابلة يجريها مستخدم واحد (المحاور)
     */
    public function interviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'interviewer_id');
    }

    /**
     * النطاقات المسماة (Named Scopes)
     */

    /**
     * المقابلات المجدولة
     */
    public function scopeScheduled($query)
    {
        return $query->where('status', 'scheduled');
    }

    /**
     * المقابلات المكتملة
     */
    public function scopeCompleted($query)
    {
        return $query->where('status', 'completed');
    }

    /**
     * المقابلات الملغاة
     */
    public function scopeCanceled($query)
    {
        return $query->where('status', 'canceled');
    }

    /**
     * المقابلات المعاد جدولتها
     */
    public function scopeRescheduled($query)
    {
        return $query->where('status', 'rescheduled');
    }

    /**
     * المقابلات حسب نوع المقابلة
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('interview_type', $type);
    }

    /**
     * المقابلات حسب المحاور
     */
    public function scopeByInterviewer($query, int $interviewerId)
    {
        return $query->where('interviewer_id', $interviewerId);
    }

    /**
     * المقابلات المجدولة في تاريخ معين
     */
    public function scopeScheduledOn($query, $date)
    {
        return $query->whereDate('scheduled_at', $date);
    }

    /**
     * المقابلات المجدولة بين تاريخين
     */
    public function scopeScheduledBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('scheduled_at', [$startDate, $endDate]);
    }
}
