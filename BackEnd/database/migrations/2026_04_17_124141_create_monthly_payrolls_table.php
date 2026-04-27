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
        Schema::create('payroll_records', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('processed_by_id')->nullable()->constrained('users');
            $table->integer('payroll_month');
            $table->integer('payroll_year');
            $table->decimal('basic_salary', 15, 2);
            $table->decimal('overtime_hours', 8, 2)->default(0);
            $table->decimal('overtime_amount', 15, 2)->default(0);
            $table->decimal('final_net_salary', 15, 2);
            $table->enum('status', ['paid', 'unpaid'])->default('unpaid');
            $table->date('paid_date')->nullable();
            $table->timestamps();
            
            $table->unique(['user_id', 'payroll_month', 'payroll_year']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_records');
    }
};
