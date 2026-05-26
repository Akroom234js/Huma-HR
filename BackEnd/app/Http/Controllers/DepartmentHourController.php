<?php

namespace App\Http\Controllers;

use App\Models\DepartmentHour;
use App\Models\Department;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DepartmentHourController extends Controller
{
    use ApiResponse;

    /**
     * عرض قائمة إعدادات ساعات العمل لجميع الأقسام الفعلية للشركة.
     * تتم المزامنة تلقائياً مع جدول الأقسام الفعلي (departments).
     */
    public function index(): JsonResponse
    {
        try {
            // جلب الأقسام الفعلية للشركة من جدول الأقسام
            $actualDepts = Department::orderBy('name')->get();

            if ($actualDepts->isEmpty()) {
                return $this->errorResponse(
                    'لم يتم إنشاء أي أقسام في الشركة بعد. يرجى إضافة الأقسام أولاً في صفحة إدارة الأقسام.',
                    null,
                    404
                );
            }

            // مزامنة إعدادات ساعات العمل مع الأقسام الفعلية
            foreach ($actualDepts as $dept) {
                DepartmentHour::firstOrCreate(
                    ['dept' => $dept->name],
                    [
                        'start_time' => '09:00:00',
                        'end_time' => '17:00:00',
                        'grace_period' => 15,
                        'work_days' => ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
                    ]
                );
            }

            // حذف الإعدادات للأقسام التي تم حذفها أو تعديل اسمها
            $activeDeptNames = $actualDepts->pluck('name')->toArray();
            DepartmentHour::whereNotIn('dept', $activeDeptNames)->delete();

            // جلب الإعدادات المحدثة بالكامل
            $hours = DepartmentHour::orderBy('dept')->get();

            return $this->successResponse($hours, 'Department hours retrieved and synchronized successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve department hours: ' . $e->getMessage(), null, 500);
        }
    }

    /**
     * تحديث إعدادات ساعات عمل قسم معين.
     */
    public function update(Request $request, string $deptName): JsonResponse
    {
        try {
            $request->validate([
                'start_time' => 'required|string',
                'end_time' => 'required|string',
                'grace_period' => 'required|integer|min:0|max:1440',
                'work_days' => 'required|array',
                'work_days.*' => 'required|string|in:Mon,Tue,Wed,Thu,Fri,Sat,Sun'
            ]);

            // التأكد من تهيئة الوقت بالصيغة الصحيحة (H:i:s)
            $startTime = date('H:i:s', strtotime($request->start_time));
            $endTime = date('H:i:s', strtotime($request->end_time));

            $hour = DepartmentHour::updateOrCreate(
                ['dept' => $deptName],
                [
                    'start_time' => $startTime,
                    'end_time' => $endTime,
                    'grace_period' => $request->grace_period,
                    'work_days' => $request->work_days
                ]
            );

            return $this->successResponse($hour, 'Department hours updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), $e->errors(), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update department hours: ' . $e->getMessage(), null, 500);
        }
    }
}
