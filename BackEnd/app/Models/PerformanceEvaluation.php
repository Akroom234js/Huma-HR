<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\Builder;

class PerformanceEvaluation extends Model
{
    protected $table = 'performance_evaluations';

    protected $fillable = [
        'performance_cycle_id',
        'employee_profile_id',
        'department_id',
        'employment_status',
        'tasks_score',
        'manager_score',
        'peer_score',
        'attendance_score',
        'overtime_score',
        'self_score',
        'final_score',
        'status',
        'ai_analysis',
        'ai_recommendations',
        'evaluated_at',
    ];

    protected $casts = [
        'tasks_score'        => 'decimal:2',
        'manager_score'      => 'decimal:2',
        'peer_score'         => 'decimal:2',
        'attendance_score'   => 'decimal:2',
        'overtime_score'     => 'decimal:2',
        'self_score'         => 'decimal:2',
        'final_score'        => 'decimal:2',
        'ai_analysis'        => 'array',
        'ai_recommendations' => 'array',
        'evaluated_at'       => 'datetime',
    ];

    // ─── Relationships ────────────────────────────────────────────

    public function performanceCycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceCycle::class, 'performance_cycle_id');
    }

    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'employee_profile_id');
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class, 'department_id');
    }

    // جلب أحدث إجراء مقترح للتقييم (للعرض في تفاصيل التقييم)
    public function performanceAction(): HasOne
    {
        return $this->hasOne(PerformanceAction::class, 'performance_evaluation_id')->latest();
    }

    // جلب كل الإجراءات المرتبطة بالتقييم (للمراجعة الكاملة من الـ HR)
    public function actions(): HasMany
    {
        return $this->hasMany(PerformanceAction::class, 'performance_evaluation_id');
    }

    // ─── Scopes ───────────────────────────────────────────────────

    public function scopeEligible(Builder $query): Builder
    {
        return $query->where('status', 'eligible');
    }

    public function scopeExcludedByVacation(Builder $query): Builder
    {
        return $query->where('status', 'excluded_vacation');
    }

    public function scopeEvaluated(Builder $query): Builder
    {
        return $query->where('status', 'evaluated');
    }

    // ─── Calculations ─────────────────────────────────────────────

    /**
     * حساب الدرجة النهائية من مكونات القالب الديناميكي المفعلة
     */
    public function calculateFinalScore(): float
    {
        if ($this->status === 'excluded_vacation') {
            return 0.00;
        }

        $cycle = $this->performanceCycle;
        if (! $cycle) {
            return 0.00;
        }

        // جلب الإعدادات من القالب المرتبط بالدورة
        $template = $cycle->template;
        if (! $template) {
            return 0.00;
        }

        $config = $template->config;
        $components = $config['components'] ?? [];

        $scoreMap = [
            'tasks'           => floatval($this->tasks_score      ?? 0),
            'manager'         => floatval($this->manager_score    ?? 0),
            'peer'            => floatval($this->peer_score       ?? 0),
            'attendance'      => floatval($this->attendance_score ?? 0),
            'overtime'        => floatval($this->overtime_score   ?? 0),
            'self_assessment' => floatval($this->self_score       ?? 0),
        ];

        $totalScore = 0.00;

        foreach ($components as $key => $component) {
            if (!empty($component['is_active'])) {
                $score       = $scoreMap[$key] ?? 0.00;
                $totalScore += ($score * floatval($component['weight'])) / 100;
            }
        }

        $this->final_score = round($totalScore, 2);

        return $this->final_score;
    }
}
