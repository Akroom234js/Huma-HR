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

            // --- إضافات نظام الـ ATS ---

            // ✅ تعديل: أضفنا no_show و offer_expired
            // no_show       → لم يحضر المقابلة (HR يقدر يعطيه فرصة ثانية أو يرفضه)
            // offer_expired → انتهت صلاحية العرض بدون رد (يتعامل معها الـ Scheduler تلقائياً)
            $table->enum('status', [
                'pending',
                'reviewed',
                'shortlisted',
                'interviewing',
                'offered',
                'hired',
                'rejected',
                'withdrawn',
                'no_show',       // ✅ جديد
                'offer_expired', // ✅ جديد
            ])->default('pending');

            $table->string('current_stage')->nullable()->default('Application Received');
            $table->float('match_score')->nullable()->default(0)
                  ->comment('نسبة المطابقة بين السيرة الذاتية والوصف الوظيفي');
            $table->json('ai_analysis')->nullable()
                  ->comment('تحليل OpenAI الكامل بصيغة JSON');
            $table->timestamp('evaluated_at')->nullable()
                  ->comment('وقت إجراء التقييم');
            $table->text('feedback')->nullable();
            $table->timestamp('reviewed_at')->nullable();

            // ✅ جديد: submitted_at — وقت إرسال الطلب بدقة
            // الفرق عن created_at: created_at بيتحدث تلقائياً مع أي update
            // submitted_at بيبقى ثابت — هو اللحظة الفعلية اللي ضغط فيها المتقدم Submit
            $table->timestamp('submitted_at')->nullable()
                  ->comment('وقت إرسال الطلب — لا يتغير بعد الإنشاء');
            $table->softDeletes(); // لإمكانية استرجاع الطلبات المحذوفة
            $table->timestamps();

            // ✅ جديد: Unique Constraint
            // يمنع نفس الشخص من التقديم على نفس الوظيفة مرتين
            // هاد خط الدفاع الثاني بعد الـ check في ApplicationService
            // بيحمي من الـ Race Condition لو ضغط Submit مرتين بنفس الثانية
            $table->unique(
                ['job_posting_id', 'email'],
                'applications_job_email_unique'
            );
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

