<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
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
        'job_title',
        'employment_status',
        'department_id',
        'manager_id',
        'branch',
        'city',
        'grade',
        'start_date',
        'internal_transfer_date',
        'resignation_date',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

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

    // ── Query Scopes ──────────────────────────────────────────────────────────

    public function scopeSearch(Builder $query, string $value): Builder
    {
        return $query->where(function ($q) use ($value) {
            $q->where('full_name', 'like', "%{$value}%")
              ->orWhere('employee_id', 'like', "%{$value}%");
        });
    }

    public function scopeStatus(Builder $query, string $value): Builder
    {
        return $query->where('employment_status', $value);
    }

    public function scopeDepartment(Builder $query, int $value): Builder
    {
        return $query->where('department_id', $value);
    }

    public function scopeJobTitle(Builder $query, string $value): Builder
    {
        return $query->where('job_title', 'like', "%{$value}%");
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

    // ── Accessors ─────────────────────────────────────────────────────────────
    // الاستخدام: $employee->profile_pic_url
    // يرجع URL كامل للصورة أو null إذا ما في صورة
    public function getProfilePicUrlAttribute(): ?string
    {
        return $this->profile_pic
            ? asset('storage/' . $this->profile_pic)
            : null;
    }
}
