<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Attachment extends Model
{
    use HasFactory;

    // =========================================================
    // الحقول القابلة للملء
    // =========================================================
    // مبنية على أعمدة migration عندك بالضبط:
    // file_url, file_name, file_type, file_size, uploaded_at
    protected $fillable = [
        'application_id',
        'file_url',    // ← اسمه في migration عندك file_url مش file_path
        'file_name',
        'file_type',   // resume أو attachment
        'file_size',   // بالبايت
        'uploaded_at',
    ];

    // =========================================================
    // Casts
    // =========================================================
    protected $casts = [
        // ✅ uploaded_at كـ datetime
        // ليش؟ بدونه بيرجع كـ string
        // مع الـ cast تقدر تعمل:
        // $attachment->uploaded_at->diffForHumans() → "5 minutes ago"
        'uploaded_at' => 'datetime',

        // ✅ file_size كـ integer
        // ليش؟ DB بيخزنه كـ bigInteger
        // الـ cast يضمن إنك تشتغل مع رقم مش string
        // مفيد لما تحسب الحجم: $size / 1024 / 1024 → MB
        'file_size'   => 'integer',
    ];

    // =========================================================
    // العلاقات
    // =========================================================

    /**
     * المرفق ينتمي لطلب توظيف واحد
     * ليش مهم؟ تقدر تعمل:
     * $attachment->application->full_name
     * أو $attachment->application->jobPosting->title
     */
    public function application(): BelongsTo
    {
        return $this->belongsTo(Application::class);
    }

    // =========================================================
    // ✅ Accessor: حجم الملف بشكل مقروء
    // =========================================================

    /**
     * يحول حجم الملف من Bytes لنص مقروء
     * ليش مفيد؟ بدل ما تعرض "1048576 bytes" للـ Frontend
     * بتعرض "1.00 MB" تلقائياً
     *
     * الاستخدام: $attachment->file_size_human → "2.5 MB"
     */
    public function getFileSizeHumanAttribute(): string
    {
        $bytes = $this->file_size;

        if ($bytes >= 1048576) {
            return round($bytes / 1048576, 2) . ' MB';
        }

        if ($bytes >= 1024) {
            return round($bytes / 1024, 2) . ' KB';
        }

        return $bytes . ' B';
    }
}
