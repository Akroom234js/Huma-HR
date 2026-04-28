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
        Schema::create('applications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('job_posting_id')
                  ->constrained('job_postings')
                  ->onDelete('cascade');
            $table->foreignId('user_id')
                  ->nullable()
                  ->constrained('users')
                  ->onDelete('cascade');

            // بيانات المتقدم الأساسية
            $table->string('full_name');
            $table->string('email');
            $table->string('phone')->nullable();
            $table->string('resume_path')->nullable();
            $table->string('cover_letter_path')->nullable();


            // --- إضافات نظام الـ ATS الجديدة ---

            // الحالة العامة (للتوافق مع النظام القديم)
            $table->enum('status', ['pending', 'reviewed', 'shortlisted', 'interviewing', 'offered', 'hired', 'rejected', 'withdrawn'])
                  ->default('pending');

            // المرحلة الحالية في خط أنابيب التوظيف (Pipeline Stage)
            // مراحل مقترحة: Applied, Screening, Technical Interview, HR Interview, Offer, Hired
            $table->string('current_stage')->nullable()->default('Application Received');
            $table->float('match_score')->nullable()->default(0)->comment('نسبة المطابقة بين السيرة الذاتية والوصف الوظيفي');
            $table->json('ai_analysis')->nullable()->comment('تحليل OpenAI الكامل بصيغة JSON');
            $table->timestamp('evaluated_at')->nullable()->comment('وقت إجراء التقييم');
            $table->text('feedback')->nullable();
            $table->timestamp('reviewed_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('applications');
    }
};
