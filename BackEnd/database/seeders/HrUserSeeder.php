<?php

namespace Database\Seeders;

use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class HrUserSeeder extends Seeder
{
    public function run(): void
    {
        // ── HR ────────────────────────────────────────────────────────────
        $hr = User::create([
            'email'          => 'hr@company.com',
            'password'       => Hash::make('Hr@123456'),
            'account_status' => 'active',
        ]);
        EmployeeProfile::create([
            'user_id'   => $hr->id,
            'full_name' => 'HR Admin',
        ]);
        $hr->assignRole(Role::findByName('hr', 'api'));

        // ── Boss (Manager) ────────────────────────────────────────────────
        $boss = User::create([
            'email'          => 'boss@company.com',
            'password'       => Hash::make('Boss@123456'),
            'account_status' => 'active',
        ]);
        EmployeeProfile::create([
            'user_id'   => $boss->id,
            'full_name' => 'General Manager',
            'job_title' => 'CEO',
        ]);
        $boss->assignRole(Role::findByName('manager', 'api'));

        // ── Department Manager ────────────────────────────────────────────
        // مدير القسم = employee + department_manager
        $deptManager = User::create([
            'email'          => 'dept.manager@company.com',
            'password'       => Hash::make('DeptManager@123456'),
            'account_status' => 'active',
        ]);
        EmployeeProfile::create([
            'user_id'    => $deptManager->id,
            'full_name'  => 'Department Manager',
            'job_title'  => 'Engineering Manager',
            'employee_id'=> 'EMP-0001',
        ]);
        // دورين معاً ← هو موظف وكمان مدير قسم
        $deptManager->assignRole(Role::findByName('employee', 'api'));
        $deptManager->assignRole(Role::findByName('department_manager', 'api'));

        // ── Employee ──────────────────────────────────────────────────────
        $employee = User::create([
            'email'          => 'employee@company.com',
            'password'       => Hash::make('Employee@123456'),
            'account_status' => 'active',
        ]);
        EmployeeProfile::create([
            'user_id'    => $employee->id,
            'full_name'  => 'John Employee',
            'job_title'  => 'Backend Developer',
            'employee_id'=> 'EMP-0002',
        ]);
        $employee->assignRole(Role::findByName('employee', 'api'));

        $this->command->info('✅ HR:               hr@company.com           / Hr@123456');
        $this->command->info('✅ Boss:             boss@company.com         / Boss@123456');
        $this->command->info('✅ Dept Manager:     dept.manager@company.com / DeptManager@123456');
        $this->command->info('✅ Employee:         employee@company.com     / Employee@123456');
    }
}
