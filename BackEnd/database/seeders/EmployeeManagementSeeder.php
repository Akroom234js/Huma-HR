<?php

namespace Database\Seeders;

use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class EmployeeManagementSeeder extends Seeder
{
    public function run(): void
    {
        // 1. إنشاء الأدوار إذا لم تكن موجودة
      //  $hrRole = Role::firstOrCreate(['name' => 'hr', 'guard_name' => 'api']);
       // $employeeRole = Role::firstOrCreate(['name' => 'employee', 'guard_name' => 'api']);



        // 3. إنشاء أقسام تجريبية
        $departments = [
            ['name' => 'Software Development', 'description' => 'Building the future'],
            ['name' => 'Human Resources', 'description' => 'Managing people'],
            ['name' => 'Marketing', 'description' => 'Spreading the word'],
            ['name' => 'Finance', 'description' => 'Managing money'],
        ];

        foreach ($departments as $dept) {
            Department::updateOrCreate(['name' => $dept['name']], $dept);
        }

        $devDept = Department::where('name', 'Software Development')->first();
        $hrDept = Department::where('name', 'Human Resources')->first();

        // 4. إنشاء موظفين تجريبيين
        $employees = [
            [
                'email' => 'john.doe@example.com',
                'full_name' => 'John Doe',
                'employee_id' => 'EMP001',
                'job_title' => 'Senior Developer',
                'department_id' => $devDept->id,
                'employment_status' => 'active',
            ],
            [
                'email' => 'jane.smith@example.com',
                'full_name' => 'Jane Smith',
                'employee_id' => 'EMP002',
                'job_title' => 'HR Manager',
                'department_id' => $hrDept->id,
                'employment_status' => 'active',
            ],
            [
                'email' => 'mike.ross@example.com',
                'full_name' => 'Mike Ross',
                'employee_id' => 'EMP003',
                'job_title' => 'Junior Developer',
                'department_id' => $devDept->id,
                'employment_status' => 'on_leave',
            ],
        ];

        foreach ($employees as $empData) {
            $user = User::updateOrCreate(
                ['email' => $empData['email']],
                [
                    'password' => Hash::make('password'),
                    'account_status' => 'active'
                ]
            );
            $user->assignRole($employeeRole);

            $profile = EmployeeProfile::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $empData['full_name'],
                    'employee_id' => $empData['employee_id'],
                    'job_title' => $empData['job_title'],
                    'department_id' => $empData['department_id'],
                    'employment_status' => $empData['employment_status'],
                    'start_date' => now()->subYear(),
                ]
            );

            // 5. إضافة سجلات حركات تجريبية (Movements)
            $profile->changeLogs()->create([
                'field_changed' => 'job_title',
                'changed_by' => $hrUser->id,
                'previous_value' => 'Intern',
                'new_value' => $empData['job_title'],
                'changed_at' => now()->subMonths(6),
            ]);

            $profile->changeLogs()->create([
                'field_changed' => 'employment_status',
                'changed_by' => $hrUser->id,
                'previous_value' => 'inactive',
                'new_value' => 'active',
                'changed_at' => now()->subMonths(11),
            ]);
        }
    }
}
