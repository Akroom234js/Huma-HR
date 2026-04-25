<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Department extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'head_id', // إضافة الحقل الجديد هنا للسماح بعمليات الإدخال والتحديث
    ];

    /**
     * علاقة القسم بالوظائف الشاغرة المرتبطة به.
     */
    public function jobPostings(): HasMany
    {
        return $this->hasMany(JobPosting::class);
    }

    /**
     * علاقة القسم بالموظفين التابعين له.
     */
    public function employees(): HasMany
    {
        return $this->hasMany(EmployeeProfile::class, 'department_id');
    }

    /**
     * علاقة القسم بمدير القسم (رئيس القسم).
     * هذه العلاقة تسمح لنا بجلب اسم المدير مباشرة في الإحصائيات.
     */
    public function head(): BelongsTo
    {
        return $this->belongsTo(EmployeeProfile::class, 'head_id');
    }
}