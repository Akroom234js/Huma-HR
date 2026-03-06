<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        // Auth
        'email',
        'password',

        // Personal Information
        'full_name',
        'employee_id',
        'address',
        'emergency_contacts',

        // Employment & Contract
        'start_date',
        'job_title',
        'department',
        'direct_supervisor',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'password'          => 'hashed',
            'start_date'        => 'date',
        ];
    }

    // ── Relationships ──────────────────────────────────────────────────────────

    public function experiences(): HasMany
    {
        return $this->hasMany(EmployeeExperience::class);
    }

    public function changeLogs(): HasMany
    {
        return $this->hasMany(EmployeeChangeLog::class)->orderByDesc('changed_at');
    }

    // ── Helper: log a field change ─────────────────────────────────────────────

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
