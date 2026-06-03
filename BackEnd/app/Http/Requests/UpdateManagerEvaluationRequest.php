<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateManagerEvaluationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'professionalism' => ['sometimes', 'integer', 'between:0,10'],
            'responsibility'  => ['sometimes', 'integer', 'between:0,10'],
            'problem_solving' => ['sometimes', 'integer', 'between:0,10'],
            'notes'           => ['sometimes', 'nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            $evaluation = $this->route('managerEvaluation');

            if (! $evaluation) return;

            // ── فقط من قدّم التقييم يقدر يعدّله ─────────────────
            $managerProfile = auth()->user()->employeeProfile;
            if ($managerProfile && $evaluation->manager_user_id !== auth()->id()) {
                $validator->errors()->add('authorization', 'You can only update your own evaluations.');
                return;
            }

            // ── الدورة لازم تكون active ───────────────────────────
            $cycle = $evaluation->performanceCycle;
            if ($cycle && $cycle->status !== 'active') {
                $validator->errors()->add(
                    'performance_cycle_id',
                    'Cannot update evaluation for a non-active cycle.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'professionalism.between' => 'Professionalism score must be between 0 and 10.',
            'responsibility.between'  => 'Responsibility score must be between 0 and 10.',
            'problem_solving.between' => 'Problem solving score must be between 0 and 10.',
        ];
    }
}
