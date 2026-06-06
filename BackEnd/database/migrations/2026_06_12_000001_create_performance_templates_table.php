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
        Schema::create('performance_templates', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique();
            // components stored as JSON, e.g. {"tasks":40,"manager":25,"peer":15,"attendance":10,"overtime":10,"self":0,"hr":0}
            $table->json('components');
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
?>
