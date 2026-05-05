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
        Schema::create('bonus_rules', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->enum('target_type', ['department', 'employee', 'all'])->default('all');
            $table->unsignedBigInteger('target_id')->nullable();
            $table->decimal('amount', 15, 2);
            $table->boolean('is_percentage')->default(false);
            $table->enum('frequency', ['monthly', 'quarterly', 'annually', 'once'])->default('monthly');
            $table->string('apply_month')->nullable(); // For 'once' frequency
            $table->enum('condition_type', ['none', 'attendance', 'performance'])->default('none');
            $table->string('condition_value')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('bonus_rules');
    }
};
