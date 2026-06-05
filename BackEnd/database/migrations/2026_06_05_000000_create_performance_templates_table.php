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
        Schema::create('performance_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->default('Default Company Template');
            $table->boolean('is_active')->default(true);
            $table->json('config'); // سيحمل المكونات والفرعيات وأوزانها كـ JSON
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('performance_templates');
    }
};
