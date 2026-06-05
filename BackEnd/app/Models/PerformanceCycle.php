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
        'performance_template_id',
        'start_date',
        'end_date',
        'status',
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

    // من أنشأ الدورة (موظف الـ HR)
    public function creator(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'created_by');
    }

    // من وافق على تفعيل الدورة (مدير النظام)
    public function approver(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'approved_by');
    }

    // القالب المرتبط بالدورة
    public function template(): BelongsTo
    {
        return $this->belongsTo(PerformanceTemplate::class, 'performance_template_id');
    }

    // المكونات والأوزان المرتبطة بها (للإبقاء على التوافقية القديمة إن لزم الأمر)
    public function components(): HasMany
    {
        return $this->hasMany(PerformanceCycleComponent::class, 'performance_cycle_id');
    }

    // التقييمات المرتبطة بهذه الدورة
    public function evaluations(): HasMany
    {
        return $this->hasMany(PerformanceEvaluation::class, 'performance_cycle_id');
    }

    // ─── Scopes ───────────────────────────────────────────────────

    // الدورات النشطة حالياً
    public function scopeActive(Builder $query): Builder
    {
        return $query->where('status', 'active');
    }

    // الدورات المكتملة
    public function scopeCompleted(Builder $query): Builder
    {
        return $query->where('status', 'completed');
    }

    // ─── Domain Methods & Helpers ─────────────────────────────────

    /**
     * التحقق من أن مدة الدورة بين 3 أشهر وسنة، وبالشهور الكاملة
     */
    public function isValidDuration(): bool
    {
        if (!$this->start_date || !$this->end_date) {
            return false;
        }

        $start = Carbon::parse($this->start_date);
        $end = Carbon::parse($this->end_date)->copy()->addDay(); // إضافة يوم واحد لحساب الشهور الكاملة بدقة

        // حساب الفرق بالشهور الكاملة بدقة
        $diffInMonths = $start->diffInMonths($end);
        
        // التحقق من الشرط: لا تقل عن 3 أشهر ولا تزيد عن 12 شهراً
        if ($diffInMonths < 3 || $diffInMonths > 12) {
            return false;
        }

        // للتحقق من عدم وجود كسور شهور (مثل 3 أشهر ونصف)
        // يجب أن تتوافق الأيام الإجمالية مع نطاق الشهور المتوقعة
        $diffInDays = $start->diffInDays($end);
        $expectedDaysMin = $diffInMonths * 28;
        $expectedDaysMax = $diffInMonths * 31 + 1;
        
        if ($diffInDays < $expectedDaysMin || $diffInDays > $expectedDaysMax) {
            return false;
        }

        return true;
    }

    /**
     * التحقق ديناميكياً من أن مجموع أوزان المكونات المفعلة يساوي تماماً 100%
     */
    public function areWeightsValid(): bool
    {
        $template = $this->template ?: PerformanceTemplate::find($this->performance_template_id);
        if (!$template) {
            return false;
        }

        $config = $template->config;
        if (!isset($config['components'])) {
            return false;
        }

        $total = 0.0;
        foreach ($config['components'] as $key => $component) {
            if (!empty($component['is_active'])) {
                $total += floatval($component['weight']);
                
                // التأكد من أن المكونات الفرعية للمدير تساوي 100% أيضاً
                if ($key === 'manager' && isset($component['sub_components'])) {
                    $subTotal = 0.0;
                    foreach ($component['sub_components'] as $sub) {
                        $subTotal += floatval($sub['weight']);
                    }
                    if (round($subTotal, 2) !== 100.00) {
                        return false;
                    }
                }
            }
        }

        return round($total, 2) === 100.00;
    }
}
