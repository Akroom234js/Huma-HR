<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SalaryAdjustment;
use App\Models\AdjustmentType;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SalaryAdjustmentController extends Controller
{
    use ApiResponse;

    // ── GET /api/salary-adjustments/types ────────────────────────────────────
    public function types(): JsonResponse
    {
        $types = AdjustmentType::all();
        return $this->successResponse($types, 'Adjustment types retrieved successfully.');
    }

    // ── GET /api/salary-adjustments ──────────────────────────────────────────
    // صفحة Salary Adjustments History التفصيلية
    // Middleware: auth:sanctum + role:hr,manager
    public function index(Request $request): JsonResponse
    {
        $adjustments = SalaryAdjustment::with([
            'employeeProfile.user',
            'creator.profile',
            'adjustmentType',
        ])
        ->when($request->filled('search'), fn($q) =>
            $q->whereHas('employeeProfile', fn($ep) =>
                $ep->where('full_name', 'like', "%{$request->search}%")
            )
        )
        ->when($request->filled('type'), fn($q) =>
            $q->whereHas('adjustmentType', fn($at) =>
                $at->where('name', $request->type)
            )
        )
        ->orderByDesc('effective_date')
        ->paginate($request->get('per_page', 15));

        // إحصائيات للبطاقات في الأعلى
        $stats = $this->getStats();

        return $this->successResponse(
            data: [
                'stats'       => $stats,
                'adjustments' => $adjustments->items(),
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
            'employeeProfile.user',
            'creator.profile',
            'adjustmentType',
        ])->find($id);

        if (! $adjustment) {
            return $this->errorResponse(
                message: 'Salary adjustment not found.',
                statusCode: 404
            );
        }

        return $this->successResponse(
            data: $adjustment,
            message: 'Salary adjustment retrieved successfully.'
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
        $avgIncrease = SalaryAdjustment::whereYear('effective_date', $currentYear)
            ->selectRaw('AVG((new_salary - current_salary) / current_salary * 100) as avg_percent')
            ->value('avg_percent');

        return [
            'total_adjustments_ytd' => $totalThisYear,
            'vs_last_year'          => ($vsLastYear >= 0 ? '+' : '') . $vsLastYear . '%',
            'avg_adjustment_percent'=> round($avgIncrease ?? 0, 1) . '%',
        ];
    }
}
