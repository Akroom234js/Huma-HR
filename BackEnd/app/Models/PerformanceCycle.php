<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Builder;
use Carbon\Carbon;

class PerformanceCycle extends Model
{
    protected $fillable = [
        'title',
        'start_date',
        'end_date',
        'status',
        'performance_template_id',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'start_date'  => 'date',
        'end_date'    => 'date',
        'approved_at' => 'datetime',
    ];

    // ─── Relationships ────────────────────────────────────────────

    public function template(): BelongsTo
    {
        return $this->belongsTo(PerformanceTemplate::class, 'performance_template_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'approved_by');
    }

    public function evaluations(): HasMany
    {
        return $this->hasMany(PerformanceEvaluation::class, 'performance_cycle_id');
    }

    // ─── Scopes ───────────────────────────────────────────────────

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    // ─── Helpers ──────────────────────────────────────────────────

    /**
     * التحقق من مدة الدورة — بين 3 و 12 شهر بالشهور الكاملة
     */
    public function isValidDuration(): bool
    {
        if (! $this->start_date || ! $this->end_date) {
            return false;
        }

        $start        = Carbon::parse($this->start_date);
        $end          = Carbon::parse($this->end_date)->addDay();
        $diffInMonths = $start->diffInMonths($end);
        $diffInDays   = $start->diffInDays($end);

        if ($diffInMonths < 3 || $diffInMonths > 12) {
            return false;
        }

        $minDays = $diffInMonths * 28;
        $maxDays = $diffInMonths * 31 + 1;

        return $diffInDays >= $minDays && $diffInDays <= $maxDays;
    }

    /**
     * التحقق من أن القالب صالح وأوزانه = 100
     */
    public function areWeightsValid(): bool
    {
        return $this->template?->areWeightsValid() ?? false;
    }

    /**
     * التفعيل والإغلاق التلقائي
     * يُستدعى في كل request على الـ cycles
     */
    public static function autoUpdateCycles(): void
    {
        // draft → active عند وصول start_date
        self::where('status', 'draft')
            ->whereDate('start_date', '<=', now()->toDateString())
            ->update(['status' => 'active']);

        // active → processing عند انتهاء end_date
        $expired = self::where('status', 'active')
            ->whereDate('end_date', '<', now()->toDateString())
            ->get();

        foreach ($expired as $cycle) {
            $cycle->update(['status' => 'processing']);
            \App\Jobs\ProcessPerformanceJob::dispatch($cycle);
        }
    }
}
