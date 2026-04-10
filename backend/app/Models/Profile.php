<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Profile extends Model
{
    use SoftDeletes;

    protected $table = 'profiles';
    protected $primaryKey = 'id';
    public $incrementing = false;
    protected $keyType = 'int';
    public $timestamps = false;

    protected $fillable = [
        'id', 'username', 'display_name', 'bio', 'avatar_url', 'plan',
        'trial_ends_at', 'stripe_customer_id', 'role', 'onboarding_completed',
    ];

    protected $casts = [
        'trial_ends_at' => 'datetime',
        'onboarding_completed' => 'boolean',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
