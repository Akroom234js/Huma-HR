<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class JobPosting extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للملء (Fillable)
     */
    protected $fillable = [
        'title',
        'description',
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

    /**
     * تحويل البيانات (Casts)
     */
    protected $casts = [
        'posted_at' => 'datetime',
        'application_deadline' => 'datetime',
    ];

    /**
     * العلاقات
     */

    /**
     * الوظيفة تنتمي إلى قسم واحد
     */
    public function department(): BelongsTo
    {
        return $this->belongsTo(Department::class);
    }

    /**
     * الوظيفة تم إنشاؤها بواسطة مستخدم واحد
     */
    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    /**
     * الوظيفة تم تحديثها بواسطة مستخدم واحد
     */
    public function updater(): BelongsTo
    {
        return $this->belongsTo(User::class, 'updated_by');
    }

    /**
     * الوظيفة لها العديد من الطلبات
     */
    public function applications(): HasMany
    {
        return $this->hasMany(Application::class);
    }

    /**
     * النطاقات المسماة (Named Scopes)
     */

    /**
     * الوظائف المفتوحة فقط
     */
    public function scopeOpen($query)
    {
        return $query->where('status', 'open');
    }

    /**
     * الوظائف المغلقة
     */
    public function scopeClosed($query)
    {
        return $query->where('status', 'closed');
    }

    /**
     * الوظائف المنشورة (بعد تاريخ معين)
     */
    public function scopePublished($query)
    {
        return $query->whereNotNull('posted_at');
    }

    /**
     * الوظائف حسب القسم
     */
    public function scopeByDepartment($query, int $departmentId)
    {
        return $query->where('department_id', $departmentId);
    }

    /**
     * الوظائف حسب مستوى الخبرة
     */
    public function scopeByExperienceLevel($query, string $level)
    {
        return $query->where('experience_level', $level);
    }

    /**
     * الوظائف حسب نوع التوظيف
     */
    public function scopeByEmploymentType($query, string $type)
    {
        return $query->where('employment_type', $type);
    }
}
