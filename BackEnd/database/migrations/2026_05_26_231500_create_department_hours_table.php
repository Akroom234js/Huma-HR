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
        Schema::create('department_hours', function (Blueprint $table) {
            $table->id();
            $table->string('dept')->unique(); // اسم القسم (الفرونت إند يطابق بـ Engineering, Design, etc.)
            $table->time('start_time')->default('09:00:00');
            $table->time('end_time')->default('17:00:00');
            $table->integer('grace_period')->default(15); // بالدقائق
            $table->json('work_days'); // أيام العمل المخزنة كـ JSON (e.g. ["Mon", "Tue", "Wed"])
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('department_hours');
    }
};
