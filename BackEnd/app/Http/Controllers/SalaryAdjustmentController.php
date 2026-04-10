<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Resources\SalaryAdjustmentResource;
use App\Models\AdjustmentType;
use App\Models\SalaryAdjustment;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalaryAdjustmentController extends Controller
{
    use ApiResponse;

    // ── GET /api/salary-adjustments ──────────────────────────────────────────
    // صفحة Salary Adjustments History التفصيلية
    // Middleware: auth:sanctum + role:hr,manager
    public function index(Request $request): JsonResponse
    {
        $adjustments = SalaryAdjustment::with([
            'employeeProfile',
            'adjustmentType',
            'createdBy.profile',
        ])
        ->when($request->filled('search'), fn($q) =>
            $q->whereHas('employeeProfile', fn($eq) =>
                $eq->where('full_name', 'like', "%{$request->search}%")
                   ->orWhere('employee_id', 'like', "%{$request->search}%")
            )
        )
        ->when($request->filled('type'), fn($q) =>
            // تصفية بالنوع — يشمل custom أيضاً
            $request->type === 'other'
                ? $q->whereNotNull('custom_type_name')
                : $q->whereHas('adjustmentType', fn($aq) =>
                    $aq->where('name', $request->type)
                  )
        )
        ->orderByDesc('effective_date')
        ->paginate($request->get('per_page', 15));

        // إحصائيات للبطاقات في الأعلى
        $stats = $this->getStats();

        return $this->successResponse(
            data: [
                'stats'       => $stats,
                'adjustments' => SalaryAdjustmentResource::collection($adjustments)->resolve(),
                'pagination'  => [
                    'total'        => $adjustments->total(),
                    'per_page'     => $adjustments->perPage(),
                    'current_page' => $adjustments->currentPage(),
                    'last_page'    => $adjustments->lastPage(),
                ],
            ],
            message: 'Salary adjustments retrieved successfully.'
        );
    }

    // ── GET /api/salary-adjustments/{id} ─────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $adjustment = SalaryAdjustment::with([
            'employeeProfile',
            'adjustmentType',
            'createdBy.profile',
        ])->find($id);

        if (! $adjustment) {
            return $this->errorResponse(
                message: 'Salary adjustment not found.',
                statusCode: 404
            );
        }

        return $this->successResponse(
            data: new SalaryAdjustmentResource($adjustment),
            message: 'Salary adjustment retrieved successfully.'
        );
    }

    // ── GET /api/salary-adjustments/types ────────────────────────────────────
    // يرجع أنواع التعديلات للـ dropdown
    public function types(): JsonResponse
    {
        $types = AdjustmentType::all()->map(fn($type) => [
            'id'       => $type->id,
            'name'     => $type->name,
            'is_other' => $type->is_other,
        ]);

        return $this->successResponse(
            data: $types,
            message: 'Adjustment types retrieved successfully.'
        );
    }

    // ── Private: إحصائيات البطاقات ────────────────────────────────────────────
    private function getStats(): array
    {
        $currentYear = now()->year;
        $lastYear    = $currentYear - 1;

        $totalThisYear = SalaryAdjustment::whereYear('effective_date', $currentYear)->count();
        $totalLastYear = SalaryAdjustment::whereYear('effective_date', $lastYear)->count();

        // نسبة التغيير مقارنة بالسنة الماضية
        $vsLastYear = $totalLastYear > 0
            ? round((($totalThisYear - $totalLastYear) / $totalLastYear) * 100, 1)
            : 0;
            // متوسط نسبة الزيادة
        $avgPercent = SalaryAdjustment::whereYear('effective_date', $currentYear)
            ->whereColumn('new_salary', '>', 'current_salary')
            ->selectRaw('AVG(((new_salary - current_salary) / current_salary) * 100) as avg_percent')
            ->value('avg_percent');

        return [
            'total_adjustments_ytd' => $totalThisYear,
            'vs_last_year'          => ($vsLastYear >= 0 ? '+' : '') . $vsLastYear . '%',
            'avg_adjustment_percent'=> round($avgPercent ?? 0, 1) . '%',
        ];
    }
}
