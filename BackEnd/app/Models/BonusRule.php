<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class BonusRule extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'target_type',
        'target_id',
        'amount',
        'is_percentage',
        'frequency',
        'apply_month',
        'condition_type',
        'condition_value',
        'is_active'
    ];

    protected $casts = [
        'is_percentage' => 'boolean',
        'is_active' => 'boolean',
        'amount' => 'decimal:2',
    ];
}
