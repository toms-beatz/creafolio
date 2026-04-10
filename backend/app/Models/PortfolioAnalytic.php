<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PortfolioAnalytic extends Model
{
    use HasUuids;
    protected $table = 'portfolio_analytics';
    public $incrementing = false;
    protected $keyType = 'string';
    public $timestamps = false;

    protected $fillable = [
        'id',
        'portfolio_id',
        'session_hash',
        'visitor_hash',
        'referrer',
        'page_path',
        'country_code',
        'city',
        'device_type',
        'browser',
        'user_agent',
        'is_bot',
        'viewed_at',
    ];

    protected $casts = [
        'is_bot' => 'boolean',
        'viewed_at' => 'datetime',
    ];

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }
}
