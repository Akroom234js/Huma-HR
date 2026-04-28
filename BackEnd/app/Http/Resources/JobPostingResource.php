<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class JobPostingResource extends JsonResource
{
    /**
     * تحويل المورد إلى مصفوفة
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'title' => $this->title,
            'description' => $this->description,
            'department' => $this->whenLoaded('department', fn() => [
                'id' => $this->department->id,
                'name' => $this->department->name,
            ]),
            'salary_min' => $this->salary_min,
            'salary_max' => $this->salary_max,
            'salary_currency' => $this->salary_currency,
            'location' => $this->location,
            'employment_type' => $this->employment_type,
            'experience_level' => $this->experience_level,
            'status' => $this->status,
            'posted_at' => $this->posted_at?->format('Y-m-d H:i:s'),
            'application_deadline' => $this->application_deadline?->format('Y-m-d'),
            'created_by' => $this->whenLoaded('creator', fn() => [
                'id' => $this->creator->id,
                'name' => $this->creator->name,
            ]),
            'applications_count' => $this->whenCounted('applications'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
