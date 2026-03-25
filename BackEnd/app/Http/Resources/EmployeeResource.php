<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'user_id'           => $this->user_id,
            'employee_id'       => $this->employee_id,
            'full_name'         => $this->full_name,
            'email'             => $this->user?->email,
            'job_title'         => $this->job_title,
            'employment_status' => $this->employment_status,
            'department'        => $this->whenLoaded('department', fn() => [
                'id'   => $this->department->id,
                'name' => $this->department->name,
            ]),
            'manager'           => $this->whenLoaded('manager', fn() => [
                'id'        => $this->manager->id,
                'full_name' => $this->manager->full_name,
            ]),
            'phone_number'      => $this->phone_number,
            'address'           => $this->address,
            'branch'            => $this->branch,
            'city'              => $this->city,
            'grade'             => $this->grade,
            'start_date'        => $this->start_date?->format('Y-m-d'),
            'date_of_birth'     => $this->date_of_birth?->format('Y-m-d'),
            'marital_status'    => $this->marital_status,
            'profile_pic'       => $this->profile_pic_url,
        ];
    }
}
