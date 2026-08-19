<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class PeerEvaluation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peer_evaluations';

    // ✅ مطابق تماماً لأعمدة migration الفعلية
    protected $fillable = [
        'performance_cycle_id',
        'employee_profile_id',
        'token_hash',
        'collaboration_score',
        'teamwork_score',
        'encrypted_comment',
        'iv',
    ];

    // ─── Relationships ────────────────────────────────────────────

    public function performanceCycle()
    {
        return $this->belongsTo(PerformanceCycle::class, 'performance_cycle_id');
    }

    /**
     * الموظف المُقيَّم (evaluatee)
     */
    public function employee()
    {
        return $this->belongsTo(EmployeeProfile::class, 'employee_profile_id');
    }

    // ─── Helpers ─────────────────────────────────────────────────

    /**
     * الدرجة المتوسطة من 10 → 100
     */
    public function getAverageScoreAttribute(): float
    {
        return round(($this->collaboration_score + $this->teamwork_score) / 2 * 10, 2);
    }
}
