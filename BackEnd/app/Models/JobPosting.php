<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPosting extends Model
{
    use HasFactory;
    use SoftDeletes;

    public const STATUS_DRAFT    = 'draft';
    public const STATUS_OPEN     = 'open';
    public const STATUS_CLOSED   = 'closed';
    public const STATUS_ARCHIVED = 'archived';

    protected $fillable = [
        'title',
        'description',
        'position_id',
        'department_id',
        'salary_min',
        'salary_max',
        'salary_currency',
        'status',
        'posted_at',
        'application_deadline',
        'location',
        'employment_type',
        'experience_level',
        'created_by',
        'updated_by',
    ];

    protected $casts = [
        'posted_at'            => 'datetime',
        'application_deadline' => 'datetime',
        'salary_min'           => 'float',
        'salary_max'           => 'float',
    ];

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class);
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    public function scopeOpen($query)
    {
        return $query->where('status', self::STATUS_OPEN);
    }

    public function scopeClosed($query)
    {
        return $query->where('status', self::STATUS_CLOSED);
    }

    public function scopePublished($query)
    {
        return $query->whereNotNull('posted_at');
    }

    public function scopeByDepartment($query, int $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    public function scopeByExperienceLevel($query, string $level)
    {
        return $query->where('experience_level', $level);
    }

    public function scopeByEmploymentType($query, string $type)
    {
        return $query->where('employment_type', $type);
    }

    public function scopeAcceptingApplications($query)
    {
        return $query->where('status', self::STATUS_OPEN)
                     ->where(function ($q) {
                         $q->whereNull('application_deadline')
                           ->orWhere('application_deadline', '>', now());
                     });
    }

    public function getIsActiveAttribute(): bool
    {
        if ($this->status !== self::STATUS_OPEN) {
            return false;
        }

        if ($this->application_deadline &&
            $this->application_deadline->isPast()) {
            return false;
        }

        return true;
    }
}
