<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SalaryAdjustment extends Model
{
    protected $fillable = [
        'employee_profile_id',
        'employee_movement_id',
        'adjustment_type_id',
        'custom_type_name',
        'current_salary',
        'new_salary',
        'effective_date',
        'adjustment_reason',
        'created_by',
    ];

    protected $casts = [
        'effective_date'  => 'date',
        'current_salary'  => 'decimal:2',
        'new_salary'      => 'decimal:2',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function employeeProfile(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    public function employeeMovement(): BelongsTo
    {
        return $this->belongsTo(EmployeeMovement::class);
    }

    public function adjustmentType(): BelongsTo
    {
        return $this->belongsTo(AdjustmentType::class);
    }

    public function createdBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    // ── Accessor: display_type ─────────────────────────────────────────────────
    // يرجع اسم النوع جاهز للفرونت بدون if/else
    // إذا custom → يرجع custom_type_name
    // إذا معروف → يرجع اسمه من adjustment_types
    public function getDisplayTypeAttribute(): string
    {
        if ($this->custom_type_name) {
            return $this->custom_type_name;
        }

        return $this->adjustmentType?->name ?? 'Unknown';
    }
}
