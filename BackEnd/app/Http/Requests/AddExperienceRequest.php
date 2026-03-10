<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class AddExperienceRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['hr', 'boss']);
    }

    public function rules(): array
    {
        return [
            'company_name'    => ['required', 'string', 'max:255'],
            'job_title'       => ['required', 'string', 'max:255'],
            'period'          => ['required', 'string', 'max:100'],
            'skills_acquired' => ['nullable', 'string', 'max:500'],
        ];
    }

    public function messages(): array
    {
        return [
            'company_name.required' => 'Company name is required.',
            'job_title.required'    => 'Job title is required.',
            'period.required'       => 'Period is required (e.g. Jan 2020 - Dec 2021).',
        ];
    }

    public function attributes(): array
    {
        return [
            'company_name'    => 'Company Name',
            'job_title'       => 'Job Title',
            'period'          => 'Period',
            'skills_acquired' => 'Skills Acquired',
        ];
    }

    protected function failedValidation(Validator $validator): never
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Validation failed.',
                'errors'  => $validator->errors(),
            ], 422)
        );
    }

    protected function failedAuthorization(): never
    {
        throw new HttpResponseException(
            response()->json([
                'message' => 'Only HR or Boss can add experience entries.',
            ], 403)
        );
    }
}

