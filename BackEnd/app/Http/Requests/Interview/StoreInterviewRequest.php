<?php

namespace App\Http\Requests\Interview;

use Illuminate\Foundation\Http\FormRequest;

class StoreInterviewRequest extends FormRequest
{
    /**
     * تحديد ما إذا كان المستخدم مصرحاً بتقديم هذا الطلب
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'hr', 'manager']);
    }

    /**
     * قواعد التحقق من الصحة
     */
    public function rules(): array
    {
        return [
            'interviewer_id' => 'required|exists:users,id',
            'interview_type' => 'required|in:phone,video,in-person,technical,hr',
            'scheduled_at' => 'required|date|after:now',
        ];
    }

    /**
     * رسائل الخطأ المخصصة
     */
    public function messages(): array
    {
        return [
            'interviewer_id.required' => 'معرف المحاور مطلوب.',
            'interviewer_id.exists' => 'المحاور المحدد غير موجود.',
            'interview_type.required' => 'نوع المقابلة مطلوب.',
            'interview_type.in' => 'نوع المقابلة غير صحيح.',
            'scheduled_at.required' => 'تاريخ ووقت المقابلة مطلوب.',
            'scheduled_at.after' => 'تاريخ ووقت المقابلة يجب أن يكون في المستقبل.',
        ];
    }
}
