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
        Schema::table('salary_structures', function (Blueprint $table) {
            $table->decimal('tax_percent', 5, 2)->default(0)->after('max_salary');
            $table->decimal('insurance_amount', 15, 2)->default(0)->after('tax_percent');
        });

        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->decimal('tax_percent', 5, 2)->default(0)->after('salary');
            $table->decimal('insurance_amount', 15, 2)->default(0)->after('tax_percent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('salary_structures', function (Blueprint $table) {
            $table->dropColumn(['tax_percent', 'insurance_amount']);
        });

        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropColumn(['tax_percent', 'insurance_amount']);
        });
    }
};
