<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // 1. Create leave_types table
        Schema::create('leave_types', function (Blueprint $table) {
            $table->id();
            $table->string('name_en');
            $table->string('name_ar')->nullable();
            $table->integer('allocation')->default(15);
            $table->text('desc_en')->nullable();
            $table->text('desc_ar')->nullable();
            $table->boolean('is_paid')->default(false);
            $table->boolean('requires_approval')->default(true);
            $table->timestamps();
        });

        // 2. Create leave_balances table
        Schema::create('leave_balances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('employee_profile_id')->constrained('employee_profiles')->onDelete('cascade');
            $table->foreignId('leave_type_id')->constrained('leave_types')->onDelete('cascade');
            $table->integer('allocated');
            $table->integer('used')->default(0);
            $table->integer('remaining');
            $table->timestamps();

            $table->unique(['employee_profile_id', 'leave_type_id']);
        });

        // 3. Seed default leave types
        $defaultTypes = [
            [
                'name_en' => 'Sick Leave',
                'name_ar' => 'إجازة مرضية',
                'allocation' => 15,
                'desc_en' => 'Paid sick leave with medical proof.',
                'desc_ar' => 'إجازة مرضية مدفوعة مع تقديم عذر طبي.',
                'is_paid' => true,
                'requires_approval' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_en' => 'Annual Leave',
                'name_ar' => 'إجازة سنوية',
                'allocation' => 24,
                'desc_en' => 'Standard paid annual vacation time.',
                'desc_ar' => 'الإجازة السنوية المدفوعة الاعتيادية.',
                'is_paid' => true,
                'requires_approval' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_en' => 'Emergency Leave',
                'name_ar' => 'إجازة اضطرارية',
                'allocation' => 10,
                'desc_en' => 'Immediate time off for sudden emergencies.',
                'desc_ar' => 'إجازة فورية للحالات الطارئة والمفاجئة.',
                'is_paid' => true,
                'requires_approval' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'name_en' => 'Personal Leave',
                'name_ar' => 'إجازة شخصية',
                'allocation' => 5,
                'desc_en' => 'Unpaid leave for personal reasons.',
                'desc_ar' => 'إجازة غير مدفوعة لأسباب وظروف شخصية.',
                'is_paid' => false,
                'requires_approval' => true,
                'created_at' => now(),
                'updated_at' => now(),
            ]
        ];

        DB::table('leave_types')->insert($defaultTypes);

        // 4. Seed balances for all existing employees
        $employees = DB::table('employee_profiles')->get();
        $leaveTypes = DB::table('leave_types')->get();

        foreach ($employees as $employee) {
            foreach ($leaveTypes as $type) {
                DB::table('leave_balances')->insert([
                    'employee_profile_id' => $employee->id,
                    'leave_type_id' => $type->id,
                    'allocated' => $type->allocation,
                    'used' => 0,
                    'remaining' => $type->allocation,
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leave_balances');
        Schema::dropIfExists('leave_types');
    }
};
