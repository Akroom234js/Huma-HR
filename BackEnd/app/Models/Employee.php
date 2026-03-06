<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Spatie\Permission\Traits\HasRoles;

class Employee extends Model
{
    use HasFactory, HasRoles;

    protected $fillable = [
        'user_id',
        'employee_id',
        'address',
        'start_date',
        'role',
        'department_id',
        'manager_id',
        'profile_pic',
        'employment_type',
        'last_login_at',
    ];

    protected function casts(): array
    {
        return [
            'start_date'    => 'date',
            'last_login_at' => 'datetime',
        ];
    }

    // ── Existing Relationships ─────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function manager(): BelongsTo
    {
        return $this->belongsTo(Employee::class, 'manager_id');
    }

    public function subordinates(): HasMany
    {
        return $this->hasMany(Employee::class, 'manager_id');
    }

    // ── New Relationships ──────────────────────────────────────────────────────

    public function experiences(): HasMany
    {
        return $this->hasMany(EmployeeExperience::class);
    }

    public function changeLogs(): HasMany
    {
        return $this->hasMany(EmployeeChangeLog::class)->orderByDesc('changed_at');
    }

    // ── Existing Accessors ─────────────────────────────────────────────────────

    public function getProfilePicUrlAttribute(): ?string
    {
        return $this->profile_pic ? asset('storage/' . $this->profile_pic) : null;
    }

    public function getFullNameAttribute(): string
    {
        return $this->user->name;
    }

    // ── New Helper ─────────────────────────────────────────────────────────────

    public function logChange(string $field, mixed $oldValue, mixed $newValue, string $changedBy): void
    {
        $this->changeLogs()->create([
            'field_changed'  => $field,
            'changed_by'     => $changedBy,
            'previous_value' => $oldValue ?? '-',
            'new_value'      => $newValue ?? '-',
        ]);
    }
}

