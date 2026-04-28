<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
    use HasFactory;

    /**
     * الحقول القابلة للملء (Fillable)
     */
    protected $fillable = [
        'application_id',
        'file_name',
        'file_path',
        'file_type',
        'file_size',
    ];

    /**
     * تحويل البيانات (Casts)
     */
    protected $casts = [
        'file_size' => 'integer',
    ];

    /**
     * العلاقات
     */

    /**
     * المرفق ينتمي إلى طلب واحد
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    /**
     * النطاقات المسماة (Named Scopes)
     */

    /**
     * المرفقات حسب نوع الملف
     */
    public function scopeByType($query, string $type)
    {
        return $query->where('file_type', $type);
    }

    /**
     * المرفقات لطلب معين
     */
    public function scopeForApplication($query, int $applicationId)
    {
        return $query->where('application_id', $applicationId);
    }

    /**
     * المرفقات حسب حجم الملف (أكبر من)
     */
    public function scopeLargerThan($query, int $size)
    {
        return $query->where('file_size', '>', $size);
    }

    /**
     * المرفقات حسب حجم الملف (أصغر من)
     */
    public function scopeSmallerThan($query, int $size)
    {
        return $query->where('file_size', '<', $size);
    }
}
