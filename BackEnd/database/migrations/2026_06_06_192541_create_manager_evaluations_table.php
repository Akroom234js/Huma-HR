<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('manager_evaluations')) {
            Schema::create('manager_evaluations', function (Blueprint $table) {
                $table->id();

            $table->foreignId('performance_cycle_id')
                  ->constrained('performance_cycles')
                  ->cascadeOnDelete();

            // الموظف المُقيَّم
            $table->foreignId('employee_profile_id')
                  ->constrained('employee_profiles')
                  ->cascadeOnDelete();

            // المدير الذي قدّم التقييم
            $table->foreignId('manager_user_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            // معايير التقييم (0-10)
            $table->unsignedTinyInteger('professionalism');
            $table->unsignedTinyInteger('responsibility');
            $table->unsignedTinyInteger('problem_solving');

            // يُحسب تلقائياً في الـ Model boot
            // average = (p + r + ps) / 3
            // final   = average × 10  →  0 إلى 100
            $table->decimal('average_score', 5, 2)->default(0);
            $table->decimal('final_score',   5, 2)->default(0);

            $table->timestamps();
            $table->softDeletes();

            // مدير واحد = تقييم واحد لكل موظف في كل دورة
            $table->unique(
                ['performance_cycle_id', 'employee_profile_id'],
                'manager_eval_unique'
            );
        });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('manager_evaluations');
    }
};
