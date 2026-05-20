<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

/**
 * StoreApplicationRequest — التحقق من بيانات تقديم الطلب
 *
 * ليش FormRequest بدل validation داخل Controller؟
 * ──────────────────────────────────────────────
 * نفس السبب في باقي مشروعك — Thin Controllers
 * الـ Controller ما يعرف شي عن الـ validation rules
 * لو احتجت تغير الـ rules بتغيرها من هون بس
 */
class StoreApplicationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // الحماية في الـ Route — الوظيفة متاحة للعموم
    }

    public function rules(): array
    {
        return [
            // ─── بيانات المتقدم الأساسية ──────────────────────
            'full_name' => 'required|string|max:255',
            'email'     => 'required|email|max:255',
            'phone'     => 'nullable|string|max:20',

            // ─── السيرة الذاتية ────────────────────────────────
            // required: لأن الـ AI يحتاجها للتقييم
            // mimes: PDF أو Word فقط — لا صور لا نصوص
            // max:5120: 5MB حد أقصى
            // ليش 5MB؟ لو رفع 50MB الـ PHP بتنفجر في الذاكرة
            'resume'       => 'required|file|mimes:pdf,doc,docx|max:5120',

            // ─── خطاب التغطية (اختياري) ───────────────────────
            'cover_letter' => 'nullable|file|mimes:pdf,doc,docx|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'full_name.required' => 'الاسم الكامل مطلوب.',
            'email.required'     => 'البريد الإلكتروني مطلوب.',
            'email.email'        => 'البريد الإلكتروني غير صحيح.',
            'resume.required'    => 'السيرة الذاتية مطلوبة.',
            'resume.mimes'       => 'السيرة الذاتية يجب أن تكون PDF أو Word.',
            'resume.max'         => 'حجم السيرة الذاتية لا يتجاوز 5MB.',
            'cover_letter.mimes' => 'خطاب التغطية يجب أن يكون PDF أو Word.',
            'cover_letter.max'   => 'حجم خطاب التغطية لا يتجاوز 5MB.',
        ];
    }

    // ✅ نفس نمط مشروعك — failedValidation موحد
    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(
            response()->json([
                'status'  => false,
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }
}
