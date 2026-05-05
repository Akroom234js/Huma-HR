<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        DB::statement("ALTER TABLE payroll_deductions MODIFY COLUMN deduction_type ENUM('absence', 'lateness', 'penalty', 'tax', 'insurance', 'other', 'bonus') NOT NULL");
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        DB::statement("ALTER TABLE payroll_deductions MODIFY COLUMN deduction_type ENUM('absence', 'lateness', 'penalty', 'tax', 'insurance', 'other') NOT NULL");
    }
};
