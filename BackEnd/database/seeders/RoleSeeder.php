<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;

class RoleSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {

        Role::create(['name' => 'employee',           'guard_name' => 'api']);
        Role::create(['name' => 'department_manager', 'guard_name' => 'api']);
        Role::create(['name' => 'hr',                 'guard_name' => 'api']);
        Role::create(['name' => 'manager',            'guard_name' => 'api']);
    }
}
