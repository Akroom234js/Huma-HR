<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DepartmentController extends Controller
{
    use ApiResponse;

    /**
     * عرض قائمة الأقسام مع عدد الموظفين واسم المدير.
     */
    public function index(): JsonResponse
    {
        $departments = Department::with('head:id,full_name')
            ->withCount('employees')
            ->orderBy('name')
            ->get();

        return $this->successResponse(
            data: $departments,
            message: 'Departments retrieved successfully.'
        );
    }

    /**
     * عرض تفاصيل قسم محدد.
     */
    public function show(int $id): JsonResponse
    {
        $department = Department::with(['head:id,full_name'])->withCount('employees')->find($id);

        if (!$department) {
            return $this->errorResponse('Department not found.', 404);
        }

        return $this->successResponse($department, 'Department retrieved successfully.');
    }

    /**
     * إنشاء قسم جديد وتعيين موظفين ومدير له.
     */
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name',
            'description' => 'nullable|string',
            'head_id' => 'nullable|exists:employee_profiles,id',
            'employee_ids' => 'nullable|array',
            'employee_ids.*' => 'exists:employee_profiles,id',
        ]);

        $department = DB::transaction(function () use ($request) {
            // إنشاء القسم مع head_id
            $dept = Department::create([
                'name' => $request->name,
                'description' => $request->description,
                'head_id' => $request->head_id
            ]);

            // ربط مجموعة موظفين بهذا القسم
            if ($request->filled('employee_ids')) {
                EmployeeProfile::whereIn('id', $request->employee_ids)
                    ->update(['department_id' => $dept->id]);
            }

            // إذا تم تحديد مدير، نربطه بالقسم ونحدده كمدير مباشر للموظفين
            if ($request->filled('head_id')) {
                $head = EmployeeProfile::find($request->head_id);
                $head->update(['department_id' => $dept->id]);
                
                if ($request->filled('employee_ids')) {
                    EmployeeProfile::whereIn('id', $request->employee_ids)
                        ->update(['manager_id' => $head->id]);
                }
            }

            return $dept->load('head:id,full_name');
        });

        return $this->successResponse($department, 'Department created successfully.', 201);
    }

    /**
     * تحديث بيانات القسم.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        $department = Department::find($id);
        if (!$department) {
            return $this->errorResponse('Department not found.', 404);
        }

        $request->validate([
            'name' => 'required|string|max:255|unique:departments,name,' . $id,
            'description' => 'nullable|string',
            'head_id' => 'nullable|exists:employee_profiles,id',
        ]);

        $department->update($request->only(['name', 'description', 'head_id']));

        return $this->successResponse($department->load('head:id,full_name'), 'Department updated successfully.');
    }

    /**
     * حذف القسم (بشرط عدم وجود موظفين مرتبين به).
     */
    public function destroy(int $id): JsonResponse
    {
        $department = Department::find($id);
        if (!$department) {
            return $this->errorResponse('Department not found.', 404);
        }

        if ($department->employees()->exists()) {
            return $this->errorResponse('Cannot delete department with assigned employees.', 422);
        }

        $department->delete();

        return $this->successResponse(null, 'Department deleted successfully.');
    }

    /**
     * جلب إحصائيات الأقسام للرسوم البيانية والجدول الرئيسي.
     */
    public function stats(): JsonResponse
    {
        // جلب الأقسام مع العلاقات اللازمة للحسابات
        $departments = Department::with(['head', 'employees' => function($query) {
                $query->select('id', 'department_id', 'salary');
            }])
            ->withCount(['employees', 'jobPostings as open_positions_count' => function($query) {
                $query->where('status', 'open'); 
            }])
            ->get();

        $distribution = $departments->map(fn($d) => [
            'name' => $d->name,
            'value' => $d->employees_count
        ]);

        $budgetData = $departments->map(fn($d) => [
            'name' => $d->name,
            'budget' => (float) $d->employees->sum('salary')
        ]);

        $tableData = $departments->map(fn($d) => [
            'name' => $d->name,
            'head' => $d->head ? $d->head->full_name : '—', 
            'count' => $d->employees_count,
            'openPositions' => $d->open_positions_count,
            'budget' => '$' . number_format($d->employees->sum('salary'))
        ]);

        return $this->successResponse(
            data: [
                'distribution' => $distribution,
                'budget'       => $budgetData,
                'tableData'    => $tableData,
            ],
            message: 'Department statistics retrieved successfully.'
        );
    }
}