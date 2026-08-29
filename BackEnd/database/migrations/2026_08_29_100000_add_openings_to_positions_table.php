<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            if (!Schema::hasColumn('positions', 'openings')) {
                $table->unsignedInteger('openings')->default(1)->after('department_id');
            }
        });
    }

    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            if (Schema::hasColumn('positions', 'openings')) {
                $table->dropColumn('openings');
            }
        });
    }
};
