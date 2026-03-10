<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
class EmployeeProfile extends Model
{
    protected $fillable = [
        'user_id',
        'full_name',
        'employee_id',
        'date_of_birth',
        'marital_status',
        'phone_number',
        'address',
        'emergency_contacts',
        'profile_pic',
        //'job_title', --- IGNORE ---
        //'department_id', --- IGNORE ---
        'manager_id',
        'branch',
        'city',
         'grade',
         'start_date',
         'internal_transfer_date',
         'resignation_date'
    ];
     // ── Relationships ──────────────────────────────────────────────────────────

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'manager_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(EmployeeProfile::class, 'manager_id');
    }

    public function experiences(): HasMany
    {
        return $this->hasMany(EmployeeExperience::class);
    }

    public function changeLogs(): HasMany
    {
        return $this->hasMany(EmployeeChangeLog::class)->orderByDesc('changed_at');
    }
     
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    public function logChange(string $field, mixed $oldValue, mixed $newValue, string $changedBy): void
    {
        $this->changeLogs()->create([
            'field_changed'  => $field,
            'changed_by'     => $changedBy,
            'previous_value' => $oldValue ?? '-',
            'new_value'      => $newValue ?? '-',
        ]);
    }

    public function getProfilePicUrlAttribute(): ?string
    {
        return $this->profile_pic
            ? asset('storage/' . $this->profile_pic)
            : null;
    }
}
