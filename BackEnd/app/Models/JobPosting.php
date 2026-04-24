<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobPosting extends Model
{
    // السماح بإضافة البيانات لهذه الحقول
    protected $fillable = ['position_id', 'title', 'description', 'status', 'department_id'];

    // تعريف العلاقة العكسية
    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }
}