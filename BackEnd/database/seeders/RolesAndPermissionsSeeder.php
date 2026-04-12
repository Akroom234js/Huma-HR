<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolesAndPermissionsSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ─── Create Permissions ────────────────────────────────────────────────

        $permissions = [
            // Employee management
            'view employees',
            'create employees',
            'edit employees',
            'delete employees',

            // Payroll
            'view payroll',
            'manage payroll',

            // Leaves
            'view leaves',
            'manage leaves',
            'request leave',

            // Attendance
            'view attendance',
            'manage attendance',

            // Performance
            'view performance',
            'manage performance',

            // Reports
            'view reports',
            'generate reports',

            // Recruitment
            'view recruitment',
            'manage recruitment',

            // Settings
            'manage settings',

            // Roles
            'manage roles',
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission]);
        }

        // ─── Create Roles & Assign Permissions ────────────────────────────────

        // BOSS → full access to everything
        $boss = Role::firstOrCreate(['name' => 'boss']);
        $boss->syncPermissions(Permission::all());

        // HR → manages employees, leaves, attendance, recruitment
        $hr = Role::firstOrCreate(['name' => 'hr']);
        $hr->syncPermissions([
            'view employees',
            'create employees',
            'edit employees',
            'view payroll',
            'view leaves',
            'manage leaves',
            'view attendance',
            'manage attendance',
            'view performance',
            'view reports',
            'generate reports',
            'view recruitment',
            'manage recruitment',
        ]);

        // EMPLOYEE → limited access
        $employee = Role::firstOrCreate(['name' => 'employee']);
        $employee->syncPermissions([
            'view leaves',
            'request leave',
            'view attendance',
            'view performance',
        ]);

        // ─── Create Default Users ──────────────────────────────────────────────

        // Boss account
        $bossUser = User::firstOrCreate(
            ['email' => 'boss@hr.com'],
            [
                
                'full_name' => 'The Boss',
                'password'  => Hash::make('password'),
            ]
        );
        $bossUser->syncRoles('boss');

        // HR account
        $hrUser = User::firstOrCreate(
            ['email' => 'hr@hr.com'],
            [

                'full_name' => 'HR Manager',
                'password'  => Hash::make('password'),
            ]
        );
        $hrUser->syncRoles('hr');

        // Employee account
        $employeeUser = User::firstOrCreate(
            ['email' => 'employee@hr.com'],
            [

                'full_name'   => 'John Doe',
                'employee_id' => 'EMP001',
                'job_title'   => 'Senior Frontend Developer',
                'password'    => Hash::make('password'),
            ]
        );
        $employeeUser->syncRoles('employee');

        // ─── Print Results ─────────────────────────────────────────────────────

        $this->command->info('✅ Roles, permissions and default users created!');
        $this->command->table(
            ['Role', 'Email', 'Password'],
            [
                ['boss',     'boss@hr.com',     'password'],
                ['hr',       'hr@hr.com',       'password'],
                ['employee', 'employee@hr.com', 'password'],
            ]
        );
    }
}
