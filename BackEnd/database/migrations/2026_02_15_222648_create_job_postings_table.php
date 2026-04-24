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
        // الحقل الأهم للربط مع المناصب (هذا ما يبحث عنه الـ Controller)
        $table->foreignId('position_id')->constrained('positions')->onDelete('cascade');
        
        $table->string('title'); // عنوان الإعلان
        $table->text('description');
        
        // يمكنك إبقاء القسم أو حذفه لأن المنصب أصلاً مرتبط بقسم
        $table->foreignId('department_id')->nullable()->constrained('departments')->onDelete('set null');
        
        $table->string('salary_min')->nullable();
        $table->string('salary_max')->nullable();
        $table->string('salary_currency')->default('USD');
        $table->enum('status', ['draft', 'open', 'closed'])->default('draft');
        $table->timestamp('posted_at')->nullable();
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
