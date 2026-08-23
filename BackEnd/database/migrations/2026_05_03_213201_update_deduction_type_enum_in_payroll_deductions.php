<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

/**
 * يضيف bonus و reward للـ enum في payroll_deductions.deduction_type
 * MySQL ما بيدعم تعديل enum بـ Blueprint مباشرة — نستخدم Raw SQL
 */
return new class extends Migration
{
    public function up(): void
    {
        DB::statement("ALTER TABLE payroll_deductions MODIFY COLUMN deduction_type ENUM('absence','lateness','penalty','tax','insurance','other','bonus','reward') NOT NULL");
    }

    public function down(): void
    {
        DB::statement("ALTER TABLE payroll_deductions MODIFY COLUMN deduction_type ENUM('absence','lateness','penalty','tax','insurance','other') NOT NULL");
    }
};
