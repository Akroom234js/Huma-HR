<?php

namespace Database\Seeders;

use App\Models\AdjustmentType;
use Illuminate\Database\Seeder;

// الأمر: php artisan make:seeder AdjustmentTypeSeeder
class AdjustmentTypeSeeder extends Seeder
{
    public function run(): void
    {
        $types = [
            ['name' => 'Annual Increase',   'is_other' => false],
            ['name' => 'Merit Increase',     'is_other' => false],
            ['name' => 'Promotion',          'is_other' => false],
            ['name' => 'Performance Bonus',  'is_other' => false],
            ['name' => 'Cost of Living',     'is_other' => false],
            ['name' => 'Other',              'is_other' => true],  // ← علامة Other
        ];

        foreach ($types as $type) {
            AdjustmentType::create($type);
        }

        $this->command->info('✅ Adjustment types seeded successfully.');
    }
}
