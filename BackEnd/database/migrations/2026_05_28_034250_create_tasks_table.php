<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('tasks', function (Blueprint $table) {
            $table->id();

            // من صاحب المهمة ومن أعطاها
            $table->foreignId('employee_profile_id')
                  ->constrained('employee_profiles')
                  ->onDelete('cascade');

            $table->foreignId('assigned_by')
                  ->constrained('employee_profiles')
                  ->onDelete('cascade');

            // تفاصيل المهمة
            $table->string('title');
            $table->text('description')->nullable();
            $table->date('due_date');

            $table->enum('difficulty', ['easy', 'medium', 'hard'])->default('medium');
            $table->enum('priority', ['low', 'medium', 'high', 'urgent'])->default('medium');

            // حالة المهمة
            $table->enum('status', [
                'pending',         // أُعطيت للموظف ولم يبدأ
                'in_progress',     // الموظف بدأ يشتغل عليها
                'completed',       // الموظف ضغط "أنجزت"
                'needs_revision',   // المدير أرجعها للموظف لتعديل
                'pending_review',  // بانتظار تقييم المدير
                'scored',          // المدير قيّم المهمة ✅
                'overdue',         // فات الموعد ولم تُنجز
            ])->default('pending');

             // ملاحظة المدير — تُستخدم عند الإرجاع أو عند التقييم
            $table->text('manager_note')->nullable();

            // خصم التأخير — يحدده المدير عند إنشاء المهمة
            // مثال: 5 يعني كل يوم تأخير يخصم 5 نقاط
            // 0 يعني مافي خصم
            $table->unsignedTinyInteger('late_penalty_per_day')->default(0);

            // يُحسب تلقائياً عند تغيير status إلى completed
            $table->unsignedInteger('days_late')->default(0);

            // الدرجات — يُدخلها المدير عند التقييم
            $table->decimal('completion_score', 5, 2)->nullable();
            $table->decimal('quality_score', 5, 2)->nullable();

            // التوقيتات
            $table->timestamp('completed_at')->nullable(); // الموظف ضغط "أنجزت"
            $table->timestamp('scored_at')->nullable();    // المدير قيّم

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('tasks');
    }
};
