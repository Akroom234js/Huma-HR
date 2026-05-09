<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\SalaryAdjustment;
use App\Models\AdjustmentType;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use App\Http\Resources\SalaryAdjustmentResource;

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
            'createdBy.profile',
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

        $stats = $this->getStats();

        return $this->successResponse(
            data: [
                'stats'       => $stats,
                'adjustments' => SalaryAdjustmentResource::collection($adjustments->items()),
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

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'employee_profile_id' => 'required|exists:employee_profiles,id',
            'adjustment_type_id'  => 'required|exists:adjustment_types,id',
            'new_salary'          => 'required|numeric|min:0',
            'effective_date'      => 'required|date',
            'adjustment_reason'   => 'nullable|string',
        ]);

        $profile = \App\Models\EmployeeProfile::find($validated['employee_profile_id']);
        
        // Trigger EmployeeProfile->salary update
        $oldSalary = $profile->salary;
        $profile->update(['salary' => $validated['new_salary']]);

        $adjustment = SalaryAdjustment::create([
            'employee_profile_id' => $validated['employee_profile_id'],
            'adjustment_type_id'  => $validated['adjustment_type_id'],
            'current_salary'      => $oldSalary,
            'new_salary'          => $validated['new_salary'],
            'effective_date'      => $validated['effective_date'],
            'adjustment_reason'   => $validated['adjustment_reason'],
            'created_by'          => auth()->id(),
        ]);

        // Load relationships for the resource
        $adjustment->load(['employeeProfile.user', 'createdBy.profile', 'adjustmentType']);

        return $this->successResponse(
            data: new SalaryAdjustmentResource($adjustment),
            message: 'Salary adjustment created successfully and employee salary updated.',
            statusCode: 201
        );
    }

    // ── GET /api/salary-adjustments/{id} ─────────────────────────────────────
    public function show(int $id): JsonResponse
    {
        $adjustment = SalaryAdjustment::with([
            'employeeProfile.user',
            'createdBy.profile',
            'adjustmentType',
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
            ->where('current_salary', '>', 0) // Prevent division by zero
            ->selectRaw('AVG((new_salary - current_salary) / current_salary * 100) as avg_percent')
            ->value('avg_percent');

        return [
            'total_adjustments_ytd' => $totalThisYear,
            'vs_last_year'          => ($vsLastYear >= 0 ? '+' : '') . $vsLastYear . '%',
            'avg_adjustment_percent'=> round($avgIncrease ?? 0, 1) . '%',
        ];
    }
}
