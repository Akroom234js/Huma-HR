<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use App\Models\User;
use App\Models\EmployeeProfile;
use App\Models\EmployeeMovement;
use App\Models\AdjustmentType;

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
        'effective_date'   => 'date',
        'current_salary'   => 'decimal:2',
        'new_salary'       => 'decimal:2',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function employeeProfile(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    public function movement(): BelongsTo
    {
        return $this->belongsTo(EmployeeMovement::class, 'employee_movement_id');
    }

    public function adjustmentType(): BelongsTo
    {
        return $this->belongsTo(AdjustmentType::class, 'adjustment_type_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
