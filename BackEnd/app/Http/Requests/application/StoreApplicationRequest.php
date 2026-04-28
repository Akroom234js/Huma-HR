<?php

namespace App\Http\Requests\Application;

use Illuminate\Foundation\Http\FormRequest;

class StoreApplicationRequest extends FormRequest
{
    /**
     * تحديد ما إذا كان المستخدم مصرحاً بتقديم هذا الطلب
     */
    public function authorize(): bool
    {
        return true; // السماح للجميع بتقديم الطلبات
    }

    /**
     * قواعل التحقق من الصحة
     */
    public function rules(): array
    {
        return [
            'full_name' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:20',
            'resume' => 'required|file|mimes:pdf,doc,docx|max:5120', // 5MB
            'cover_letter' => 'nullable|file|mimes:pdf,doc,docx|max:5120', // 5MB
        ];
    }

    /**
     * رسائل الخطأ المخصصة
     */
    public function messages(): array
    {
        return [
            'full_name.required' => 'الاسم الكامل مطلوب.',
            'full_name.max' => 'الاسم الكامل يجب أن لا يتجاوز 255 حرف.',
            'email.required' => 'البريد الإلكتروني مطلوب.',
            'email.email' => 'البريد الإلكتروني يجب أن يكون صحيحاً.',
            'resume.required' => 'السيرة الذاتية مطلوبة.',
            'resume.mimes' => 'السيرة الذاتية يجب أن تكون بصيغة PDF أو Word.',
            'resume.max' => 'حجم السيرة الذاتية يجب أن لا يتجاوز 5 ميجابايت.',
            'cover_letter.mimes' => 'خطاب التغطية يجب أن يكون بصيغة PDF أو Word.',
            'cover_letter.max' => 'حجم خطاب التغطية يجب أن لا يتجاوز 5 ميجابايت.',
        ];
    }
}
