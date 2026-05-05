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
        Schema::table('positions', function (Blueprint $table) {
            $table->decimal('allowances', 15, 2)->default(0)->after('max_salary');
        });

        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->decimal('allowances', 15, 2)->default(0)->after('salary');
        });

        Schema::table('payroll_records', function (Blueprint $table) {
            $table->decimal('allowances_amount', 15, 2)->default(0)->after('basic_salary');
            $table->decimal('bonuses_amount', 15, 2)->default(0)->after('allowances_amount');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->dropColumn('allowances');
        });

        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropColumn('allowances');
        });

        Schema::table('payroll_records', function (Blueprint $table) {
            $table->dropColumn(['allowances_amount', 'bonuses_amount']);
        });
    }
};
