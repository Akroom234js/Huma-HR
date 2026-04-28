<?php

namespace App\Http\Requests\Application;

use Illuminate\Foundation\Http\FormRequest;

class UpdateApplicationStatusRequest extends FormRequest
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
            'status' => 'required|in:pending,reviewed,shortlisted,interviewing,offered,hired,rejected,withdrawn',
            'feedback' => 'nullable|string',
            'current_stage' => 'nullable|string|max:255',
        ];
    }

    /**
     * رسائل الخطأ المخصصة
     */
    public function messages(): array
    {
        return [
            'status.required' => 'حالة الطلب مطلوبة.',
            'status.in' => 'حالة الطلب غير صحيحة.',
        ];
    }
}
