<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');

            // Personal & Job Info from Interface
            $table->string('employee_id')->unique();
            $table->text('address')->nullable();
            $table->text('emergency_contacts')->nullable();
            $table->date('start_date');
            $table->string('job_title');

            // Added Fields: Role, Department, Supervisor
            $table->string('role')->default('employee'); // e.g., admin, manager, staff
           $table->foreignId('department_id')
                  ->nullable()
                  ->constrained('departments')
                  ->onDelete('set null');                   // القسم
            $table->foreignId('manager_id')
                  ->nullable()
                  ->constrained('employees')
                  ->onDelete('set null');                   // المدير المباشر
            $table->string('profile_pic')->nullable();      // الصورة الشخصية
            $table->enum('employment_type', ['full_time', 'part_time', 'contract', 'internship'])
                  ->default('full_time');                   // نوع العمل
            $table->timestamp('last_login_at')->nullable();

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('employees');
    }
};
