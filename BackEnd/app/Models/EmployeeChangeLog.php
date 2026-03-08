<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EmployeeChangeLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'user_id',
        'field_changed',
        'changed_by',
        'previous_value',
        'new_value',
        'changed_at',
    ];

    protected function casts(): array
    {
        return [
            'changed_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
{
    return $this->belongsTo(User::class);
}
}
