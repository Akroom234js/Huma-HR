<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OfferResource extends JsonResource
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
            'offered_salary' => $this->offered_salary,
            'salary_currency' => $this->salary_currency,
            'start_date' => $this->start_date->format('Y-m-d'),
            'status' => $this->status,
            'extended_at' => $this->extended_at->format('Y-m-d H:i:s'),
            'accepted_at' => $this->accepted_at?->format('Y-m-d H:i:s'),
            'rejected_at' => $this->rejected_at?->format('Y-m-d H:i:s'),
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
            'updated_at' => $this->updated_at->format('Y-m-d H:i:s'),
        ];
    }
}
