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
        Schema::create('departments', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // يفضل أن يكون الاسم فريداً
            $table->text('description')->nullable();
            
            // إضافة حقل مدير القسم (يرتبط بجدول الموظفين)
            // نجعله nullable لأن القسم قد يُنشأ قبل تعيين مدير له
            $table->unsignedBigInteger('head_id')->nullable(); 

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('departments');
    }
};