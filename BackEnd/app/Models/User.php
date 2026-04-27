<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $fillable = [
        // ── Auth ──────────────────────────────────────────────────
        'email',
        'password',
        'last_login_at',
        'account_status'
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at'      => 'datetime',
            'password'               => 'hashed',
            'last_login_at'          => 'datetime',
        ];
    }
    public function profile()
    {
        return $this->hasOne(EmployeeProfile::class);
    }

    public function employeeProfile()
    {
        return $this->hasOne(EmployeeProfile::class);
    }
}
