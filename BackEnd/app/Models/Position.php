<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Position extends Model
{
    protected $fillable = [
        'title',
        'department_id',
        'openings',
        'description',
        'requirements',
        'reporting_to',
        'min_salary',
        'max_salary',
        'tax_percent',
        'insurance_amount',
        'allowances',
        // Hierarchy fields
        'parent_position_id',
        'hierarchy_level',
        'is_managerial',
    ];

    // ── Relationships ─────────────────────────────────────────────────────────

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function parent(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'parent_position_id');
    }

    public function children(): HasMany
    {
        return $this->hasMany(Position::class, 'parent_position_id');
    }

    public function employees(): HasMany
    {
        return $this->hasMany(EmployeeProfile::class, 'position_id');
    }

    public function employee(): HasOne
    {
        return $this->hasOne(EmployeeProfile::class, 'position_id');
    }

    // عدد الشواغر المفتوحة من job_postings
    public function jobPostings(): HasMany
    {
        return $this->hasMany(JobPosting::class, 'position_id');
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
