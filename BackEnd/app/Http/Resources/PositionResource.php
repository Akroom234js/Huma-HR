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
            'description'  => $this->description,
            'requirements' => $this->requirements,
            'reporting_to' => $this->reporting_to,
            'department'   => $this->whenLoaded('department', fn() => [
                'id'   => $this->department->id,
                'name' => $this->department->name,
            ]),
            // عدد الشواغر من job_postings
            'openings'     => $this->whenCounted('jobPostings'),
            'created_at'   => $this->created_at?->format('Y-m-d'),
        ];
    }
}
