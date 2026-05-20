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
        Schema::create('job_postings', function (Blueprint $table) {
            $table->id();
            $table->string('title');
            // الربط مع المناصب
            $table->foreignId('position_id')->constrained('positions')->onDelete('cascade');

            $table->text('description');
            // القسم (اختياري)
            $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
            // الراتب
            $table->string('salary_min')->nullable();
            $table->string('salary_max')->nullable();
            $table->string('salary_currency')->default('USD');
            // الحالة (مع archived)
            $table->enum('status', ['draft', 'open', 'closed', 'archived'])->default('draft');
            $table->foreignId('created_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            $table->foreignId('updated_by')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('set null');
            // تواريخ
            $table->timestamp('posted_at')->nullable();
            $table->timestamp('application_deadline')->nullable();
            $table->string('location')->nullable();
            $table->enum('employment_type', ['full-time', 'part-time', 'contract', 'temporary', 'internship'])
                  ->nullable();
            $table->enum('experience_level', ['entry-level', 'associate', 'mid-senior', 'director', 'executive'])
                  ->nullable();
            $table->softDeletes();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_postings');
    }
};
