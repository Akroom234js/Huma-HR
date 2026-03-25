<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Models\EmployeeChangeLog;
use App\Models\EmployeeProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmployeeMovementController extends Controller
{
    use ApiResponse;

    // ── GET /api/employee-movements ──────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr,manager
    public function index(Request $request): JsonResponse
    {
        $query = EmployeeChangeLog::with(['user.profile'])
            ->orderByDesc('changed_at');

        // البحث بالاسم
        if ($request->filled('search')) {
            $query->whereHas('user.profile', fn($q) =>
                $q->where('full_name', 'like', '%' . $request->search . '%')
            );
        }

        // الفلترة حسب نوع الحركة (field_changed)
        if ($request->filled('movement_type')) {
            $query->where('field_changed', $request->movement_type);
        }

        // الفلترة حسب التاريخ من.. إلى
        if ($request->filled('start_date')) {
            $query->whereDate('changed_at', '>=', $request->start_date);
        }

        if ($request->filled('end_date')) {
            $query->whereDate('changed_at', '<=', $request->end_date);
        }

        $movements = $query->paginate($request->get('per_page', 15));

        return $this->successResponse(
            data: [
                'movements'  => $movements->items(),
                'pagination' => [
                    'total'        => $movements->total(),
                    'per_page'     => $movements->perPage(),
                    'current_page' => $movements->currentPage(),
                    'last_page'    => $movements->lastPage(),
                ],
            ],
            message: 'Employee movements retrieved successfully.'
        );
    }

    // ── GET /api/employee-movements/types ────────────────────────────────────
    // Middleware: auth:sanctum + role:hr,manager
    public function movementTypes(): JsonResponse
    {
        // يمكن جلب أنواع الحركات من قاعدة البيانات أو تعريفها يدوياً
        // هنا سنفترض أنها حقول معينة يتم تتبعها
        $types = EmployeeChangeLog::select('field_changed')
            ->distinct()
            ->pluck('field_changed');

        return $this->successResponse(
            data: $types,
            message: 'Movement types retrieved successfully.'
        );
    }

    // ── POST /api/employee-movements ─────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'user_id'        => 'required|exists:users,id',
            'field_changed'  => 'required|string|max:255',
            'previous_value' => 'nullable|string',
            'new_value'      => 'nullable|string',
        ]);

        $employeeProfile = EmployeeProfile::where('user_id', $request->user_id)->first();

        if (! $employeeProfile) {
            return $this->errorResponse(
                message: 'Employee profile not found for the given user_id.',
                statusCode: 404
            );
        }

        $employeeProfile->changeLogs()->create([
            'field_changed'  => $request->field_changed,
            'changed_by'     => Auth::id(),
            'previous_value' => $request->previous_value ?? 'N/A',
            'new_value'      => $request->new_value ?? 'N/A',
            'changed_at'     => now(),
        ]);

        return $this->successResponse(
            message: 'Employee movement logged successfully.',
            statusCode: 201
        );
    }
}
