<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\EmployeeProfile;

class StoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'employee_profile_id'  => ['required', 'exists:employee_profiles,id'],
            'title'                => ['required', 'string', 'max:255'],
            'description'          => ['nullable', 'string'],
            'due_date'             => ['required', 'date', 'after:today'],
            'difficulty'           => ['required', 'in:easy,medium,hard'],
            'priority'             => ['required', 'in:low,medium,high,urgent'],
            'late_penalty_per_day' => ['nullable', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            $managerProfile = auth()->user()->employeeProfile;

            if (! $managerProfile) {
                $validator->errors()->add('employee_profile_id', 'Manager profile not found.');
                return;
            }

            $employee = EmployeeProfile::find($this->employee_profile_id);

            // التحقق أن الموظف في نفس قسم المدير
            if ($employee && $employee->department_id !== $managerProfile->department_id) {
                $validator->errors()->add(
                    'employee_profile_id',
                    'You can only assign tasks to employees in your department.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'employee_profile_id.required' => 'Employee is required.',
            'employee_profile_id.exists'   => 'Selected employee does not exist.',
            'title.required'               => 'Task title is required.',
            'due_date.required'            => 'Due date is required.',
            'due_date.after'               => 'Due date must be in the future.',
            'difficulty.in'                => 'Difficulty must be easy, medium, or hard.',
            'priority.in'                  => 'Priority must be low, medium, high, or urgent.',
            'late_penalty_per_day.max'     => 'Late penalty cannot exceed 100 points per day.',
        ];
    }
}
