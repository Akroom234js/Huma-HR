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
        $defaultTemplate = [
            'name'       => 'Default Company Template',
            'is_active'  => true,
            'components' => [
                'tasks' => [
                    'weight'      => 40,
                    'sub_weights' => ['completion' => 60, 'quality' => 40],
                ],
                'manager' => [
                    'weight'      => 25,
                    'sub_weights' => ['professionalism' => 34, 'responsibility' => 33, 'problem_solving' => 33],
                ],
                'peer' => [
                    'weight'      => 15,
                    'sub_weights' => ['collaboration' => 50, 'teamwork' => 50],
                ],
                'attendance' => [
                    'weight'      => 10,
                    'sub_weights' => [],
                ],
                'overtime' => [
                    'weight'      => 10,
                    'sub_weights' => [],
                ],
            ],
        ];

        PerformanceTemplate::updateOrCreate(
            ['name' => 'Default Company Template'],
            $defaultTemplate
        );
    }
}
?>
