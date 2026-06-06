<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use App\Models\PerformanceTemplate;

class PerformanceTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Delete existing templates to avoid duplicates (optional)
        PerformanceTemplate::truncate();

        $defaultTemplate = [
            'name'   => 'Default Company Template',
            'is_active' => true,
            'components' => [
                'tasks' => [
                    'is_active' => true,
                    'weight'    => 40,
                    'sub_components' => [
                        // Example sub‑components (can be extended via UI later)
                        'task_completion' => ['weight' => 70],
                        'quality'         => ['weight' => 30],
                    ],
                ],
                'manager' => [
                    'is_active' => true,
                    'weight'    => 25,
                    'sub_components' => [
                        'professionalism' => ['weight' => 33.33],
                        'responsibility'  => ['weight' => 33.33],
                        'problem_solving' => ['weight' => 33.34],
                    ],
                ],
                'peer' => [
                    'is_active' => true,
                    'weight'    => 15,
                ],
                'attendance' => [
                    'is_active' => true,
                    'weight'    => 10,
                ],
                'overtime' => [
                    'is_active' => true,
                    'weight'    => 10,
                ],
                'self_assessment' => [
                    'is_active' => false,
                    'weight'    => 0,
                ],
            ],
        ];

        PerformanceTemplate::create($defaultTemplate);
    }
}
?>
