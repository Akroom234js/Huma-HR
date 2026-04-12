<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

// الأمر: php artisan make:migration create_adjustment_types_table
// المسار: database/migrations/

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('adjustment_types', function (Blueprint $table) {
            $table->id();
            $table->string('name');               // Annual Increase, Merit Increase, etc.
            $table->boolean('is_other')->default(false); // علامة لـ "Other"
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('adjustment_types');
    }
};
