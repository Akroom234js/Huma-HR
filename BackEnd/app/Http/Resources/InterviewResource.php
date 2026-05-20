<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class InterviewResource extends JsonResource
{
    /**
     * تحويل المورد إلى مصفوفة
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'application' => $this->whenLoaded('application', fn() => [
                'id' => $this->application->id,
                'full_name' => $this->application->full_name,
                'email' => $this->application->email,
            ]),
            'interviewer' => $this->whenLoaded('interviewer', fn() => [
                'id' => $this->interviewer->id,
                'name' => $this->interviewer->name,
                'email' => $this->interviewer->email,
            ]),
            'interview_type' => $this->interview_type,
            'status' => $this->status,
            'scheduled_at' => $this->scheduled_at->format('Y-m-d H:i:s'),
            'conducted_at' => $this->conducted_at?->format('Y-m-d H:i:s'),
            'feedback' => $this->feedback,
            'rating' => $this->rating,
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
