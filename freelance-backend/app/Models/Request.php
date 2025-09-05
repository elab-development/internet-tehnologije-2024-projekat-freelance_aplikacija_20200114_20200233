<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Request extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'service_buyer_id',
        'project_id',
        'price_offer',
        'message',
        'status',
    ];

    protected $casts = [
        'decided_at' => 'datetime',
    ];

    /**
     * Relationships
     */

    // Each request belongs to a user
    public function serviceBuyer()
    {
        return $this->belongsTo(User::class, 'service_buyer_id'); 
    }

    // Each request belongs to a project
    public function project()
    {
        return $this->belongsTo(Project::class);
    }

    // Each request may have one review
    public function review()
    {
        return $this->hasOne(Review::class);
    }
}
