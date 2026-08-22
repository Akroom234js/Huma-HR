<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Task extends Model
{
    protected $fillable = [
        'employee_profile_id',
        'assigned_by',
        'title',
        'description',
        'due_date',
        'difficulty',
        'priority',
        'status',
        'manager_note',
        'submission_notes',
        'attachment',
        'late_penalty_per_day',
        'days_late',
        'completion_score',
        'quality_score',
        'completed_at',
        'scored_at',
    ];

    protected $casts = [
        'due_date'             => 'date',
        'completed_at'         => 'datetime',
        'scored_at'            => 'datetime',
        'completion_score'     => 'decimal:2',
        'quality_score'        => 'decimal:2',
        'late_penalty_per_day' => 'integer',
        'days_late'            => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────

    // الموظف صاحب المهمة
    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'employee_profile_id');
    }

    // المدير الذي أعطى المهمة
    public function assignedBy(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'assigned_by');
    }

    // ─── Accessors ────────────────────────────────────────────────

    // حساب درجة المهمة النهائية
    // المعادلة: (completion_score * 60%) + (quality_score * 40%)
    // مع تطبيق خصم التأخير على completion_score أولاً
    public function getTaskScoreAttribute(): ?float
    {
        if (is_null($this->completion_score) || is_null($this->quality_score)) {
            return null;
        }

        $penalty   = $this->days_late * $this->late_penalty_per_day;
        $completion = max(0, $this->completion_score - $penalty);

        return round(($completion * 0.60) + ($this->quality_score * 0.40), 2);
    }

    // هل المهمة متأخرة؟
    public function getIsOverdueAttribute(): bool
    {
        return $this->due_date->isPast() && ! in_array($this->status, ['scored', 'completed', 'pending_review']);
    }

    // ─── Scopes ───────────────────────────────────────────────────

    // مهام موظف معين
    public function scopeForEmployee($query, int $employeeProfileId)
    {
        return $query->where('employee_profile_id', $employeeProfileId);
    }

    // مهام بين تاريخين (لحساب الأداء في دورة معينة)
    public function scopeBetweenDates($query, string $startDate, string $endDate)
    {
        return $query->whereBetween('due_date', [$startDate, $endDate]);
    }

    // المهام المقيّمة فقط (اللي تدخل في حساب الأداء)
    public function scopeScored($query)
    {
        return $query->where('status', 'scored');
    }

    // المهام بانتظار مراجعة المدير
    public function scopePendingReview($query)
    {
        return $query->where('status', 'pending_review');
    }
}
