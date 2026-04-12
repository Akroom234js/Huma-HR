<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// الأمر: php artisan make:migration create_employee_movements_table
// المسار: database/migrations/

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('employee_movements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_profile_id')
                  ->constrained('employee_profiles')
                  ->cascadeOnDelete();
            $table->enum('movement_type', [
                'promotion',
                'transfer',
                'department_change',
                'salary_adjustment',
            ]);
            // previous_value و new_value نص عام
            // promotion       → previous: "Developer"         | new: "Senior Developer"
            // transfer        → previous: "Marketing Team"    | new: "Sales Team"
            // department_change → previous: "Engineering"     | new: "R&D"
            // salary_adjustment → previous: "72000"           | new: "78000"
            $table->text('previous_value')->nullable();
            $table->text('new_value')->nullable();
            $table->date('movement_date');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_movements');
    }
};
