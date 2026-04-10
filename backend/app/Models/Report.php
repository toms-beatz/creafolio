<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Concerns\HasUuids;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Report extends Model
{
    use HasUuids;
    protected $table = 'reports';
    public $incrementing = false;
    protected $keyType = 'string';

    const UPDATED_AT = null;
    protected $dateFormat = 'Y-m-d H:i:s';

    protected $fillable = [
        'id', 'portfolio_id', 'motif', 'description', 'reporter_hash', 'status',
    ];

    public function portfolio(): BelongsTo
    {
        return $this->belongsTo(Portfolio::class);
    }
}
