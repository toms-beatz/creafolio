<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

/**
 * Broadcasted via Reverb when a unique portfolio visit is recorded.
 * Listened on channel: analytics.{portfolio_id}
 */
class PortfolioViewed implements ShouldBroadcastNow
{
    public function __construct(
        public readonly int    $portfolioId,
        public readonly int    $todayViews,
        public readonly string $viewedAt,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("analytics.{$this->portfolioId}");
    }

    public function broadcastAs(): string
    {
        return 'portfolio.viewed';
    }

    public function broadcastWith(): array
    {
        return [
            'portfolio_id' => $this->portfolioId,
            'today_views'  => $this->todayViews,
            'viewed_at'    => $this->viewedAt,
        ];
    }
}
