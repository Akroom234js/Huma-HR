<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

use App\Models\OfficeLocation;

class OfficeLocationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        OfficeLocation::create([
            'name' => 'Main HQ Office',
            'latitude' => 31.963158,
            'longitude' => 35.930359,
            'radius_meters' => 150,
            'is_active' => true,
        ]);
    }
}
