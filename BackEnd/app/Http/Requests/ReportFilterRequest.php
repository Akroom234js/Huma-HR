<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class ReportFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        // الصلاحية محكومة أصلاً بـ middleware role:hr على مستوى الراوت
        return true;
    }

    public function rules(): array
    {
        return [
            'month' => 'nullable|integer|between:1,12',
            'year'  => 'nullable|integer|between:2020,2100',
        ];
    }

    public function period(): array
    {
        return [
            (int)($this->validated('month') ?? now()->month),
            (int)($this->validated('year') ?? now()->year),
        ];
    }
}
