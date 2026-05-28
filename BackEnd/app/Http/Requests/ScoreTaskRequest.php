<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ScoreTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'completion_score' => ['required', 'numeric', 'min:0', 'max:100'],
            'quality_score'    => ['required', 'numeric', 'min:0', 'max:100'],
            'manager_note'     => ['nullable', 'string', 'max:1000'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            $task = $this->route('task');

            // فقط المهام بحالة pending_review تقدر تتقيّم
            if ($task && $task->status !== 'pending_review') {
                $validator->errors()->add(
                    'status',
                    'Only tasks with status pending_review can be scored.'
                );
            }
        });
    }

    public function messages(): array
    {
        return [
            'completion_score.required' => 'Completion score is required.',
            'completion_score.min'      => 'Completion score cannot be less than 0.',
            'completion_score.max'      => 'Completion score cannot exceed 100.',
            'quality_score.required'    => 'Quality score is required.',
            'quality_score.min'         => 'Quality score cannot be less than 0.',
            'quality_score.max'         => 'Quality score cannot exceed 100.',
        ];
    }
}
