<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('peer_evaluations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('performance_cycle_id')
                  ->constrained('performance_cycles')
                  ->cascadeOnDelete();

            // الموظف المُقيَّم
            $table->foreignId('employee_profile_id')
                  ->constrained('employee_profiles')
                  ->cascadeOnDelete();

            // token مجهول — يمنع التكرار دون كشف الهوية
            // = HMAC(evaluator_id + employee_id + cycle_id + secret_salt)
            $table->char('token_hash', 64)->unique();

            // معايير التقييم (0-10)
            $table->unsignedTinyInteger('collaboration_score');
            $table->unsignedTinyInteger('teamwork_score');

            // تعليق مشفر بـ AES-256-CBC
            $table->text('encrypted_comment')->nullable();
            $table->binary('iv')->nullable(); // 16 bytes

            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('peer_evaluations');
    }
};
