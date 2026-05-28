<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class LeaveType extends Model
{
    use HasFactory;

    protected $fillable = [
        'name_en',
        'name_ar',
        'allocation',
        'desc_en',
        'desc_ar',
        'is_paid',
        'requires_approval',
    ];

    protected $casts = [
        'is_paid' => 'boolean',
        'requires_approval' => 'boolean',
    ];

    protected static function booted()
    {
        // When a new leave type is created, automatically create a balance for all employees
        static::created(function ($leaveType) {
            $employees = EmployeeProfile::all();
            foreach ($employees as $employee) {
                LeaveBalance::firstOrCreate(
                    [
                        'employee_profile_id' => $employee->id,
                        'leave_type_id' => $leaveType->id,
                    ],
                    [
                        'allocated' => $leaveType->allocation,
                        'used' => 0,
                        'remaining' => $leaveType->allocation,
                    ]
                );
            }
        });
    }

    public function balances(): HasMany
    {
        return $this->hasMany(LeaveBalance::class);
    }
}
