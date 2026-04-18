<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Position extends Model
{
    protected $fillable = [
        'title',
        'department_id',
        'description',
        'requirements',
        'reporting_to',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    // عدد الشواغر المفتوحة من job_postings
    public function jobPostings(): HasMany
    {
        return $this->hasMany(JobPosting::class);
    }

    // ── Query Scopes ──────────────────────────────────────────────────────────

    public function scopeSearch(Builder $query, string $value): Builder
    {
        return $query->where('title', 'like', "%{$value}%");
    }

    public function scopeByDepartment(Builder $query, int $departmentId): Builder
    {
        return $query->where('department_id', $departmentId);
    }
}
