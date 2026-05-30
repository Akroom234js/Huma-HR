<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceCycleComponent extends Model
{
    protected $table = 'performance_cycle_components';

    protected $fillable = [
        'performance_cycle_id',
        'component_key',
        'weight',
        'is_active',
    ];

    protected $casts = [
        'weight'    => 'decimal:2',
        'is_active' => 'boolean',
    ];

    // الدورة التي ينتمي إليها المكون
    public function performanceCycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceCycle::class, 'performance_cycle_id');
    }
}
