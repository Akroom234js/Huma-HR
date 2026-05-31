<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use App\Services\OrgChartService;

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
        'salary',
        'allowances',
        'tax_percent',
        'insurance_amount',
        'department_id',
        'manager_id',
        'position_id',
        'branch',
        'city',
        'grade',
        'start_date',
        'internal_transfer_date',
        'resignation_date',
    ];

    protected $casts = [
        'date_of_birth'          => 'date',
        'start_date'             => 'date',
        'internal_transfer_date' => 'date',
        'resignation_date'       => 'date',
        'salary'                 => 'decimal:2',
        'allowances'             => 'decimal:2',
        'tax_percent'            => 'decimal:2',
        'insurance_amount'       => 'decimal:2',
    ];

    protected static function booted()
    {
        static::created(function ($employee) {
            $leaveTypes = \App\Models\LeaveType::all();
            foreach ($leaveTypes as $type) {
                \App\Models\LeaveBalance::firstOrCreate(
                    [
                        'employee_profile_id' => $employee->id,
                        'leave_type_id' => $type->id,
                    ],
                    [
                        'allocated' => $type->allocation,
                        'used' => 0,
                        'remaining' => $type->allocation,
                    ]
                );
            }
        });

        static::saved(function ($employee) {
            if ($employee->position_id) {
                $position = Position::find($employee->position_id);
                if ($position) {
                    $newParentId = null;
                    if ($employee->manager_id) {
                        $manager = EmployeeProfile::find($employee->manager_id);
                        if ($manager) {
                            $newParentId = $manager->position_id;
                        }
                    }

                    if ($position->parent_position_id !== $newParentId) {
                        $service = app(OrgChartService::class);
                        // Prevent potential cycle creation in the position hierarchy
                        if ($newParentId === null || !$service->wouldCreateCycle($position->id, $newParentId)) {
                            $position->update(['parent_position_id' => $newParentId]);
                            $newLevel = $service->recalculateLevel($position);
                            $service->updateDescendantLevels($position->load('children'), $newLevel);
                        }
                    }
                }
            }
        });
    }

    // ── Relationships ─────────────────────────────────────────────────────────

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    public function position(): BelongsTo
    {
        return $this->belongsTo(Position::class, 'position_id');
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

    public function movements(): HasMany
    {
        return $this->hasMany(EmployeeMovement::class)->orderByDesc('movement_date');
    }

    public function salaryAdjustments(): HasMany
    {
        return $this->hasMany(SalaryAdjustment::class)->orderByDesc('effective_date');
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

    public function getProfilePicUrlAttribute(): ?string
    {
        return $this->profile_pic
            ? asset('storage/' . $this->profile_pic)
            : null;
    }
}
