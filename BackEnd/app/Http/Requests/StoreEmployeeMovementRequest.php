<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StoreEmployeeMovementRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // الحماية عبر Middleware role:hr
    }

    public function rules(): array
    {
        $type = $this->input('movement_type');

        $rules = [
            'employee_profile_id' => 'required|exists:employee_profiles,id',
            'movement_type'       => 'required|in:promotion,transfer,department_change,salary_adjustment',
            'movement_date'       => 'required|date',
            'notes'               => 'nullable|string',
        ];

        // ── Promotion ──────────────────────────────────────────────────────
        if ($type === 'promotion') {
            $rules['new_position']  = 'required|string|max:255';
            $rules['effective_date']= 'required|date';
            $rules['manager_id']    = 'nullable|exists:users,id';
        }

        // ── Transfer ───────────────────────────────────────────────────────
        if ($type === 'transfer') {
            $rules['new_position']       = 'required|string|max:255';
            $rules['manager_id']         = 'nullable|exists:users,id';
            $rules['effective_date']     = 'required|date';
            $rules['adjustment_reason']  = 'nullable|string';
        }

        // ── Department Change ──────────────────────────────────────────────
        if ($type === 'department_change') {
            $rules['new_department_id']  = 'required|exists:departments,id';
            $rules['effective_date']     = 'required|date';
            // manager_id هنا من مدراء القسم الجديد فقط — التحقق في الـ Controller
            $rules['manager_id']         = 'required|exists:users,id';
        }

        // ── Salary Adjustment ──────────────────────────────────────────────
        if ($type === 'salary_adjustment') {
            $rules['new_salary']           = 'required|numeric|min:0';
            $rules['effective_date']       = 'required|date';
            $rules['adjustment_type_id']   = 'nullable|exists:adjustment_types,id';
            $rules['custom_type_name']     = 'nullable|string|max:255';
            $rules['adjustment_reason']    = 'nullable|string';
        }

        return $rules;
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
