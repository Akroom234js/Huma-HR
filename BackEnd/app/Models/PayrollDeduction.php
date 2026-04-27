<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class PayrollDeduction extends Model
{
    use HasFactory;

    protected $fillable = [
        'payroll_record_id',
        'deduction_type',
        'amount',
        'absence_days',
        'reason',
        'applied_by',
        'applied_date',
    ];

    public function payrollRecord()
    {
        return $this->belongsTo(PayrollRecord::class);
    }
}
