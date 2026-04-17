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
        // Use DB to drop and update to avoid issues with missing columns in models
        
        // 1. Employee Change Logs
        Schema::table('employee_change_logs', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });
        
        // Update data: change user_id (which currently holds User ID) to Profile ID
        DB::statement("UPDATE employee_change_logs cl 
                       JOIN employee_profiles ep ON cl.user_id = ep.user_id 
                       SET cl.user_id = ep.id");

        Schema::table('employee_change_logs', function (Blueprint $table) {
            $table->renameColumn('user_id', 'employee_profile_id');
        });

        Schema::table('employee_change_logs', function (Blueprint $table) {
            $table->foreign('employee_profile_id')
                  ->references('id')
                  ->on('employee_profiles')
                  ->cascadeOnDelete();
        });

        // 2. Employee Experiences
        Schema::table('employee_experiences', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
        });

        // Update data
        DB::statement("UPDATE employee_experiences ex 
                       JOIN employee_profiles ep ON ex.user_id = ep.user_id 
                       SET ex.user_id = ep.id");

        Schema::table('employee_experiences', function (Blueprint $table) {
            $table->renameColumn('user_id', 'employee_profile_id');
        });

        Schema::table('employee_experiences', function (Blueprint $table) {
            $table->foreign('employee_profile_id')
                  ->references('id')
                  ->on('employee_profiles')
                  ->cascadeOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('employee_change_logs', function (Blueprint $table) {
            $table->dropForeign(['employee_profile_id']);
            $table->renameColumn('employee_profile_id', 'user_id');
        });
        
        // Data revert
        DB::statement("UPDATE employee_change_logs cl 
                       JOIN employee_profiles ep ON cl.user_id = ep.id 
                       SET cl.user_id = ep.user_id");

        Schema::table('employee_change_logs', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });

        Schema::table('employee_experiences', function (Blueprint $table) {
            $table->dropForeign(['employee_profile_id']);
            $table->renameColumn('employee_profile_id', 'user_id');
        });

        // Data revert
        DB::statement("UPDATE employee_experiences ex 
                       JOIN employee_profiles ep ON ex.user_id = ep.id 
                       SET ex.user_id = ep.user_id");

        Schema::table('employee_experiences', function (Blueprint $table) {
            $table->foreign('user_id')->references('id')->on('users')->cascadeOnDelete();
        });
    }
};
