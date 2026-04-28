<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ApplicationResource extends JsonResource
{
    /**
     * تحويل المورد إلى مصفوفة
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'job_posting' => $this->whenLoaded('jobPosting', fn() => [
                'id' => $this->jobPosting->id,
                'title' => $this->jobPosting->title,
            ]),
            'full_name' => $this->full_name,
            'email' => $this->email,
            'phone' => $this->phone,
            'status' => $this->status,
            'current_stage' => $this->current_stage,
            'feedback' => $this->feedback,
            'resume_path' => $this->resume_path,
            'cover_letter_path' => $this->cover_letter_path,
            'submitted_at' => $this->submitted_at?->format('Y-m-d H:i:s'),
            'reviewed_at' => $this->reviewed_at?->format('Y-m-d H:i:s'),
            'interviews_count' => $this->whenCounted('interviews'),
            'offer' => $this->whenLoaded('offer', fn() => [
                'id' => $this->offer->id,
                'offered_salary' => $this->offer->offered_salary,
                'salary_currency' => $this->offer->salary_currency,
                'status' => $this->offer->status,
            ]),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
