<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// الأمر: php artisan make:migration create_salary_adjustments_table
// المسار: database/migrations/

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('salary_adjustments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_profile_id')
                  ->constrained('employee_profiles')
                  ->cascadeOnDelete();
            // رابط للحركة العامة في employee_movements
            $table->foreignId('employee_movement_id')
                  ->constrained('employee_movements')
                  ->cascadeOnDelete();
            // نوع التعديل — إما ID من adjustment_types أو custom
            $table->foreignId('adjustment_type_id')
                  ->nullable()
                  ->constrained('adjustment_types')
                  ->nullOnDelete();
            // لما يختار "Other" يكتب النوع يدوياً هنا
            $table->string('custom_type_name')->nullable();
            $table->decimal('current_salary', 10, 2);
            $table->decimal('new_salary', 10, 2);
            $table->date('effective_date');
            $table->text('adjustment_reason')->nullable();
            $table->foreignId('created_by')
                  ->constrained('users')
                  ->cascadeOnDelete();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_adjustments');
    }
};
