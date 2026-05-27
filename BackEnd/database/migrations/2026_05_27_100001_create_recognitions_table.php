<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('recognitions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('recipient_id')->constrained('employee_profiles')->cascadeOnDelete();
            $table->foreignId('sender_id')->constrained('employee_profiles')->cascadeOnDelete();
            $table->text('message');
            $table->string('badge_type')->nullable(); // rockstar, teamplayer, innovator, leader, creative
            $table->boolean('is_public')->default(true);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('recognitions');
    }
};
