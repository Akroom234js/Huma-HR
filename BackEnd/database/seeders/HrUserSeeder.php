<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\Position;
use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class HrUserSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Create Departments ─────────────────────────────────────────
        $execDept = Department::create([
            'name'        => 'Executive Office',
            'description' => 'Top level management and strategy.',
        ]);

        $engDept = Department::create([
            'name'        => 'Engineering',
            'description' => 'Product development and software engineering.',
        ]);

        $hrDept = Department::create([
            'name'        => 'Human Resources',
            'description' => 'Talent acquisition, management, and employee relations.',
        ]);

        // ── 2. Create Positions with Hierarchy and Salaries ───────────────
        // Level 0: CEO (General Manager Position)
        $ceoPos = Position::create([
            'title'              => 'CEO',
            'department_id'      => $execDept->id,
            'description'        => 'Chief Executive Officer leading overall strategy and corporate decisions.',
            'parent_position_id' => null,
            'hierarchy_level'    => 0,
            'is_managerial'      => true,
            'min_salary'         => 12000.00,
            'max_salary'         => 20000.00,
            'tax_percent'        => 10.00,
            'insurance_amount'   => 500.00,
        ]);

        // Level 1: Engineering Manager (Department Manager Position reporting to CEO)
        $engMgrPos = Position::create([
            'title'              => 'Engineering Manager',
            'department_id'      => $engDept->id,
            'description'        => 'Manages the software development teams and technical operations.',
            'parent_position_id' => $ceoPos->id,
            'hierarchy_level'    => 1,
            'is_managerial'      => true,
            'min_salary'         => 8000.00,
            'max_salary'         => 12000.00,
            'tax_percent'        => 8.00,
            'insurance_amount'   => 400.00,
        ]);

        // Level 1: HR Manager (HR Admin Position reporting to CEO) - same level as Engineering Manager
        $hrMgrPos = Position::create([
            'title'              => 'HR Manager',
            'department_id'      => $hrDept->id,
            'description'        => 'Manages company human resource functions and compliance.',
            'parent_position_id' => $ceoPos->id,
            'hierarchy_level'    => 1,
            'is_managerial'      => true,
            'min_salary'         => 6000.00,
            'max_salary'         => 9000.00,
            'tax_percent'        => 7.00,
            'insurance_amount'   => 300.00,
        ]);

        // Level 2: Backend Developer (Employee Position reporting to Engineering Manager)
        $devPos = Position::create([
            'title'              => 'Backend Developer',
            'department_id'      => $engDept->id,
            'description'        => 'Responsible for creating and maintaining server-side logic and database models.',
            'parent_position_id' => $engMgrPos->id,
            'hierarchy_level'    => 2,
            'is_managerial'      => false,
            'min_salary'         => 4000.00,
            'max_salary'         => 6500.00,
            'tax_percent'        => 5.00,
            'insurance_amount'   => 200.00,
        ]);


        // ── 3. Create Users and Assign Roles & Positions ──────────────────

        // ── A. Boss (General Manager / CEO) ────────────────────────────────
        $bossUser = User::create([
            'email'          => 'boss@company.com',
            'password'       => Hash::make('Boss@123456'),
            'account_status' => 'active',
        ]);
        $bossProfile = EmployeeProfile::create([
            'user_id'       => $bossUser->id,
            'employee_id'   => 'EMP-0001',
            'full_name'     => 'Tareq Al-Masri',
            'job_title'     => 'CEO',
            'department_id' => $execDept->id,
            'position_id'   => $ceoPos->id,
            'salary'        => 15000.00,
            'manager_id'    => null,
            'start_date'    => '2025-01-01',
        ]);
        $bossUser->assignRole(Role::findByName('manager', 'api'));

        // ── B. HR Manager (HR Admin) ──────────────────────────────────────
        $hrUser = User::create([
            'email'          => 'hr@company.com',
            'password'       => Hash::make('Hr@123456'),
            'account_status' => 'active',
        ]);
        $hrProfile = EmployeeProfile::create([
            'user_id'       => $hrUser->id,
            'employee_id'   => 'EMP-0002',
            'full_name'     => 'Maya Al-Hassan',
            'job_title'     => 'HR Manager',
            'department_id' => $hrDept->id,
            'position_id'   => $hrMgrPos->id,
            'salary'        => 7500.00,
            'manager_id'    => $bossProfile->id, // Reports to CEO
            'start_date'    => '2025-02-15',
        ]);
        $hrUser->assignRole(Role::findByName('hr', 'api'));

        // ── C. Department Manager (Engineering Manager) ────────────────────
        $deptManagerUser = User::create([
            'email'          => 'dept.manager@company.com',
            'password'       => Hash::make('DeptManager@123456'),
            'account_status' => 'active',
        ]);
        $deptManagerProfile = EmployeeProfile::create([
            'user_id'       => $deptManagerUser->id,
            'employee_id'   => 'EMP-0003',
            'full_name'     => 'Ahmad Al-Saeed',
            'job_title'     => 'Engineering Manager',
            'department_id' => $engDept->id,
            'position_id'   => $engMgrPos->id,
            'salary'        => 10000.00,
            'manager_id'    => $bossProfile->id, // Reports to CEO
            'start_date'    => '2025-03-01',
        ]);
        $deptManagerUser->assignRole(Role::findByName('employee', 'api'));
        $deptManagerUser->assignRole(Role::findByName('department_manager', 'api'));

        // ── D. Employee (Backend Developer) ────────────────────────────────
        $employeeUser = User::create([
            'email'          => 'employee@company.com',
            'password'       => Hash::make('Employee@123456'),
            'account_status' => 'active',
        ]);
        $employeeProfile = EmployeeProfile::create([
            'user_id'       => $employeeUser->id,
            'employee_id'   => 'EMP-0004',
            'full_name'     => 'John Doe',
            'job_title'     => 'Backend Developer',
            'department_id' => $engDept->id,
            'position_id'   => $devPos->id,
            'salary'        => 5500.00,
            'manager_id'    => $deptManagerProfile->id, // Reports to Engineering Manager
            'start_date'    => '2025-05-10',
        ]);
        $employeeUser->assignRole(Role::findByName('employee', 'api'));

        // ── 4. Set Department Head relations ──────────────────────────────
        $execDept->update(['head_id' => $bossProfile->id]);
        $engDept->update(['head_id' => $deptManagerProfile->id]);
        $hrDept->update(['head_id' => $hrProfile->id]);

        $this->command->info('✅ Executive Dept Head: ' . $bossProfile->full_name);
        $this->command->info('✅ Engineering Dept Head: ' . $deptManagerProfile->full_name);
        $this->command->info('✅ HR Dept Head:          ' . $hrProfile->full_name);
    }
}
