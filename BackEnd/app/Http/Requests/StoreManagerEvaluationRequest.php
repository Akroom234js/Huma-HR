<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use App\Models\PerformanceCycle;
use App\Models\EmployeeProfile;

class StoreManagerEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'performance_cycle_id'  => ['required', 'integer', 'exists:performance_cycles,id'],
            'employee_profile_id'   => ['required', 'integer', 'exists:employee_profiles,id'],
            'professionalism'       => ['required', 'integer', 'between:0,10'],
            'responsibility'        => ['required', 'integer', 'between:0,10'],
            'problem_solving'       => ['required', 'integer', 'between:0,10'],
            'notes'                 => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            // ── الدورة لازم تكون active ───────────────────────────
            $cycle = PerformanceCycle::find($this->performance_cycle_id);
            if ($cycle && $cycle->status !== 'active') {
                $validator->errors()->add(
                    'performance_cycle_id',
                    'Manager evaluations can only be submitted for active cycles.'
                );
                return;
            }

            // ── الموظف لازم يكون من نفس قسم المدير ──────────────
            $managerProfile = auth()->user()->employeeProfile;
            $employee = EmployeeProfile::find($this->employee_profile_id);

            if ($managerProfile && $employee) {
                if ($employee->department_id !== $managerProfile->department_id) {
                    $validator->errors()->add(
                        'employee_profile_id',
                        'You can only evaluate employees in your department.'
                    );
                }

                // ── المدير لا يقيّم نفسه ─────────────────────────
                if ($employee->id === $managerProfile->id) {
                    $validator->errors()->add(
                        'employee_profile_id',
                        'You cannot evaluate yourself.'
                    );
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'performance_cycle_id.required' => 'Performance cycle is required.',
            'employee_profile_id.required'  => 'Employee is required.',
            'professionalism.between'       => 'Professionalism score must be between 0 and 10.',
            'responsibility.between'        => 'Responsibility score must be between 0 and 10.',
            'problem_solving.between'       => 'Problem solving score must be between 0 and 10.',
        ];
    }
}
