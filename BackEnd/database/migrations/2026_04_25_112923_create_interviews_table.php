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
        Schema::create('interviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('application_id')
                  ->constrained('applications')
                  ->onDelete('cascade');
            $table->foreignId('interviewer_id')
                  ->constrained('users')
                  ->onDelete('cascade');
            $table->enum('interview_type', ['phone', 'video', 'in-person', 'technical', 'hr'])
                  ->default('phone');
            $table->timestamp('scheduled_at');
            $table->timestamp('conducted_at')->nullable();
            $table->enum('status', ['scheduled', 'completed', 'canceled', 'rescheduled'])
                  ->default('scheduled');
            $table->text('feedback')->nullable();
            $table->tinyInteger('rating')->unsigned()->nullable()->comment('Rating from 1 to 5');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('interviews');
    }
};
