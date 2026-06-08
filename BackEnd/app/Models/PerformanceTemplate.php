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

    // الدورات التي استخدمت هذا القالب
    public function cycles(): HasMany
    {
        return $this->hasMany(PerformanceCycle::class, 'performance_template_id');
    }

    // ─── Helpers ──────────────────────────────────────────────────

    /**
     * جلب القالب النشط الحالي
     */
    public static function getActive(): ?self
    {
        return self::where('is_active', true)->first();
    }

    /**
     * التحقق من أن مجموع الأوزان = 100
     */
    public function areWeightsValid(): bool
    {
        $components = $this->components ?? [];
        $total = collect($components)->sum('weight');
        return round($total, 2) === 100.00;
    }

    /**
     * جلب وزن مكوّن معين
     */
    public function getComponentWeight(string $key): float
    {
        $components = $this->components ?? [];
        return floatval($components[$key]['weight'] ?? 0);
    }

    /**
     * هل المكوّن موجود في هذا القالب؟
     */
    public function hasComponent(string $key): bool
    {
        $components = $this->components ?? [];
        return isset($components[$key]);
    }
}
