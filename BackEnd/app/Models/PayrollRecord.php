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
}
