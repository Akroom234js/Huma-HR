<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Contracts\Validation\Validator;
use Illuminate\Http\Exceptions\HttpResponseException;

class RegisterEmployeeRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() && $this->user()->hasAnyRole(['hr', 'boss']);
    }

    public function rules(): array
    {
        return [
              // ── Users Table ────────────────────────────────────────────────
            'email'                 => 'required|email|unique:users,email',
            'password'              => 'required|min:8|confirmed',

            // ── Employee Profile ───────────────────────────────────────────
            'full_name'             => 'required|string|max:255',
            'employee_id'           => 'nullable|string|unique:employee_profiles,employee_id',
            'date_of_birth'         => 'nullable|date|before:today',
            'marital_status'        => 'nullable|in:single,married,divorced,widowed',
            'phone_number'          => 'nullable|string|max:20',
            'address'               => 'nullable|string',
            'emergency_contacts'    => 'nullable|string',
            'profile_pic'           => 'nullable|image|mimes:jpg,jpeg,png|max:2048',

            // ── Job Information ────────────────────────────────────────────
            'manager_id'            => 'nullable|exists:users,id',
            'branch'                => 'nullable|string|max:255',
            'city'                  => 'nullable|string|max:255',
            'grade'                 => 'nullable|string|max:255',

            // ── Dates ──────────────────────────────────────────────────────
            'start_date'            => 'nullable|date',
            'internal_transfer_date'=> 'nullable|date',
            'resignation_date'      => 'nullable|date',
        ];
    }

    public function messages(): array
    {
        return [
            'email.required'                          => 'Employee email is required.',
            'email.unique'                            => 'This email is already registered.',
            'password.required'                       => 'A temporary password is required.',
            'password.min'                            => 'Password must be at least 8 characters.',
            'password.confirmed'                      => 'Passwords do not match.',
            'full_name.required'                      => 'Employee full name is required.',
            'employee_id.unique'                      => 'This Employee ID is already taken.',
            'start_date.before_or_equal'              => 'Start date cannot be in the future.',
            'department_id.exists'                    => 'Selected department does not exist.',
            'manager_id.exists'                       => 'Selected manager does not exist.',
            'profile_pic.image'                       => 'Profile picture must be an image.',
            'profile_pic.max'                         => 'Profile picture cannot exceed 2MB.',

        ];
    }

    public function attributes(): array
    {
        return [
            'name'                       => 'Full Name',
            'employee_id'                => 'Employee ID',
            'start_date'                 => 'Start Date',
            'job_title'                  => 'Job Title',
            'department_id'              => 'Department',
            'manager_id'                 => 'Direct Supervisor',
            'employment_type'            => 'Employment Type',
            'profile_pic'                => 'Profile Picture',

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
                'message' => 'Only HR or Boss can register new employees.',
            ], 403)
        );
    }
}
