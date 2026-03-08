<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeExperience extends Model
{
    protected $fillable = [
        'user_id',
        'company_name',
        'job_title',
        'period',
        'skills_acquired',
    ];
 public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}


}
