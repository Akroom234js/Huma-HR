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
        Schema::create('peer_evaluations', function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('performance_cycle_id');
            $table->foreign('performance_cycle_id')
                  ->references('id')
                  ->on('performance_cycles')
                  ->onDelete('cascade');

            $table->unsignedBigInteger('employee_profile_id');
            $table->foreign('employee_profile_id')
                  ->references('id')
                  ->on('employee_profiles')
                  ->onDelete('cascade');

            // token hash for anonymity (unique per evaluator+cycle)
            $table->char('token_hash', 64);

            $table->unsignedTinyInteger('collaboration_score'); // 0‑10
            $table->unsignedTinyInteger('teamwork_score');      // 0‑10

            // encrypted comment (base64) and IV (16 bytes binary)
            $table->text('encrypted_comment');
            $table->binary('iv', 16);

            $table->timestamps();
            $table->softDeletes();
            $table->unique(['performance_cycle_id', 'employee_profile_id', 'token_hash'], 'peer_evaluation_unique');
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
