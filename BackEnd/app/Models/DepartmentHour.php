<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class DepartmentHour extends Model
{
    protected $table = 'department_hours';

    protected $fillable = [
        'dept',
        'start_time',
        'end_time',
        'grace_period',
        'work_days',
    ];

    protected $casts = [
        'work_days' => 'array',
    ];
}
