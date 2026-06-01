<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StorePerformanceCycleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'                      => ['required', 'string', 'max:100'],
            'start_date'                 => ['required', 'date', 'after_or_equal:today'],
            'end_date'                   => ['required', 'date', 'after:start_date'],

            'components'                 => ['required', 'array', 'min:1'],
            'components.*.component_key' => ['required', 'string', 'in:tasks,manager,peer,attendance,overtime,self_assessment'],
            'components.*.weight'        => ['required', 'numeric', 'min:1', 'max:100'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            // ── 1. مدة الدورة بين 3 و 12 شهر بالشهور الكاملة ──────────
            if ($this->start_date && $this->end_date) {
                $start = \Carbon\Carbon::parse($this->start_date);
                $end   = \Carbon\Carbon::parse($this->end_date)->addDay();

                $diffInMonths = $start->diffInMonths($end);
                $diffInDays   = $start->diffInDays($end);

                if ($diffInMonths < 3 || $diffInMonths > 12) {
                    $validator->errors()->add('end_date', 'Cycle duration must be between 3 and 12 complete months.');
                    return;
                }

                // لا كسور شهور (مثلاً 3 أشهر ونص)
                $minDays = $diffInMonths * 28;
                $maxDays = $diffInMonths * 31 + 1;

                if ($diffInDays < $minDays || $diffInDays > $maxDays) {
                    $validator->errors()->add('end_date', 'Cycle duration must be in complete months only (no partial months).');
                }
            }

            // ── 2. مجموع الأوزان = 100 بالضبط ──────────────────────────
            if ($this->components && is_array($this->components)) {
                $total = collect($this->components)->sum('weight');

                if (round($total, 2) !== 100.00) {
                    $validator->errors()->add('components', "Component weights must sum to exactly 100. Current sum: {$total}.");
                }

                // ── 3. لا يمكن تكرار نفس component_key ─────────────────
                $keys = collect($this->components)->pluck('component_key');

                if ($keys->count() !== $keys->unique()->count()) {
                    $validator->errors()->add('components', 'Duplicate component keys are not allowed in the same cycle.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'title.required'                      => 'Cycle title is required.',
            'start_date.required'                 => 'Start date is required.',
            'start_date.after_or_equal'           => 'Start date must be today or in the future.',
            'end_date.required'                   => 'End date is required.',
            'end_date.after'                      => 'End date must be after start date.',
            'components.required'                 => 'At least one evaluation component is required.',
            'components.*.component_key.required' => 'Each component must have a key.',
            'components.*.component_key.in'       => 'Invalid component key. Allowed: tasks, manager, peer, attendance, overtime, self_assessment.',
            'components.*.weight.required'        => 'Each component must have a weight.',
            'components.*.weight.min'             => 'Component weight must be at least 1.',
            'components.*.weight.max'             => 'Component weight cannot exceed 100.',
        ];
    }
}
