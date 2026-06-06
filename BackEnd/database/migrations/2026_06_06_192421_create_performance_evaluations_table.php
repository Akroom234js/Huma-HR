<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_evaluations', function (Blueprint $table) {
            $table->id();

            $table->foreignId('performance_cycle_id')
                  ->constrained('performance_cycles')
                  ->cascadeOnDelete();

            $table->foreignId('employee_profile_id')
                  ->constrained('employee_profiles')
                  ->cascadeOnDelete();

            $table->foreignId('department_id')
                  ->constrained('departments');

            $table->enum('employment_status', [
                'active', 'probation', 'suspended', 'terminated', 'on_leave'
            ])->default('active');

            // الدرجات الفرعية — null حتى يتم حسابها
            $table->decimal('tasks_score',      5, 2)->nullable();
            $table->decimal('manager_score',    5, 2)->nullable();
            $table->decimal('peer_score',       5, 2)->nullable();
            $table->decimal('attendance_score', 5, 2)->nullable();
            $table->decimal('overtime_score',   5, 2)->nullable();
            $table->decimal('self_score',       5, 2)->nullable();

            // الدرجة النهائية من 100
            $table->decimal('final_score', 5, 2)->nullable();

            $table->enum('status', [
                'eligible',           // مؤهل للتقييم
                'excluded_vacation',  // مستثنى بسبب الإجازة
                'evaluated',          // تم تقييمه
            ])->default('eligible');

            // AI
            $table->text('ai_analysis')->nullable();
            $table->json('ai_recommendations')->nullable();

            $table->timestamp('evaluated_at')->nullable();
            $table->timestamps();

            // موظف واحد = تقييم واحد في كل دورة
            $table->unique(
                ['performance_cycle_id', 'employee_profile_id'],
                'cycle_employee_unique'
            );
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_evaluations');
    }
};
