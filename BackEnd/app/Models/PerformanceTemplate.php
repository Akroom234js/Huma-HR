<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceTemplate extends Model
{
    protected $table = 'performance_templates';

    protected $fillable = [
        'name',
        'is_active',
        'config',
    ];

    protected $casts = [
        'config'    => 'array',
        'is_active' => 'boolean',
    ];

    /**
     * الدورات التي تم إنشاؤها باستخدام هذا القالب
     */
    public function cycles(): HasMany
    {
        return $this->hasMany(PerformanceCycle::class, 'performance_template_id');
    }
}
