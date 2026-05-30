<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PerformanceAction extends Model
{
    protected $table = 'performance_actions';

    protected $fillable = [
        'performance_evaluation_id',
        'action_type',
        'details',
        'status',
        'created_by',
        'approved_by',
        'approved_at',
    ];

    protected $casts = [
        'approved_at' => 'datetime',
    ];

    // التقييم المرتبط بهذا القرار الإداري
    public function evaluation(): BelongsTo
    {
        return $this->belongsTo(PerformanceEvaluation::class, 'performance_evaluation_id');
    }

    // مقترح القرار (المدير أو HR)
    public function creator(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'created_by');
    }

    // معتمد القرار النهائي
    public function approver(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'approved_by');
    }
}
