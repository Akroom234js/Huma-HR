<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateTaskRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'title'                => ['sometimes', 'string', 'max:255'],
            'description'          => ['sometimes', 'nullable', 'string'],
            'due_date'             => ['sometimes', 'date', 'after:today'],
            'difficulty'           => ['sometimes', 'in:easy,medium,hard'],
            'priority'             => ['sometimes', 'in:low,medium,high,urgent'],
            'late_penalty_per_day' => ['sometimes', 'integer', 'min:0', 'max:100'],
        ];
    }

    public function withValidator($validator): void
    {
        $validator->after(function ($validator) {

            $task = $this->route('task');

            // لا يمكن تعديل مهمة مقيّمة
            if ($task && $task->status === 'scored') {
                $validator->errors()->add('status', 'Cannot update a task that has already been scored.');
            }
        });
    }

    public function messages(): array
    {
        return [
            'due_date.after'       => 'Due date must be in the future.',
            'difficulty.in'        => 'Difficulty must be easy, medium, or hard.',
            'priority.in'          => 'Priority must be low, medium, high, or urgent.',
            'late_penalty_per_day.max' => 'Late penalty cannot exceed 100 points per day.',
        ];
    }
}
