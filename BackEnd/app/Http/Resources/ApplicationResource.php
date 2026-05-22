<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * ApplicationResource — تنسيق بيانات الطلب للـ Frontend
 *
 * ليش Resource بدل ما نرجع الـ Model مباشرة؟
 * ──────────────────────────────────────────
 * 1. نتحكم بشكل الـ Response — ما نكشف بيانات حساسة
 * 2. نضيف بيانات محسوبة مثل file_size_human
 * 3. لو غيرنا اسم عمود في DB، نعدل هون بس
 *    بدون ما نكسر الـ Frontend
 * 4. نفس نمط EmployeeResource الموجود في مشروعك
 */
class ApplicationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            // ─── بيانات أساسية ────────────────────────────────
            'id'                 => $this->id,
            'full_name'          => $this->full_name,
            'email'              => $this->email,
            'phone'              => $this->phone,
            'date_of_birth'      => $this->date_of_birth?->format('Y-m-d'),
            'address'            => $this->address,
            'emergency_contacts' => $this->emergency_contacts,

            // ─── حالة الطلب ───────────────────────────────────
            'status'        => $this->status,
            'current_stage' => $this->current_stage,
            'feedback'      => $this->feedback,

            // ─── نتائج التقييم الذكي ──────────────────────────
            // match_score: الرقم النهائي 0-100
            'match_score'   => $this->match_score,

            // ai_analysis: الـ cast في الموديل بيرجعه array تلقائياً
            // نرجعه كاملاً — Frontend يعرض منه strengths, weaknesses...
            'ai_analysis'   => $this->ai_analysis,

            // ─── مؤشر التقييم ─────────────────────────────────
            // ✅ مفيد للـ Frontend: هل التقييم خلّص أم لسا؟
            // لو null → Queue لسا ما شتغل، اعرض "جار التقييم..."
            // لو موجود → اعرض النتيجة
            'is_evaluated'  => $this->evaluated_at !== null,
            'evaluated_at'  => $this->evaluated_at?->format('Y-m-d H:i'),

            // ─── التواريخ ─────────────────────────────────────
            'submitted_at'  => $this->submitted_at?->format('Y-m-d H:i'),
            'reviewed_at'   => $this->reviewed_at?->format('Y-m-d H:i'),

            // ─── الانتقالات المسموحة ───────────────────────────
            // ✅ مفيد جداً للـ Frontend
            // بدل ما يعرض كل الأزرار ويخفي غير المناسبة
            // بيعرض بس الأزرار اللي مسموح بيها فعلاً
            'allowed_transitions' => app(\App\Services\ATS\ApplicationPipelineGuard::class)
                ->getAllowedTransitions($this->status),

            // ─── الوظيفة المرتبطة ─────────────────────────────
            // whenLoaded: لو ما عملنا with('jobPosting') ما يعمل query إضافي
            'job_posting'   => $this->whenLoaded('jobPosting', fn() => [
                'id'     => $this->jobPosting->id,
                'title'  => $this->jobPosting->title,
                'status' => $this->jobPosting->status,
            ]),

            // ─── المرفقات ─────────────────────────────────────
            'attachments'   => $this->whenLoaded('attachments', fn() =>
                $this->attachments->map(fn($att) => [
                    'id'             => $att->id,
                    'file_name'      => $att->file_name,
                    'file_type'      => $att->file_type,
                    'file_size_human'=> $att->file_size_human, // "2.5 MB"
                    'uploaded_at'    => $att->uploaded_at?->format('Y-m-d'),
                ])
            ),

            // ─── المقابلات المجدولة ─────────────────────────────────
            'interviews'    => $this->whenLoaded('interviews', fn() =>
                $this->interviews->map(fn($int) => [
                    'id'             => $int->id,
                    'interviewer_id' => $int->interviewer_id,
                    'interviewer_name'=> $int->interviewer?->employeeProfile?->full_name ?? $int->interviewer?->name ?? 'N/A',
                    'interview_type' => $int->interview_type,
                    'scheduled_at'   => $int->scheduled_at?->format('Y-m-d H:i'),
                    'status'         => $int->status,
                    'feedback'       => $int->feedback,
                    'rating'         => $int->rating,
                ])
            ),
        ];
    }
}
