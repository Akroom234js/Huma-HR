<?php

namespace Database\Seeders;

use App\Models\PayrollDeduction;
use App\Models\PayrollRecord;
use App\Models\SalaryAdjustment;
use App\Models\SalaryStructure;
use App\Models\User;
use Illuminate\Database\Seeder;

class SalarySeeder extends Seeder
{
    public function run(): void
    {
        // 1. Salary Structures
        $structures = [
            ['job_level' => 'Junior', 'job_title' => 'Software Engineer I', 'min_salary' => 3000, 'max_salary' => 4500],
            ['job_level' => 'Mid-Level', 'job_title' => 'Software Engineer II', 'min_salary' => 4500, 'max_salary' => 6500],
            ['job_level' => 'Senior', 'job_title' => 'Senior Software Engineer', 'min_salary' => 6500, 'max_salary' => 9000],
            ['job_level' => 'Lead', 'job_title' => 'Lead Software Engineer', 'min_salary' => 8500, 'max_salary' => 12000],
            ['job_level' => 'Principal', 'job_title' => 'Principal Engineer', 'min_salary' => 11000, 'max_salary' => 15000],
        ];

        foreach ($structures as $s) {
            SalaryStructure::create($s);
        }

        // 2. Payroll Records
        $users = User::all();
        $hr = User::where('email', 'hr@company.com')->first();

        foreach ($users as $user) {
            $record = PayrollRecord::create([
                'user_id' => $user->id,
                'processed_by_id' => $hr->id,
                'payroll_month' => now()->month,
                'payroll_year' => now()->year,
                'basic_salary' => 5000,
                'overtime_hours' => 5,
                'overtime_amount' => 150,
                'final_net_salary' => 4800, // example
                'status' => 'paid',
                'paid_date' => now()->toDateString(),
            ]);

            // Deductions
            PayrollDeduction::create([
                'payroll_record_id' => $record->id,
                'deduction_type' => 'absence',
                'amount' => 350,
                'absence_days' => 1,
                'reason' => 'Unexcused absence',
                'applied_by' => 'HR System',
                'applied_date' => now()->toDateString(),
            ]);
        }

        // 3. Adjustment Types
        $types = [
            ['name' => 'Promotion'],
            ['name' => 'Merit Increase'],
            ['name' => 'Cost of Living'],
            ['name' => 'Annual Review'],
            ['name' => 'Other', 'is_other' => true],
        ];

        foreach ($types as $t) {
            \App\Models\AdjustmentType::create($t);
        }

        $meritType = \App\Models\AdjustmentType::where('name', 'Merit Increase')->first();

        // 4. Salary Adjustments
        if ($users->count() > 1) {
            $employee = User::where('email', 'employee@company.com')->with('employeeProfile')->first();
            if ($employee && $employee->employeeProfile) {
                SalaryAdjustment::create([
                    'employee_profile_id' => $employee->employeeProfile->id,
                    'adjustment_type_id'  => $meritType->id,
                    'current_salary'      => 4500,
                    'new_salary'          => 5000,
                    'effective_date'      => now()->subMonths(2)->toDateString(),
                    'adjustment_reason'   => 'Excellent performance review.',
                    'created_by'          => $hr->id,
                ]);
            }
        }
    }
}
