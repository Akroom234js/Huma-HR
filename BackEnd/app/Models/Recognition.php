<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Recognition extends Model
{
    protected $fillable = [
        'recipient_id',
        'sender_id',
        'message',
        'badge_type',
        'is_public',
    ];

    protected $casts = [
        'is_public' => 'boolean',
    ];

    public function recipient(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'recipient_id');
    }

    public function sender(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'sender_id');
    }
}
