<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class SalaryAdjustmentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        // حساب نسبة التغيير
        $changePercent = $this->current_salary > 0
            ? round((($this->new_salary - $this->current_salary) / $this->current_salary) * 100, 1)
            : 0;

        return [
            'id'             => $this->id,
            'employee'       => $this->whenLoaded('employeeProfile', fn() => [
                'id'          => $this->employeeProfile->id,
                'full_name'   => $this->employeeProfile->full_name,
                'employee_id' => $this->employeeProfile->employee_id,
                'job_title'   => $this->employeeProfile->job_title,
                'profile_pic' => $this->employeeProfile->profile_pic_url,
            ]),
            'old_salary'     => (float) $this->current_salary,
            'new_salary'     => (float) $this->new_salary,
            // display_type جاهز للفرونت — بدون if/else من جهته
            // إذا custom → يرجع النص اليدوي
            // إذا معروف → يرجع اسمه من adjustment_types
            'display_type'   => $this->display_type,
            'change_percent' => ($changePercent > 0 ? '+' : '') . $changePercent . '%',
            'effective_date' => $this->effective_date?->format('Y-m-d'),
            'reason'         => $this->adjustment_reason,
            'created_by'     => $this->whenLoaded('createdBy', fn() => [
                'id'        => $this->createdBy->id,
                'full_name' => $this->createdBy->profile?->full_name ?? $this->createdBy->email,
            ]),
            'created_at'     => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
