<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Offer extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للملء (Fillable)
     */
    protected $fillable = [
        'application_id',
        'offered_salary',
        'salary_currency',
        'start_date',
        'status',
        'extended_at',
        'accepted_at',
        'rejected_at',
    ];

    /**
     * تحويل البيانات (Casts)
     */
    protected $casts = [
        'offered_salary' => 'decimal:2',
        'start_date' => 'date',
        'extended_at' => 'datetime',
        'accepted_at' => 'datetime',
        'rejected_at' => 'datetime',
    ];

    /**
     * العلاقات
     */

    /**
     * العرض ينتمي إلى طلب واحد
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    /**
     * النطاقات المسماة (Named Scopes)
     */

    /**
     * العروض المعلقة
     */
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }

    /**
     * العروض المقبولة
     */
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }

    /**
     * العروض المرفوضة
     */
    public function scopeRejected($query)
    {
        return $query->where('status', 'rejected');
    }

    /**
     * العروض المسحوبة
     */
    public function scopeWithdrawn($query)
    {
        return $query->where('status', 'withdrawn');
    }

    /**
     * العروض المقدمة خلال فترة زمنية معينة
     */
    public function scopeExtendedBetween($query, $startDate, $endDate)
    {
        return $query->whereBetween('extended_at', [$startDate, $endDate]);
    }

    /**
     * العروض حسب الحالة
     */
    public function scopeByStatus($query, string $status)
    {
        return $query->where('status', $status);
    }
}
