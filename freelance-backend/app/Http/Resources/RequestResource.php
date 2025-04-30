<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RequestResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @param Request $request
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'service_buyer_id' => $this->service_buyer_id,
            'buyer_name' => $this->serviceBuyer->name, 
            'project_id' => $this->project_id,
            'project_title' => $this->project->title, 
            'message' => $this->message,
            'status' => $this->status,
            'review' => $this->whenLoaded('review', function () {
                return [
                    'rating' => $this->review->rating,
                    'review_text' => $this->review->review,
                ];
            }),
            'created_at' => $this->created_at->toDateTimeString(),
            'updated_at' => $this->updated_at->toDateTimeString(),
        ];
    }
}
