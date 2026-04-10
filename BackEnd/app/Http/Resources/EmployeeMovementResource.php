<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EmployeeMovementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'            => $this->id,
            'movement_type' => $this->movement_type,
            'previous_value'=> $this->previous_value,
            'new_value'     => $this->new_value,
            'movement_date' => $this->movement_date?->format('Y-m-d'),
            'notes'         => $this->notes,
            'employee'      => $this->whenLoaded('employeeProfile', fn() => [
                'id'          => $this->employeeProfile->id,
                'full_name'   => $this->employeeProfile->full_name,
                'employee_id' => $this->employeeProfile->employee_id,
                'profile_pic' => $this->employeeProfile->profile_pic_url,
            ]),
            'created_by'    => $this->whenLoaded('createdBy', fn() => [
                'id'    => $this->createdBy->id,
                'email' => $this->createdBy->email,
            ]),
            'created_at'    => $this->created_at?->format('Y-m-d H:i'),
        ];
    }
}
