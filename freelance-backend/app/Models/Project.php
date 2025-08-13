<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<string>
     */
    protected $fillable = [
        'service_seller_id',
        'category_id',
        'title',
        'description',
        'budget',
        'deadline',
        'priority',
    ];

    protected $casts = [
        'deadline'  => 'date:Y-m-d',
        'is_locked' => 'boolean', 
        'locked_at' => 'datetime',
    ];

    /**
     * Relationships
     */

    public function serviceSeller()
    {
        return $this->belongsTo(User::class);
    }

    public function category()
    {
        return $this->belongsTo(Category::class);
    }

    public function requests()
    {
        return $this->hasMany(Request::class);
    }
}

