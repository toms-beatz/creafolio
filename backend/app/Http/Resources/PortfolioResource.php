<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PortfolioResource extends JsonResource
{
    public function __construct(mixed $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id'           => $this->id,
            'user_id'      => $this->user_id,
            'title'        => $this->title,
            'slug'         => $this->slug,
            'description'  => $this->description,
            'content'      => $this->content,
            'craft_state'  => $this->craft_state,
            'theme'        => $this->theme,
            'status'       => $this->status,
            'is_published' => $this->is_published,
            'published_at' => $this->published_at?->toISOString(),
            'created_at'   => $this->created_at->toISOString(),
            'updated_at'   => $this->updated_at->toISOString(),
        ];
    }
}
