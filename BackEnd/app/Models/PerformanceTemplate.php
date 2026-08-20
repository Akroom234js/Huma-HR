<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PerformanceTemplate extends Model
{
    protected $fillable = [
        'name',
        'is_active',
        'components',
    ];

    protected $casts = [
        'is_active'  => 'boolean',
        'components' => 'array',
    ];

    // ─── Relationships ────────────────────────────────────────────

    public function cycles(): HasMany
    {
        return $this->hasMany(PerformanceCycle::class, 'performance_template_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────

    /**
     * إرجاع إعدادات القالب بشكل موحّد
     */
    public function getConfigAttribute(): array
    {
        return ['components' => $this->components ?? []];
    }

    /**
     * التحقق من أن مجموع أوزان المكونات النشطة = 100
     */
    public function areWeightsValid(): bool
    {
        $components = $this->components ?? [];

        $total = collect($components)
            ->filter(fn($c) => is_array($c) ? !empty($c['is_active']) : true)
            ->sum(fn($c) => is_array($c) ? floatval($c['weight'] ?? 0) : floatval($c));

        return abs($total - 100) <= 0.05;
    }
}
