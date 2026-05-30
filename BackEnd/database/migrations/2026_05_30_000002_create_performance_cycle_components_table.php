<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_cycle_components', function (Blueprint $table) {
            $table->id();
            
            $table->foreignId('performance_cycle_id')
                  ->constrained('performance_cycles')
                  ->onDelete('cascade');

            $table->string('component_key'); // tasks, manager, peer, attendance, self_assessment etc.
            $table->decimal('weight', 5, 2);
            $table->boolean('is_active')->default(true);
            
            $table->timestamps();

            // Prevent duplicate component keys for the same cycle
            $table->unique(['performance_cycle_id', 'component_key'], 'cycle_component_unique');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_cycle_components');
    }
};
