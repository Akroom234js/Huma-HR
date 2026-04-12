<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class AdjustmentType extends Model
{
    protected $fillable = ['name', 'is_other'];

    protected $casts = [
        'is_other' => 'boolean',
    ];

    public function salaryAdjustments(): HasMany
    {
        return $this->hasMany(SalaryAdjustment::class);
    }
}
