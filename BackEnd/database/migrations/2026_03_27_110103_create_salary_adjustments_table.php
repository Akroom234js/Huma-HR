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
            $table->foreignId('employee_profile_id')->constrained('employee_profiles')->onDelete('cascade');
            $table->foreignId('employee_movement_id')->nullable()->constrained('employee_movements')->onDelete('cascade');
            $table->foreignId('adjustment_type_id')->nullable()->constrained('adjustment_types')->onDelete('set null');
            $table->string('custom_type_name')->nullable();
            $table->decimal('current_salary', 15, 2);
            $table->decimal('new_salary', 15, 2);
            $table->date('effective_date');
            $table->text('adjustment_reason')->nullable();
            $table->foreignId('created_by')->constrained('users')->onDelete('cascade');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('salary_adjustments');
    }
};
