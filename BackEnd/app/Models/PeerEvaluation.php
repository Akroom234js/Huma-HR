<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeerEvaluation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'peer_evaluations';

    protected $fillable = [
        'performance_cycle_id',
        'employee_profile_id',
        'token_hash',
        'collaboration_score',
        'teamwork_score',
        'encrypted_comment',
        'iv',
    ];

    /**
     * Relationship to performance cycle.
     */
    public function performanceCycle()
    {
        return $this->belongsTo(PerformanceCycle::class);
    }

    /**
     * Relationship to employee profile (the evaluated employee).
     */
    public function employeeProfile()
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    /**
     * Accessor for average score (0‑10).
     */
    public function getAverageScoreAttribute(): float
    {
        return round(($this->collaboration_score + $this->teamwork_score) / 2, 2);
    }
}
?>
