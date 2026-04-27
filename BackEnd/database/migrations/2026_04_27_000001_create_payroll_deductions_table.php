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
        Schema::create('payroll_deductions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payroll_record_id')->constrained('payroll_records')->onDelete('cascade');
            $table->enum('deduction_type', ['absence', 'lateness', 'penalty', 'tax', 'insurance', 'other']);
            $table->decimal('amount', 15, 2);
            $table->integer('absence_days')->default(0);
            $table->text('reason')->nullable();
            $table->string('applied_by')->nullable();
            $table->date('applied_date')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('payroll_deductions');
    }
};
