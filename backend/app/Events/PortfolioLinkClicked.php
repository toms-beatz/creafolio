<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;

/**
 * Broadcasted via Reverb when a portfolio link is clicked.
 * Listened on channel: analytics.{portfolio_id}
 */
class PortfolioLinkClicked implements ShouldBroadcastNow
{
    public function __construct(
        public readonly int    $portfolioId,
        public readonly string $linkType,
        public readonly string $clickedAt,
    ) {}

    public function broadcastOn(): Channel
    {
        return new Channel("analytics.{$this->portfolioId}");
    }

    public function broadcastAs(): string
    {
        return 'portfolio.link_clicked';
    }

    public function broadcastWith(): array
    {
        return [
            'portfolio_id' => $this->portfolioId,
            'link_type'    => $this->linkType,
            'clicked_at'   => $this->clickedAt,
        ];
    }
}
