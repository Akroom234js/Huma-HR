<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SalaryStructure extends Model
{
    use HasFactory;

    protected $fillable = [
        'job_level',
        'job_title',
        'min_salary',
        'max_salary',
        'tax_percent',
        'insurance_amount',
        'allowances',
        'currency',
    ];
}
