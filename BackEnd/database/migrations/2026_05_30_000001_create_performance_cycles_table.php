<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_cycles', function (Blueprint $table) {
            $table->id();
            $table->string('title');

            // ربط الدورة بالقالب المرجعي
            $table->foreignId('performance_template_id')
                  ->nullable()
                  ->constrained('performance_templates')
                  ->onDelete('restrict');

            $table->date('start_date');
            $table->date('end_date');
            $table->enum('status', ['draft', 'active', 'processing', 'completed', 'canceled'])->default('draft');

            $table->foreignId('created_by')->constrained('employee_profiles');
            $table->foreignId('approved_by')->nullable()->constrained('employee_profiles');
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_cycles');
    }
};
