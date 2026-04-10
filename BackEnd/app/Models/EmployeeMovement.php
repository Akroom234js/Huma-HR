<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class EmployeeMovement extends Model
{
    protected $fillable = [
        'employee_profile_id',
        'movement_type',
        'previous_value',
        'new_value',
        'movement_date',
        'notes',
        'created_by',
    ];

    protected $casts = [
        'movement_date' => 'date',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function employeeProfile(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // علاقة للتفاصيل في حال كانت salary_adjustment
    public function salaryAdjustment(): HasOne
    {
        return $this->hasOne(SalaryAdjustment::class);
    }

    // ── Query Scopes ──────────────────────────────────────────────────────────

    public function scopeOfType(Builder $query, string $type): Builder
    {
        return $query->where('movement_type', $type);
    }

    public function scopeSearch(Builder $query, string $value): Builder
    {
        return $query->whereHas('employeeProfile', fn($q) =>
            $q->where('full_name', 'like', "%{$value}%")
              ->orWhere('employee_id', 'like', "%{$value}%")
        );
    }

    public function scopeDateRange(Builder $query, ?string $from, ?string $to): Builder
    {
        return $query
            ->when($from, fn($q) => $q->whereDate('movement_date', '>=', $from))
            ->when($to,   fn($q) => $q->whereDate('movement_date', '<=', $to));
    }
}
