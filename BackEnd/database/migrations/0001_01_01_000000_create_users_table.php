<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Drop the default users table and rebuild it with our fields
        Schema::dropIfExists('users');

        Schema::create('users', function (Blueprint $table) {
            $table->id();

            // ── Auth ───────────────────────────────────────────────────────
            $table->string('email')->unique();
            $table->string('password');
            $table->timestamp('email_verified_at')->nullable();
            $table->rememberToken();

            // ── Personal Information ───────────────────────────────────────
            $table->string('full_name');
            $table->string('employee_id')->unique();
            $table->text('address')->nullable();
            $table->text('emergency_contacts')->nullable();

            // ── Employment & Contract ──────────────────────────────────────
            $table->date('start_date')->nullable();
            $table->string('job_title')->nullable();
            $table->string('department')->nullable();
            $table->string('direct_supervisor')->nullable();

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
        Schema::dropIfExists('employee_change_logs');
        Schema::dropIfExists('employee_experiences');
        Schema::dropIfExists('users');
    }
};
