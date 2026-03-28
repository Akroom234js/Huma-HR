<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleSeeder::class,   // ← أول شي دايماً
            AdjustmentTypeSeeder::class,  // ← بعدها
            HrUserSeeder::class,  // ← بعدها
        ]);
    }
}
