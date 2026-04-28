<?php

namespace App\Http\Requests\Interview;

use Illuminate\Foundation\Http\FormRequest;

class RecordFeedbackRequest extends FormRequest
{
    /**
     * تحديد ما إذا كان المستخدم مصرحاً بتقديم هذا الطلب
     */
    public function authorize(): bool
    {
        return $this->user()->hasRole(['admin', 'hr', 'manager', 'interviewer']);
    }

    /**
     * قواعد التحقق من الصحة
     */
    public function rules(): array
    {
        return [
            'feedback' => 'nullable|string',
            'rating' => 'nullable|integer|min:1|max:5',
        ];
    }

    /**
     * رسائل الخطأ المخصصة
     */
    public function messages(): array
    {
        return [
            'rating.integer' => 'التقييم يجب أن يكون رقماً.',
            'rating.min' => 'التقييم يجب أن يكون على الأقل 1.',
            'rating.max' => 'التقييم يجب أن لا يتجاوز 5.',
        ];
    }
}
