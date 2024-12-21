<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

class User extends Authenticatable
{
    /** @use HasFactory<\Database\Factories\UserFactory> */
    use HasFactory, Notifiable;

    /**
     * The attributes that are mass assignable.
     *
     * @var list<string>
     */
    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var list<string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

       /**
     * Relationships
     */

    // A user can be a service seller with many projects
    public function serviceSellerProjects()
    {
        return $this->hasMany(Project::class, 'service_seller_id');
    }

    // A user can be a service buyer with many requests
    public function serviceBuyerRequests()
    {
        return $this->hasMany(Request::class, 'service_buyer_id');
    }
}
