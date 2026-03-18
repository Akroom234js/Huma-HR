<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    public function run(): void
    {
        // BOSS
        $boss = User::create([
            'full_name' => 'Boss Administrator',
            'email' => 'boss@humahr.com',
            'password' => Hash::make('Boss@2025'),
            'email_verified_at' => now(),
        ]);
        $boss->assignRole('boss');

        // HR MANAGER
        $hr = User::create([
            'full_name' => 'HR Manager',
            'email' => 'hr@humahr.com',
            'password' => Hash::make('HR@2025'),
            'email_verified_at' => now(),
            'role' => 'hr',
        ]);
        $hr->assignRole('hr');

        // EMPLOYEE
        $employee = User::create([
            'full_name' => 'John Employee',
            'email' => 'employee@humahr.com',
            'employee_id' => 'EMP0003',
            'password' => Hash::make('Employee@2025'),
            'email_verified_at' => now(),
            'role' => 'employee',
        ]);
        $employee->assignRole('employee');

        // VISITOR
        $visitor = User::create([
            'full_name' => 'Guest Visitor',
            'email' => 'visitor@humahr.com',
            'employee_id' => 'VISITOR001',
            'password' => Hash::make('Visitor@2025'),
            'email_verified_at' => now(),
            'role' => 'visitor',
        ]);
        $visitor->assignRole('visitor');
    }
}
