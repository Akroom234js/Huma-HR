<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->unsignedBigInteger('position_id')->nullable()->after('department_id');

            $table->foreign('position_id')
                  ->references('id')->on('positions')
                  ->nullOnDelete();

            $table->index('position_id');
        });
    }

    public function down(): void
    {
        Schema::table('employee_profiles', function (Blueprint $table) {
            $table->dropForeign(['position_id']);
            $table->dropIndex(['position_id']);
            $table->dropColumn('position_id');
        });
    }
};
