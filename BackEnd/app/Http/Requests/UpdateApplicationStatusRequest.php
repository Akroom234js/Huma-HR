
<?php

namespace App\Http\Requests;

use App\Models\Application;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;
use Illuminate\Validation\Rule;

/**
 * UpdateApplicationStatusRequest — التحقق من تغيير حالة الطلب
 *
 * يُستخدم فقط في endpoint الـ PATCH /applications/{id}/status
 * باقي الـ endpoints (shortlist, hire...) ما تحتاج request خاص
 * لأنها محددة بـ method name
 */
class UpdateApplicationStatusRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // الحماية عبر Middleware role:hr
    }

    public function rules(): array
    {
        return [
            // ✅ in rule مع كل الحالات الممكنة
            // حتى لو الـ Pipeline Guard رح يتحقق لاحقاً
            // هاد خط الدفاع الأول — يمنع قيم عشوائية
            'status' => [
                'required',
                'string',
                Rule::in([
                    Application::STATUS_REVIEWED,
                    Application::STATUS_SHORTLISTED,
                    Application::STATUS_INTERVIEWING,
                    Application::STATUS_OFFERED,
                    Application::STATUS_HIRED,
                    Application::STATUS_REJECTED,
                    Application::STATUS_WITHDRAWN,
                    Application::STATUS_NO_SHOW,
                    Application::STATUS_EXPIRED,
                ]),
            ],

            // feedback اختياري — HR ممكن يضيف تعليق أو لا
            'feedback'      => 'nullable|string|max:1000',

            // current_stage اختياري — لو HR بدو يحدد المرحلة يدوياً
            'current_stage' => 'nullable|string|max:255',
        ];
    }

    public function messages(): array
    {
        return [
            'status.required' => 'الحالة مطلوبة.',
            'status.in'       => 'الحالة المدخلة غير صحيحة.',
        ];
    }

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
