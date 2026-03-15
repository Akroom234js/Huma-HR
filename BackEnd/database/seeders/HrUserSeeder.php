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
        $hr = User::firstorcreate([
            'email'          => 'hr@company.com',
            'password'       => Hash::make('Hr@123456'),
            'account_status' => 'active',
        ]);
        EmployeeProfile::create(['user_id' => $hr->id]);
        $hr->assignRole(Role::findByName('hr', 'api'));

        $manager = User::firstorcreate([
            'email'          => 'manager@company.com',
            'password'       => Hash::make('Manager@123456'),
            'account_status' => 'active',
        ]);
        EmployeeProfile::create(['user_id' => $manager->id]);
        $manager->assignRole(Role::findByName('manager', 'api'));

        $this->command->info('✅ HR:      hr@company.com      / Hr@123456');
        $this->command->info('✅ Manager: manager@company.com / Manager@123456');
    }
}
