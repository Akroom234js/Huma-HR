<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // ==============================================
        // CREATE PERMISSIONS
        // ==============================================
        $permissions = [
            // User Management
            'view users',
            'create users',
            'edit users',
            'delete users',
            'manage user roles',

            // Job Management
            'view jobs',
            'create jobs',
            'edit jobs',
            'delete jobs',
            'publish jobs',

            // Application Management
            'view applications',
            'view own applications',
            'create applications',
            'review applications',
            'accept applications',
            'reject applications',
            'delete applications',

            // Department Management
            'view departments',
            'create departments',
            'edit departments',
            'delete departments',

            // Testimonial Management
            'view testimonials',
            'create testimonials',
            'edit own testimonials',
            'edit testimonials',
            'delete testimonials',
            'approve testimonials',

            // Dashboard & Reports
            'access dashboard',
            'view statistics',
            'view reports',
            'export data',

            // Newsletter Management
            'view newsletter subscribers',
            'manage newsletter',

            // System Settings
            'manage settings',
            'view logs',
        ];

        foreach ($permissions as $permission) {
            Permission::create(['name' => $permission]);
        }

        // ==============================================
        // CREATE ROLES
        // ==============================================

        // VISITOR ROLE (Public access)
        $visitorRole = Role::create(['name' => 'visitor']);
        $visitorRole->givePermissionTo([
            'view jobs',
            'create applications',
            'view testimonials',
        ]);

        // EMPLOYEE ROLE
        $employeeRole = Role::create(['name' => 'employee']);
        $employeeRole->givePermissionTo([
            'view jobs',
            'view own applications',
            'view testimonials',
            'create testimonials',
            'edit own testimonials',
            'access dashboard',
        ]);

        // HR ROLE
        $hrRole = Role::create(['name' => 'hr']);
        $hrRole->givePermissionTo([
            'view users',
            'create users',
            'edit users',
            'view jobs',
            'create jobs',
            'edit jobs',
            'delete jobs',
            'publish jobs',
            'view applications',
            'review applications',
            'accept applications',
            'reject applications',
            'view departments',
            'create departments',
            'edit departments',
            'view testimonials',
            'approve testimonials',
            'edit testimonials',
            'delete testimonials',
            'access dashboard',
            'view statistics',
            'view reports',
            'view newsletter subscribers',
            'manage newsletter',
        ]);

        // BOSS ROLE (Full Access)
        $bossRole = Role::create(['name' => 'boss']);
        $bossRole->givePermissionTo(Permission::all());
    }
}
