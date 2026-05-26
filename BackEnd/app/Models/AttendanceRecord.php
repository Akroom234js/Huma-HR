<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class AttendanceRecord extends Model
{
    protected $fillable = [
        'employee_profile_id',
        'date',
        'check_in',
        'check_out',
        'hours_worked',
        'latitude_in',
        'longitude_in',
        'latitude_out',
        'longitude_out',
        'office_location_id',
        'distance_in_meters',
        'status',
        'lateness_reason',
    ];

    public function employeeProfile()
    {
        return $this->belongsTo(EmployeeProfile::class);
    }

    public function officeLocation()
    {
        return $this->belongsTo(OfficeLocation::class);
    }
}
