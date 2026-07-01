<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PeerEvaluation extends Model
{
    use SoftDeletes;

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

    protected $casts = [
        'collaboration_score' => 'integer',
        'teamwork_score'      => 'integer',
    ];

    // ─── Relationships ────────────────────────────────────────────

    public function performanceCycle(): BelongsTo
    {
        return $this->belongsTo(PerformanceCycle::class, 'performance_cycle_id');
    }

    // الموظف المُقيَّم (employee_profile_id هو العمود الصحيح، مش evaluatee_id)
    public function employee(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'employee_profile_id');
    }
}
