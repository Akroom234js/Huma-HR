<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Conversation extends Model
{
    protected $fillable = [
        'participant_one_id',
        'participant_two_id',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    public function participantOne(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_one_id');
    }

    public function participantTwo(): BelongsTo
    {
        return $this->belongsTo(User::class, 'participant_two_id');
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class)->orderBy('created_at', 'asc');
    }

    public function latestMessage(): HasMany
    {
        return $this->hasMany(Message::class)->latest()->limit(1);
    }

    /**
     * Get the other participant (not the current user).
     */
    public function otherParticipant(int $userId): ?User
    {
        if ($this->participant_one_id === $userId) {
            return $this->participantTwo;
        }
        return $this->participantOne;
    }

    /**
     * Count unread messages for a given user in this conversation.
     */
    public function unreadCountFor(int $userId): int
    {
        return $this->messages()
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->count();
    }
}
