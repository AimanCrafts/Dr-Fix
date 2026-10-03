<?php

namespace App\Models;

// use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;

// Sanctum's HasApiTokens removed — customer auth now issues JWTs via
// JwtService (see AuthController::login), same mechanism as technician
// auth. Nothing in the app uses Sanctum tokens anymore. The composer
// package/config (config/sanctum.php) are left installed in case you
// want it back, but can be removed with `composer remove laravel/sanctum`.
class User extends Authenticatable
{
    use HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'phone',
        'password',
        'email_verified_at',
        // Provider fields — added for technician signup/JWT auth.
        'role',
        'service_category',
        'years_of_experience',
        'work_area',
        'nid_path',
        'approval_status',
        'is_available',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'email_verified_at' => 'datetime',
        'is_available' => 'boolean',
    ];

    /**
     * The attributes that should be hidden for serialization.
     *
     * @var array<int, string>
     */
    protected $hidden = [
        'password',
        'remember_token',
    ];

    public function posts()
    {
        return $this->hasMany(Post::class); // One user has many posts
    }
}
