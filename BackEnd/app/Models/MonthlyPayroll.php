<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MonthlyPayroll extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_profile_id',
        'month',
        'basic_salary',
        'overtime_hours',
        'overtime_amount',
        'deductions',
        'final_net_salary',
        'status',
        'paid_at',
        'paid_by',
        'extra_details',
    ];

    protected $casts = [
        'deductions' => 'array',
        'extra_details' => 'array',
        'paid_at' => 'datetime',
    ];

    public function employeeProfile(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    public function paidBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'paid_by');
    }
}
