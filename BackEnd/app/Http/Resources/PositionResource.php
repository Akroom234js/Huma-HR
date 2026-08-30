<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PositionResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'title'        => $this->title,
            'department_id'=> $this->department_id,
            'description'  => $this->description,
            'requirements' => $this->requirements,
            'reporting_to' => $this->reporting_to,
            'department'   => $this->whenLoaded('department', fn() => [
                'id'   => $this->department->id,
                'name' => $this->department->name,
            ]),
            'min_salary'       => $this->min_salary,
            'max_salary'       => $this->max_salary,
            'tax_percent'      => $this->tax_percent,
            'insurance_amount' => $this->insurance_amount,
            'allowances'       => $this->allowances,
            'openings'         => (int) ($this->openings ?? 1),
            'assigned_count'   => (int) ($this->employees_count ?? ($this->relationLoaded('employees') ? $this->employees->count() : 0)),
            'available_openings' => max(0, (int) ($this->openings ?? 1) - (int) ($this->employees_count ?? ($this->relationLoaded('employees') ? $this->employees->count() : 0))),
            'employees'        => $this->whenLoaded('employees', fn() => $this->employees->map(fn($e) => [
                'id'          => $e->id,
                'name'        => $e->full_name,
                'employee_id' => $e->employee_id,
                'profile_pic' => $e->profile_pic,
            ])),
            'created_at'   => $this->created_at?->format('Y-m-d'),
        ];
    }
}
