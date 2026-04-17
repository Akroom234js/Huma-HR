<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeRequest extends Model
{
    use HasFactory;

    protected $fillable = [
        'employee_profile_id',
        'type',
        'status',
        'reason',
        'details',
        'actioned_by',
        'actioned_at',
    ];

    protected $casts = [
        'details' => 'array',
        'actioned_at' => 'datetime',
    ];

    public function employeeProfile(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    public function actionedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actioned_by');
    }
}
