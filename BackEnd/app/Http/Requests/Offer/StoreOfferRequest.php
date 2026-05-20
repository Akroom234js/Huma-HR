<?php

namespace App\Http\Requests\Offer;

use Illuminate\Foundation\Http\FormRequest;

class StoreOfferRequest extends FormRequest
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
            'offered_salary' => 'required|numeric|min:0',
            'salary_currency' => 'nullable|string|max:10',
            'start_date' => 'required|date|after:today',
        ];
    }

    /**
     * رسائل الخطأ المخصصة
     */
    public function messages(): array
    {
        return [
            'offered_salary.required' => 'الراتب المعروض مطلوب.',
            'offered_salary.numeric' => 'الراتب المعروض يجب أن يكون رقماً.',
            'offered_salary.min' => 'الراتب المعروض يجب أن يكون موجباً.',
            'start_date.required' => 'تاريخ البدء مطلوب.',
            'start_date.after' => 'تاريخ البدء يجب أن يكون بعد اليوم.',
        ];
    }
}
