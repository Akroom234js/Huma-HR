<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('performance_actions', function (Blueprint $table) {
            $table->id();

            $table->foreignId('performance_evaluation_id')
                  ->constrained('performance_evaluations')
                  ->cascadeOnDelete();

            // نوع الإجراء المقترح تلقائياً بناءً على الدرجة
            $table->enum('action_type', ['promotion', 'bonus', 'warning', 'dismissal']);

            $table->text('details')->nullable();

            // الحالة — pending حتى يوافق HR أو يرفض
            $table->enum('status', ['pending_approval', 'approved', 'rejected'])
                  ->default('pending_approval');

            $table->foreignId('created_by')->nullable()->constrained('employee_profiles');
            $table->foreignId('approved_by')->nullable()->constrained('employee_profiles');
            $table->timestamp('approved_at')->nullable();

            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('performance_actions');
    }
};
