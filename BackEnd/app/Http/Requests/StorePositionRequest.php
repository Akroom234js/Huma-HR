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
            'title'         => 'required|string|max:255',
            'department_id' => 'nullable|exists:departments,id',
            'description'   => 'nullable|string',
            'requirements'  => 'nullable|string',
            'reporting_to'  => 'nullable|string',
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
