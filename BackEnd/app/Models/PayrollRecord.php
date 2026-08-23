<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollRecord extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'processed_by_id',
        'payroll_month',
        'payroll_year',
        'basic_salary',
        'allowances_amount',
        'bonuses_amount',
        'overtime_hours',
        'overtime_amount',
        'final_net_salary',
        'status',
        'paid_date',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function processor()
    {
        return $this->belongsTo(User::class, 'processed_by_id');
    }

    public function deductions()
    {
        return $this->hasMany(PayrollDeduction::class);
    }
    public function recalculateNetSalary(): void
{
    $additionsSum  = $this->deductions()->where('is_addition', true)->sum('amount');
    $deductionsSum = $this->deductions()->where('is_addition', false)->sum('amount');

    // bonuses_amount هون بس للعرض/التقارير — ما بتنضاف مرة ثانية بالمعادلة تحت
    // لأنها أصلاً محسوبة ضمن additionsSum
    $this->bonuses_amount = $additionsSum;

    $this->final_net_salary = $this->basic_salary
        + $this->allowances_amount
        + $this->overtime_amount
        + $additionsSum
        - $deductionsSum;

    $this->save();
}
}
