<?php

namespace App\Http\Controllers;

use App\Models\AttendanceRecord;
use App\Models\OfficeLocation;
use App\Traits\ApiResponse;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AttendanceController extends Controller
{
    use ApiResponse;

    /**
     * حساب المسافة الجغرافية بالهافرسين (بالمتر)
     */
    private function calculateDistance($lat1, $lon1, $lat2, $lon2)
    {
        $earthRadius = 6371000; // نصف قطر الأرض بالمتر

        $latDelta = deg2rad($lat2 - $lat1);
        $lonDelta = deg2rad($lon2 - $lon1);

        $a = sin($latDelta / 2) * sin($latDelta / 2) +
             cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
             sin($lonDelta / 2) * sin($lonDelta / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c; // المسافة بالمتر
    }

    /**
     * جلب حالة الحضور لليوم الحالي.
     */
    public function today(): JsonResponse
    {
        try {
            $employee = auth()->user()->employeeProfile;
            if (!$employee) {
                return $this->errorResponse('Employee profile not found.', 404);
            }

            $today = Carbon::today()->toDateString();
            $record = AttendanceRecord::where('employee_profile_id', $employee->id)
                ->where('date', $today)
                ->first();

            if (!$record) {
                return $this->successResponse([
                    'status' => 'not_checked_in',
                    'check_in' => null,
                    'check_out' => null,
                    'hours_worked' => null,
                    'is_late' => false,
                ], 'Today\'s attendance retrieved successfully.');
            }

            return $this->successResponse([
                'status' => $record->status,
                'check_in' => $record->check_in ? Carbon::parse($record->check_in)->format('h:i A') : null,
                'check_out' => $record->check_out ? Carbon::parse($record->check_out)->format('h:i A') : null,
                'hours_worked' => $record->hours_worked,
                'is_late' => $record->status === 'late',
                'branch_name' => $record->officeLocation ? $record->officeLocation->name : null,
            ], 'Today\'s attendance retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve today\'s status: ' . $e->getMessage(), 500);
        }
    }

    /**
     * تسجيل الدخول (Check-in) مع التحقق من الموقع الجغرافي.
     */
    public function checkIn(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
            ]);

            $employee = auth()->user()->employeeProfile;
            if (!$employee) {
                return $this->errorResponse('Employee profile not found.', 404);
            }

            $today = Carbon::today()->toDateString();

            // 1. التحقق من وجود فروع للشركة
            $locations = OfficeLocation::where('is_active', true)->get();
            if ($locations->isEmpty()) {
                return $this->errorResponse('لم يتم تحديد مواقع جغرافية للشركة من قبل الـ HR.', 400);
            }

            // 2. البحث عن أقرب فرع وحساب المسافة
            $nearestLocation = null;
            $minDistance = INF;

            foreach ($locations as $loc) {
                $distance = $this->calculateDistance(
                    $request->latitude,
                    $request->longitude,
                    $loc->latitude,
                    $loc->longitude
                );

                if ($distance < $minDistance) {
                    $minDistance = $distance;
                    $nearestLocation = $loc;
                }
            }

            // 3. هل الموظف في النطاق الجغرافي؟
            if ($minDistance > $nearestLocation->radius_meters) {
                return $this->errorResponse('أنت خارج النطاق الجغرافي المسموح به للشركة! أقرب فرع هو: ' . $nearestLocation->name . ' (تبعد عنه ' . round($minDistance) . ' متر، والحد المسموح به هو ' . $nearestLocation->radius_meters . ' متر).', 422);
            }

            // 4. حساب حالة الحضور (متأخر أو في الموعد) باستخدام إعدادات القسم الفعلي للموظف
            $status = 'present';
            $now = Carbon::now();

            $deptName = $employee->department ? $employee->department->name : null;
            $deptHour = null;
            if ($deptName) {
                $deptHour = \App\Models\DepartmentHour::where('dept', $deptName)->first();
            }

            // جلب موعد بدء العمل وفترة السماح من إعدادات القسم أو استخدام توقيت افتراضي (09:00 صباحاً مع فترة سماح 15 دقيقة)
            $startTimeString = $deptHour ? $deptHour->start_time : '09:00:00';
            $gracePeriodMinutes = $deptHour ? $deptHour->grace_period : 15;

            $startTime = Carbon::parse($startTimeString);
            $checkInLimit = Carbon::today()
                ->setTime($startTime->hour, $startTime->minute, $startTime->second)
                ->addMinutes($gracePeriodMinutes);

            if ($now->greaterThan($checkInLimit)) {
                $status = 'late';
            }

            // 5. التحقق من وجود سجل حضور مسبق لليوم
            $existing = AttendanceRecord::where('employee_profile_id', $employee->id)
                ->where('date', $today)
                ->first();

            if ($existing) {
                if ($existing->check_out) {
                    // في حال كان قد سجل خروج، نقوم بإعادة فتح السجل واستئنافه (تصفير الخروج للتجربة المتكررة أو استئناف العمل)
                    $existing->update([
                        'check_in' => Carbon::now()->toTimeString(),
                        'check_out' => null,
                        'hours_worked' => null,
                        'latitude_in' => $request->latitude,
                        'longitude_in' => $request->longitude,
                        'latitude_out' => null,
                        'longitude_out' => null,
                        'office_location_id' => $nearestLocation->id,
                        'distance_in_meters' => round($minDistance),
                        'status' => $status,
                    ]);

                    return $this->successResponse([
                        'check_in' => Carbon::parse($existing->check_in)->format('h:i A'),
                        'status' => $existing->status,
                        'branch_name' => $nearestLocation->name,
                        'distance_meters' => round($minDistance),
                        'reopened' => true
                    ], 'تم استئناف وردية الحضور وإعادة تسجيل الدخول بنجاح اليوم!', 200);
                }

                return $this->errorResponse('لقد قمت بتسجيل الحضور بالفعل اليوم ولم تقم بتسجيل الانصراف بعد!', 400);
            }

            // 6. حفظ السجل
            $record = AttendanceRecord::create([
                'employee_profile_id' => $employee->id,
                'date' => $today,
                'check_in' => Carbon::now()->toTimeString(),
                'latitude_in' => $request->latitude,
                'longitude_in' => $request->longitude,
                'office_location_id' => $nearestLocation->id,
                'distance_in_meters' => round($minDistance),
                'status' => $status,
            ]);

            return $this->successResponse([
                'check_in' => Carbon::parse($record->check_in)->format('h:i A'),
                'status' => $record->status,
                'branch_name' => $nearestLocation->name,
                'distance_meters' => round($minDistance),
            ], 'تم تسجيل حضورك بنجاح!', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to check-in: ' . $e->getMessage(), 500);
        }
    }

    /**
     * تسجيل الخروج (Check-out) مع التحقق من الموقع الجغرافي.
     */
    public function checkOut(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
            ]);

            $employee = auth()->user()->employeeProfile;
            if (!$employee) {
                return $this->errorResponse('Employee profile not found.', 404);
            }

            $today = Carbon::today()->toDateString();

            // 1. البحث عن سجل الحضور لليوم
            $record = AttendanceRecord::where('employee_profile_id', $employee->id)
                ->where('date', $today)
                ->first();

            if (!$record) {
                return $this->errorResponse('لا يوجد تسجيل دخول مسجل لك اليوم!', 400);
            }

            if ($record->check_out) {
                return $this->errorResponse('لقد قمت بتسجيل الانصراف بالفعل اليوم!', 400);
            }

            // 2. التحقق من وجود فروع للشركة
            $locations = OfficeLocation::where('is_active', true)->get();
            if ($locations->isEmpty()) {
                return $this->errorResponse('لم يتم تحديد مواقع جغرافية للشركة من قبل الـ HR.', 400);
            }

            // 3. البحث عن أقرب فرع وحساب المسافة
            $nearestLocation = null;
            $minDistance = INF;

            foreach ($locations as $loc) {
                $distance = $this->calculateDistance(
                    $request->latitude,
                    $request->longitude,
                    $loc->latitude,
                    $loc->longitude
                );

                if ($distance < $minDistance) {
                    $minDistance = $distance;
                    $nearestLocation = $loc;
                }
            }

            // 4. هل الموظف في النطاق الجغرافي؟
            if ($minDistance > $nearestLocation->radius_meters) {
                return $this->errorResponse('أنت خارج النطاق الجغرافي المسموح به للشركة لتسجيل الانصراف! أقرب فرع هو: ' . $nearestLocation->name . ' (تبعد عنه ' . round($minDistance) . ' متر، والحد المسموح به هو ' . $nearestLocation->radius_meters . ' متر).', 422);
            }

            // 5. حساب ساعات العمل
            $checkOutTime = Carbon::now();
            $checkInTime = Carbon::parse($record->check_in);
            $diffInSeconds = $checkOutTime->diffInSeconds($checkInTime);
            $hoursWorked = round($diffInSeconds / 3600, 2);

            // 6. تحديث السجل
            $record->update([
                'check_out' => $checkOutTime->toTimeString(),
                'hours_worked' => $hoursWorked,
                'latitude_out' => $request->latitude,
                'longitude_out' => $request->longitude,
            ]);

            return $this->successResponse([
                'check_out' => Carbon::parse($record->check_out)->format('h:i A'),
                'hours_worked' => $record->hours_worked,
            ], 'تم تسجيل انصرافك بنجاح!');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to check-out: ' . $e->getMessage(), 500);
        }
    }

    /**
     * جلب السجل التاريخي للحضور للموظف.
     */
    public function history(Request $request): JsonResponse
    {
        try {
            $employee = auth()->user()->employeeProfile;
            if (!$employee) {
                return $this->errorResponse('Employee profile not found.', 404);
            }

            $query = AttendanceRecord::with('officeLocation')
                ->where('employee_profile_id', $employee->id);

            // فلترة بالشهور اختيارياً ?month=YYYY-MM
            if ($request->filled('month')) {
                $month = $request->input('month'); // YYYY-MM
                $query->where('date', 'like', "{$month}%");
            }

            $history = $query->orderBy('date', 'desc')->get();

            $formatted = $history->map(function ($item) {
                return [
                    'date' => $item->date,
                    'check_in' => $item->check_in ? Carbon::parse($item->check_in)->format('h:i A') : '--:--',
                    'check_out' => $item->check_out ? Carbon::parse($item->check_out)->format('h:i A') : '--:--',
                    'hours_worked' => $item->hours_worked ? $item->hours_worked . 'h' : ($item->status === 'absent' ? 'Absent' : '--:--'),
                    'is_late' => $item->status === 'late',
                    'is_absent' => $item->status === 'absent',
                    'branch' => $item->officeLocation ? $item->officeLocation->name : null,
                ];
            });

            return $this->successResponse($formatted, 'Attendance history retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve history: ' . $e->getMessage(), 500);
        }
    }

    /**
     * جلب إحصائيات الحضور الأسبوعية (Trends) للرسم البياني.
     */
    public function trends(Request $request): JsonResponse
    {
        try {
            $employee = auth()->user()->employeeProfile;
            if (!$employee) {
                return $this->errorResponse('Employee profile not found.', 404);
            }

            // جلب سجلات آخر 7 أيام
            $startDate = Carbon::now()->subDays(6)->toDateString();
            $endDate = Carbon::now()->toDateString();

            $records = AttendanceRecord::where('employee_profile_id', $employee->id)
                ->whereBetween('date', [$startDate, $endDate])
                ->orderBy('date', 'asc')
                ->get();

            // تجهيز البيانات للأيام السبعة الأخيرة
            $trends = [];
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::now()->subDays($i);
                $dateString = $date->toDateString();
                $dayName = $date->format('D'); // Mon, Tue, etc.

                $found = $records->firstWhere('date', $dateString);

                $trends[] = [
                    'day' => $dayName,
                    'date' => $dateString,
                    'hours' => $found && $found->hours_worked ? (float)$found->hours_worked : 0.0,
                    'status' => $found ? $found->status : 'absent_or_rest',
                ];
            }

            return $this->successResponse($trends, 'Attendance trends retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve trends: ' . $e->getMessage(), 500);
        }
    }
}
