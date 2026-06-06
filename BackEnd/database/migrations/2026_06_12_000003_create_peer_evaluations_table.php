<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('peer_evaluations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('performance_cycle_id')
                ->constrained('performance_cycles')
                ->cascadeOnDelete();
            $table->foreignId('evaluatee_id')
                ->constrained('employee_profiles')
                ->cascadeOnDelete();
            // token unique per evaluator per cycle (generated in service)
            $table->string('anonymous_token', 64)->unique();
            $table->text('encrypted_comment');
            $table->tinyInteger('score')->unsigned()->comment('0‑10');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('peer_evaluations');
    }
};
?>
