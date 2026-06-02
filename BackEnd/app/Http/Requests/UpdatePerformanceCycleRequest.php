<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdatePerformanceCycleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'                      => ['sometimes', 'string', 'max:100'],
            'start_date'                 => ['sometimes', 'date'],
            'end_date'                   => ['sometimes', 'date', 'after:start_date'],

            'components'                 => ['sometimes', 'array', 'min:1'],
            'components.*.component_key' => ['required_with:components', 'string', 'in:tasks,manager,peer,attendance,overtime,self_assessment'],
            'components.*.weight'        => ['required_with:components', 'numeric', 'min:1', 'max:100'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            $cycle = $this->route('cycle');

            // ── لا يمكن تعديل دورة غير draft ────────────────────────────
            if ($cycle && $cycle->status !== 'draft') {
                $validator->errors()->add('status', 'Only draft cycles can be updated.');
                return;
            }

            // ── مدة الدورة إذا تم تعديل التواريخ ────────────────────────
            $start = $this->start_date ?? $cycle?->start_date;
            $end   = $this->end_date   ?? $cycle?->end_date;

            if ($start && $end) {
                $startC = \Carbon\Carbon::parse($start);
                $endC   = \Carbon\Carbon::parse($end)->addDay();

                $diffInMonths = $startC->diffInMonths($endC);
                $diffInDays   = $startC->diffInDays($endC);

                if ($diffInMonths < 3 || $diffInMonths > 12) {
                    $validator->errors()->add('end_date', 'Cycle duration must be between 3 and 12 complete months.');
                    return;
                }

                $minDays = $diffInMonths * 28;
                $maxDays = $diffInMonths * 31 + 1;

                if ($diffInDays < $minDays || $diffInDays > $maxDays) {
                    $validator->errors()->add('end_date', 'Cycle duration must be in complete months only.');
                }
            }

            // ── مجموع الأوزان = 100 إذا أرسل المكونات ───────────────────
            if ($this->components && is_array($this->components)) {
                $total = collect($this->components)->sum('weight');

                if (round($total, 2) !== 100.00) {
                    $validator->errors()->add('components', "Component weights must sum to exactly 100. Current sum: {$total}.");
                }

                $keys = collect($this->components)->pluck('component_key');

                if ($keys->count() !== $keys->unique()->count()) {
                    $validator->errors()->add('components', 'Duplicate component keys are not allowed.');
                }
            }
        });
    }

    public function messages(): array
    {
        return [
            'components.*.component_key.in' => 'Invalid component key. Allowed: tasks, manager, peer, attendance, overtime, self_assessment.',
            'components.*.weight.min'        => 'Component weight must be at least 1.',
            'components.*.weight.max'        => 'Component weight cannot exceed 100.',
        ];
    }
}
