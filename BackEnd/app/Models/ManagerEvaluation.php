<?php

namespace App\Models;

use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ManagerEvaluation extends Model
{
    use HasFactory, SoftDeletes;

    protected $table = 'manager_evaluations';

    protected $fillable = [
        'performance_cycle_id',
        'employee_profile_id',
        'manager_user_id',
        'professionalism',
        'responsibility',
        'problem_solving',
        'average_score',
        'final_score',
    ];

    /** Relationships */
    public function performanceCycle()
    {
        return $this->belongsTo(PerformanceCycle::class);
    }

    public function employeeProfile()
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    public function manager()
    {
        return $this->belongsTo(User::class, 'manager_user_id');
    }

    /** Auto‑calculate scores before saving */
    protected static function boot()
    {
        parent::boot();
        static::saving(function (self $evaluation) {
            $avg = ($evaluation->professionalism + $evaluation->responsibility + $evaluation->problem_solving) / 3;
            $evaluation->average_score = round($avg, 2);
            $evaluation->final_score   = round($avg * 10, 2);
        });
    }
}
?>
