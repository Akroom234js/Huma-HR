<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        if (!Schema::hasTable('performance_templates')) {
            Schema::create('performance_templates', function (Blueprint $table) {
            $table->id();

            // اسم القالب — مثال: "القالب العام 2026"
            $table->string('name')->default('Default Company Template');

            // واحد فقط يكون نشطاً في كل وقت
            $table->boolean('is_active')->default(false);

            // المكونات والأوزان بصيغة JSON
            // مثال: {"tasks":40,"manager":25,"peer":15,"attendance":10,"overtime":10}
            $table->json('components');

            $table->timestamps();
        });
        }
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_templates');
    }
};
