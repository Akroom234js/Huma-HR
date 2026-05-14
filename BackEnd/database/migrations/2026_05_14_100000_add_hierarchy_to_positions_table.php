<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->unsignedBigInteger('parent_position_id')->nullable()->after('department_id');
            $table->unsignedTinyInteger('hierarchy_level')->default(0)->after('parent_position_id');
            $table->boolean('is_managerial')->default(false)->after('hierarchy_level');

            $table->foreign('parent_position_id')
                  ->references('id')->on('positions')
                  ->nullOnDelete();

            $table->index('parent_position_id');
            $table->index(['department_id', 'hierarchy_level']);
        });
    }

    public function down(): void
    {
        Schema::table('positions', function (Blueprint $table) {
            $table->dropForeign(['parent_position_id']);
            $table->dropIndex(['parent_position_id']);
            $table->dropIndex(['department_id', 'hierarchy_level']);
            $table->dropColumn(['parent_position_id', 'hierarchy_level', 'is_managerial']);
        });
    }
};
