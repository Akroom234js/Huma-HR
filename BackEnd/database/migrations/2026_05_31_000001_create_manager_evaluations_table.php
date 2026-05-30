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
        Schema::create('manager_evaluations', function (Blueprint $table) {
            $table->bigIncrements('id');

            // Performance cycle relationship
            $table->unsignedBigInteger('performance_cycle_id');
            $table->foreign('performance_cycle_id')
                  ->references('id')
                  ->on('performance_cycles')
                  ->onDelete('cascade');

            // Employee being evaluated
            $table->unsignedBigInteger('employee_profile_id');
            $table->foreign('employee_profile_id')
                  ->references('id')
                  ->on('employee_profiles')
                  ->onDelete('cascade');

            // Direct manager who evaluates
            $table->unsignedBigInteger('manager_user_id');
            $table->foreign('manager_user_id')
                  ->references('id')
                  ->on('users')
                  ->onDelete('cascade');

            // ----- Evaluation criteria -----
            $table->unsignedTinyInteger('professionalism')
                  ->comment('0‑10 professionalism rating');
            $table->unsignedTinyInteger('responsibility')
                  ->comment('0‑10 responsibility rating');
            $table->unsignedTinyInteger('problem_solving')
                  ->comment('0‑10 problem‑solving rating');

            // Average (0‑10) × 10 → final score (0‑100)
            $table->float('average_score', 5, 2);
            $table->float('final_score', 5, 2);

            $table->timestamps();
            $table->softDeletes();

            // Ensure a single evaluation per employee per cycle
            $table->unique(['performance_cycle_id', 'employee_profile_id'], 'manager_eval_cycle_employee_unique');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('manager_evaluations');
    }
};
?>
