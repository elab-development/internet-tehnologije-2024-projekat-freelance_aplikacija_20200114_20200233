<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'request_id',
        'rating',
        'review',
    ];

    /**
     * Relationships
     */

    // Each review belongs to a request
    public function request()
    {
        return $this->belongsTo(Request::class);
    }
}
