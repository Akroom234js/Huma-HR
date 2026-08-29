<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdatePositionRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'              => 'sometimes|string|max:255',
            'department_id'      => 'sometimes|nullable|exists:departments,id',
            'openings'           => 'sometimes|nullable|integer|min:1',
            'parent_position_id' => 'sometimes|nullable|exists:positions,id',
            'is_managerial'      => 'sometimes|boolean',
            'description'        => 'sometimes|nullable|string',
            'requirements'       => 'sometimes|nullable|string',
            'reporting_to'       => 'sometimes|nullable|string',
            'min_salary'         => 'sometimes|nullable|numeric|min:0',
            'max_salary'         => 'sometimes|nullable|numeric|min:0',
            'tax_percent'        => 'sometimes|nullable|numeric|min:0|max:100',
            'insurance_amount'   => 'sometimes|nullable|numeric|min:0',
            'allowances'         => 'sometimes|nullable|numeric|min:0',
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
