<?php

namespace App\Http\Controllers;

use App\Models\EmployeeRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EmployeeRequestController extends Controller
{
    use ApiResponse;

    // GET /api/requests
    public function index(Request $request): JsonResponse
    {
        $requests = EmployeeRequest::with(['employeeProfile', 'actionedBy'])
            ->when($request->filled('type') && $request->type !== 'all', function ($q) use ($request) {
                return $q->where('type', $request->type);
            })
            ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                return $q->where('status', $request->status);
            })
            ->when($request->filled('search'), function ($q) use ($request) {
                return $q->whereHas('employeeProfile', function ($sq) use ($request) {
                    $sq->where('full_name', 'like', "%{$request->search}%")
                       ->orWhere('employee_id', 'like', "%{$request->search}%");
                });
            })
            ->latest()
            ->paginate($request->get('per_page', 15));

        // Stats for the cards
        $stats = [
            'pending'  => EmployeeRequest::where('status', 'pending')->count(),
            'approved' => EmployeeRequest::where('status', 'approved')->count(),
            'rejected' => EmployeeRequest::where('status', 'rejected')->count(),
        ];

        return $this->successResponse(
            data: [
                'requests' => $requests->items(),
                'stats'    => $stats,
                'pagination' => [
                    'total'        => $requests->total(),
                    'per_page'     => $requests->perPage(),
                    'current_page' => $requests->currentPage(),
                ]
            ],
            message: 'Requests retrieved successfully.'
        );
    }

    // POST /api/requests
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'employee_profile_id' => 'required|exists:employee_profiles,id',
            'type'                => 'required|string',
            'reason'              => 'nullable|string',
            'details'             => 'nullable|array',
        ]);

        $employeeRequest = EmployeeRequest::create([
            'employee_profile_id' => $request->employee_profile_id,
            'type'                => $request->type,
            'reason'              => $request->reason,
            'details'             => $request->details,
            'status'              => 'pending',
        ]);

        return $this->successResponse($employeeRequest, 'Request submitted successfully.', 201);
    }

    // PATCH /api/requests/{id}/status
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
        ]);

        $employeeRequest = EmployeeRequest::with('employeeProfile')->find($id);
        if (!$employeeRequest) {
            return $this->errorResponse('Request not found.', 404);
        }

        $employeeRequest->update([
            'status'      => $request->status,
            'actioned_by' => Auth::id(),
            'actioned_at' => now(),
        ]);

        // Trigger notification
        $recipientUserId = optional($employeeRequest->employeeProfile)->user_id;
        if ($recipientUserId) {
            $type = $request->status === 'approved' ? 'leave_approved' : 'leave_rejected';
            $title = $request->status === 'approved' ? 'Request Approved' : 'Request Rejected';
            $typeName = ucfirst(str_replace('_', ' ', $employeeRequest->type));
            $actionerProfile = Auth::user()->employeeProfile;
            $actionerName = $actionerProfile ? $actionerProfile->full_name : 'Management';
            $body = "Your {$typeName} request has been {$request->status} by {$actionerName}.";

            \App\Models\HrNotification::create([
                'user_id' => $recipientUserId,
                'type' => $type,
                'title' => $title,
                'body' => $body,
                'data' => json_encode(['request_id' => $employeeRequest->id]),
            ]);
        }

        // TODO: Trigger movement creation or updates if approved and type is promotion/transfer/etc.

        return $this->successResponse($employeeRequest, "Request {$request->status} successfully.");
    }
}
