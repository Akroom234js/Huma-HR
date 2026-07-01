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

    // ─── Helpers ──────────────────────────────────────────────────

    public static function getActive(): ?self
    {
        return self::where('is_active', true)->first();
    }

    /**
     * مجموع أوزان المكونات المفعلة فقط = 100
     */
    public function areWeightsValid(): bool
    {
        $components = collect($this->components ?? [])->filter(fn($c) => !empty($c['is_active']));
        $total = $components->sum('weight');
        return round($total, 2) === 100.00;
    }

    public function getComponentWeight(string $key): float
    {
        $components = $this->components ?? [];
        return floatval($components[$key]['weight'] ?? 0);
    }

    public function hasComponent(string $key): bool
    {
        $components = $this->components ?? [];
        return isset($components[$key]) && !empty($components[$key]['is_active']);
    }

    /**
     * جلب sub_components لمكوّن معين (الاسم الموحّد في كل المشروع)
     */
    public function getSubComponents(string $key): array
    {
        $components = $this->components ?? [];
        return $components[$key]['sub_components'] ?? [];
    }
}
