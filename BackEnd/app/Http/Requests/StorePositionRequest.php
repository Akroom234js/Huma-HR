<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class StorePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // الحماية عبر Middleware role:hr
    }

    public function rules(): array
    {
        return [
            'title'              => 'required|string|max:255',
            'department_id'      => 'nullable|exists:departments,id',
            'parent_position_id' => [
                'nullable',
                'exists:positions,id',
                function ($attr, $value, $fail) {
                    if ($value && $value == $this->route('position')?->id) {
                        $fail('A position cannot be its own parent.');
                    }
                }
            ],
            'is_managerial'      => 'boolean',
            'description'        => 'nullable|string',
            'requirements'       => 'nullable|string',
            'reporting_to'       => 'nullable|string', // kept for backward compat
            'min_salary'         => 'nullable|numeric|min:0',
            'max_salary'         => 'nullable|numeric|min:0',
            'tax_percent'        => 'nullable|numeric|min:0|max:100',
            'insurance_amount'   => 'nullable|numeric|min:0',
            'allowances'         => 'nullable|numeric|min:0',
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
