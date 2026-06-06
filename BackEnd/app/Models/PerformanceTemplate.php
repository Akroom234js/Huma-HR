<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PerformanceTemplate extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'components', // JSON column
    ];

    protected $casts = [
        'components' => 'array',
    ];

    public function performanceCycles()
    {
        return $this->hasMany(PerformanceCycle::class);
    }
}
?>
