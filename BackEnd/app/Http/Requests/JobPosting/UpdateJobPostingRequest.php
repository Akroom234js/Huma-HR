<?php

namespace App\Http\Requests\JobPosting;

use Illuminate\Foundation\Http\FormRequest;

class UpdateJobPostingRequest extends FormRequest
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
            'title' => 'sometimes|required|string|max:255',
            'description' => 'sometimes|required|string',
            'department_id' => 'nullable|exists:departments,id',
            'salary_min' => 'nullable|string',
            'salary_max' => 'nullable|string',
            'salary_currency' => 'nullable|string|max:10',
            'location' => 'nullable|string|max:255',
            'employment_type' => 'nullable|in:full-time,part-time,contract,temporary,internship',
            'experience_level' => 'nullable|in:entry-level,associate,mid-senior,director,executive',
            'application_deadline' => 'nullable|date|after:today',
            'status' => 'nullable|in:draft,open,closed,archived',
        ];
    }

    /**
     * رسائل الخطأ المخصصة
     */
    public function messages(): array
    {
        return [
            'title.max' => 'عنوان الوظيفة يجب أن لا يتجاوز 255 حرف.',
            'department_id.exists' => 'القسم المحدد غير موجود.',
            'application_deadline.after' => 'موعد التقديم يجب أن يكون بعد اليوم.',
            'status.in' => 'حالة الوظيفة غير صحيحة.',
        ];
    }
}
