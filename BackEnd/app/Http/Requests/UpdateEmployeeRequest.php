<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class UpdateEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // الحماية تتم عبر Middleware في الـ Route
    }

    public function rules(): array
    {
        // نأخذ الـ id من الـ URL
        $profileId = $this->route('id');

        return [
            // ── Personal Information ───────────────────────────────────────
            'full_name'              => 'sometimes|string|max:255',
            'employee_id'            => "sometimes|string|unique:employee_profiles,employee_id,{$profileId}",
            'date_of_birth'          => 'sometimes|date|before:today',
            'marital_status'         => 'sometimes|in:single,married,divorced,widowed',
            'phone_number'           => 'sometimes|string|max:20',
            'address'                => 'sometimes|string',
            'emergency_contacts'     => 'sometimes|string',
            'profile_pic'            => 'sometimes|image|mimes:jpg,jpeg,png|max:2048',

            // ── Job Information ────────────────────────────────────────────
            'job_title'              => 'sometimes|string|max:255',
            'employment_status'      => 'sometimes|in:active,on_leave,inactive,terminated',
            'department_id'          => 'sometimes|nullable|exists:departments,id',
            'manager_id'             => 'sometimes|nullable|exists:employee_profiles,id',
            'branch'                 => 'sometimes|string|max:255',
            'city'                   => 'sometimes|string|max:255',
            'grade'                  => 'sometimes|string|max:255',

            // ── Dates ──────────────────────────────────────────────────────
            'start_date'             => 'sometimes|date',
            'internal_transfer_date' => 'sometimes|date',
            'resignation_date'       => 'sometimes|date',
            'salary'                 => 'sometimes|numeric|min:0',
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
