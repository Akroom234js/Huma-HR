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
        Schema::create('employee_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
             // ── Personal Information ───────────────────────────────────────
           $table->string('full_name')->nullable();
            $table->string('employee_id')->unique()->nullable();
            $table->date('date_of_birth')->nullable();
            $table->enum('marital_status', ['single', 'married', 'divorced', 'widowed'])
                  ->nullable();
            $table->string('phone_number')->nullable();
            $table->text('address')->nullable();
            $table->text('emergency_contacts')->nullable();
            $table->string('profile_pic')->nullable();

            // ── Job Information ────────────────────────────────────────────
            $table->string('job_title')->nullable();
           $table->foreignId('department_id')
                 ->nullable()
                 ->constrained('departments')
                 ->onDelete('set null');
            $table->foreignId('manager_id')
                  ->nullable()
                  ->constrained('users')  // ← point to users table instead
                  ->nullOnDelete();
            $table->string('branch')->nullable();
            $table->string('city')->nullable();
             $table->string('grade')->nullable();


 // ── Dates ──────────────────────────────────────────────────────
            $table->date('start_date')->nullable();
            $table->date('internal_transfer_date')->nullable();
            $table->date('resignation_date')->nullable();
            $table->timestamps();
        });

        // ── Previous Experience ────────────────────────────────────────────
        Schema::create('employee_experiences', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('company_name');
            $table->string('job_title');
            $table->string('period');
            $table->text('skills_acquired')->nullable();
            $table->timestamps();
        });

        // ── Change Log ─────────────────────────────────────────────────────
        Schema::create('employee_change_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->string('field_changed');
            $table->string('changed_by');
            $table->text('previous_value')->nullable();
            $table->text('new_value')->nullable();
            $table->timestamp('changed_at')->useCurrent();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('employee_profiles');
        Schema::dropIfExists('employee_change_logs');
        Schema::dropIfExists('employee_experiences');
    }
};
