<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function __construct(mixed $resource)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'created_at' => $this->created_at,
            'profile' => $this->when($this->relationLoaded('profile'), fn() => [
                'username' => $this->profile?->username,
                'display_name' => $this->profile?->display_name,
                'bio' => $this->profile?->bio,
                'avatar_url' => $this->profile?->avatar_url,
                'plan' => $this->profile?->plan ?? 'free',
                'role' => $this->profile?->role ?? 'user',
                'trial_ends_at' => $this->profile?->trial_ends_at,
                'onboarding_completed' => $this->profile?->onboarding_completed ?? false,
                'stripe_customer_id' => $this->profile?->stripe_customer_id,
            ]),
        ];
    }
}
