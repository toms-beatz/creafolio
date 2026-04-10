<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Subscription extends Model
{
    use HasUuids;
    protected $table = 'subscriptions';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'id', 'user_id', 'stripe_subscription_id', 'stripe_price_id',
        'stripe_product_id', 'status', 'current_period_start', 'current_period_end',
        'cancel_at_period_end', 'canceled_at', 'ended_at', 'trial_start',
        'trial_end', 'stripe_event_ids',
    ];

    protected $casts = [
        'current_period_start' => 'datetime',
        'current_period_end' => 'datetime',
        'canceled_at' => 'datetime',
        'ended_at' => 'datetime',
        'trial_start' => 'datetime',
        'trial_end' => 'datetime',
        'cancel_at_period_end' => 'boolean',
        'stripe_event_ids' => 'array',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
