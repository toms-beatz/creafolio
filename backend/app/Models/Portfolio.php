<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * @property int         $id
 * @property int         $user_id
 * @property string      $title
 * @property string      $slug
 * @property string      $status
 * @property bool        $is_published
 * @property string|null $description
 * @property array|null  $craft_state
 * @property array|null  $content
 * @property mixed|null  $theme
 * @property \Illuminate\Support\Carbon|null $published_at
 */
class Portfolio extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'title',
        'slug',
        'status',
        'is_published',
        'description',
        'craft_state',
        'content',
        'theme',
        'published_at',
    ];

    protected $casts = [
        'craft_state' => 'array',
        'content' => 'array',
        'published_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function analytics(): HasMany
    {
        return $this->hasMany(PortfolioAnalytic::class);
    }

    public function linkClicks(): HasMany
    {
        return $this->hasMany(PortfolioLinkClick::class);
    }

    public function reports(): HasMany
    {
        return $this->hasMany(Report::class);
    }

    public function storageFiles(): HasMany
    {
        return $this->hasMany(StorageUsage::class);
    }

    public function isPublished(): bool
    {
        return $this->status === 'published';
    }
}
