<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PeerEvaluation extends Model
{
    use HasFactory;

    protected $table = 'peer_evaluations';

    protected $fillable = [
        'performance_cycle_id',
        'evaluatee_id',
        'anonymous_token',
        'encrypted_comment',
        'score',
    ];

    // Relationships
    public function performanceCycle()
    {
        return $this->belongsTo(PerformanceCycle::class);
    }

    public function evaluatee()
    {
        return $this->belongsTo(EmployeeProfile::class, 'evaluatee_id');
    }
}
?>
