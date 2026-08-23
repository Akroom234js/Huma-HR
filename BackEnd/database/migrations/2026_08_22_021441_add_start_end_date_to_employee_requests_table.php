<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_requests', function (Blueprint $table) {
            if (!Schema::hasColumn('employee_requests', 'start_date')) {
                $table->date('start_date')->nullable()->after('details');
            }
            if (!Schema::hasColumn('employee_requests', 'end_date')) {
                $table->date('end_date')->nullable()->after('start_date');
            }
        });
    }

    public function down(): void
    {
        Schema::table('employee_requests', function (Blueprint $table) {
            $table->dropColumn(['start_date', 'end_date']);
        });
    }
};
