<?php

namespace App\Http\Controllers;

use App\Models\EmployeeRequest;
use App\Models\LeaveType;
use App\Models\LeaveBalance;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use App\Models\Department;
use App\Models\EmployeeProfile;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class EmployeeRequestController extends Controller
{
    use ApiResponse;

    // GET /api/requests (HR / Manager)
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

    // GET /api/my-requests (Employee)
    public function myRequests(Request $request): JsonResponse
    {
        $employeeProfile = Auth::user()->employeeProfile;
        if (!$employeeProfile) {
            return $this->errorResponse('Employee profile not found.', 404);
        }

        $requests = EmployeeRequest::where('employee_profile_id', $employeeProfile->id)
            ->when($request->filled('type') && $request->type !== 'all', function ($q) use ($request) {
                return $q->where('type', $request->type);
            })
            ->when($request->filled('status') && $request->status !== 'all', function ($q) use ($request) {
                return $q->where('status', $request->status);
            })
            ->latest()
            ->get();

        return $this->successResponse($requests, 'Your requests retrieved successfully.');
    }

    // GET /api/leave-types (Everyone authenticated)
    public function getLeaveTypes(): JsonResponse
    {
        $types = LeaveType::orderBy('id', 'asc')->get();
        return $this->successResponse($types, 'Leave types retrieved successfully.');
    }

    // POST /api/leave-types (HR Only)
    public function storeLeaveType(Request $request): JsonResponse
    {
        $request->validate([
            'nameEn'            => 'required|string',
            'nameAr'            => 'nullable|string',
            'allocation'        => 'required|integer|min:1|max:365',
            'descEn'            => 'nullable|string',
            'descAr'            => 'nullable|string',
            'isPaid'            => 'nullable|boolean',
            'requiresApproval'  => 'nullable|boolean',
        ]);

        $leaveType = LeaveType::create([
            'name_en'           => $request->nameEn,
            'name_ar'           => $request->nameAr,
            'allocation'        => (int)$request->allocation,
            'desc_en'           => $request->descEn,
            'desc_ar'           => $request->descAr,
            'is_paid'           => $request->isPaid ?? false,
            'requires_approval' => $request->requiresApproval ?? true,
        ]);

        return $this->successResponse($leaveType, 'Leave type created successfully.', 201);
    }

    // PUT /api/leave-types/{id} (HR Only)
    public function updateLeaveType(Request $request, int $id): JsonResponse
    {
        $leaveType = LeaveType::find($id);
        if (!$leaveType) {
            return $this->errorResponse('Leave type not found.', 404);
        }

        $request->validate([
            'nameEn'            => 'required|string',
            'nameAr'            => 'nullable|string',
            'allocation'        => 'required|integer|min:1|max:365',
            'descEn'            => 'nullable|string',
            'descAr'            => 'nullable|string',
            'isPaid'            => 'nullable|boolean',
            'requiresApproval'  => 'nullable|boolean',
        ]);

        $newAllocation = (int)$request->allocation;

        $leaveType = DB::transaction(function () use ($leaveType, $request, $newAllocation) {
            $leaveType->update([
                'name_en'           => $request->nameEn,
                'name_ar'           => $request->nameAr,
                'allocation'        => $newAllocation,
                'desc_en'           => $request->descEn,
                'desc_ar'           => $request->descAr,
                'is_paid'           => $request->isPaid ?? false,
                'requires_approval' => $request->requiresApproval ?? true,
            ]);

            // Cascade allocation update to all existing employees
            $balances = LeaveBalance::where('leave_type_id', $leaveType->id)->get();
            foreach ($balances as $balance) {
                $used = (int)$balance->used;
                $balance->allocated = $newAllocation;
                $balance->remaining = max(0, $newAllocation - $used);
                $balance->save();
            }

            return $leaveType;
        });

        return $this->successResponse($leaveType, 'Leave type and employee balances updated successfully.');
    }

    // DELETE /api/leave-types/{id} (HR Only)
    public function deleteLeaveType(int $id): JsonResponse
    {
        $leaveType = LeaveType::find($id);
        if (!$leaveType) {
            return $this->errorResponse('Leave type not found.', 404);
        }

        // Check if there are active employee requests linked to this leave type
        $hasRequests = EmployeeRequest::where(function ($query) use ($leaveType) {
            $query->where('type', $leaveType->name_en)
                  ->orWhere('details->leave_type_id', $leaveType->id);
        })->exists();

        if ($hasRequests) {
            return $this->errorResponse('Cannot delete this leave type because there are employee requests linked to it. You may modify its allocation instead.', 400);
        }

        DB::transaction(function () use ($leaveType) {
            LeaveBalance::where('leave_type_id', $leaveType->id)->delete();
            $leaveType->delete();
        });

        return $this->successResponse(null, 'Leave type deleted successfully.');
    }

    // GET /api/employee-balances (HR Only)
    public function getAllEmployeeBalances(): JsonResponse
    {
        $employees = EmployeeProfile::with(['department', 'leaveBalances.leaveType'])
            ->where('employment_status', 'active')
            ->orderBy('full_name', 'asc')
            ->get();

        return $this->successResponse($employees, 'All employee leave balances retrieved successfully.');
    }

    // PUT /api/employee-balances/{employeeProfileId}/{leaveTypeId} (HR Only)
    public function updateEmployeeBalance(Request $request, int $employeeProfileId, int $leaveTypeId): JsonResponse
    {
        $request->validate([
            'allocated' => 'required|integer|min:0|max:365',
            'used'      => 'nullable|integer|min:0|max:365',
        ]);

        $balance = LeaveBalance::firstOrCreate(
            [
                'employee_profile_id' => $employeeProfileId,
                'leave_type_id'       => $leaveTypeId,
            ],
            [
                'allocated' => (int)$request->allocated,
                'used'      => 0,
                'remaining' => (int)$request->allocated,
            ]
        );

        $allocated = (int)$request->allocated;
        $used = $request->has('used') ? (int)$request->used : (int)$balance->used;
        $remaining = max(0, $allocated - $used);

        $balance->update([
            'allocated' => $allocated,
            'used'      => $used,
            'remaining' => $remaining,
        ]);

        return $this->successResponse($balance->load('leaveType'), 'Employee leave balance updated successfully.');
    }

    // GET /api/my-leave-balances (Employee)
    public function myLeaveBalances(): JsonResponse
    {
        $employeeProfile = Auth::user()->employeeProfile;
        if (!$employeeProfile) {
            return $this->errorResponse('Employee profile not found.', 404);
        }

        $balances = LeaveBalance::with('leaveType')
            ->where('employee_profile_id', $employeeProfile->id)
            ->get();

        return $this->successResponse($balances, 'Leave balances retrieved successfully.');
    }

    // POST /api/requests (Employee)
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'type'                => 'required|string',
            'reason'              => 'nullable|string',
            'details'             => 'nullable', // details can be sent as JSON or form fields
        ]);

        $employeeProfile = Auth::user()->employeeProfile;
        $employeeProfileId = $request->employee_profile_id ?? ($employeeProfile ? $employeeProfile->id : null);

        if (!$employeeProfileId) {
            return $this->errorResponse('Employee profile not found.', 400);
        }

        // Details parsing (support both JSON string and raw array)
        $details = $request->details;
        if (is_string($details)) {
            $details = json_decode($details, true) ?? [];
        } elseif (!is_array($details)) {
            $details = [];
        }

        // Try to handle frontend specific fields (startDate, duration, reason)
        if ($request->filled('startDate')) {
            $details['start_date'] = $request->startDate;
        }
        if ($request->filled('duration')) {
            $details['duration'] = (int)$request->duration;
        }
        if ($request->filled('leaveType')) {
            $request->merge(['type' => $request->leaveType]);
        }

        // --- SMART VALIDATION: Enforce medical attachment for sick leaves ---
        $isSickLeave = in_array(strtolower($request->type), ['sick', 'sick leave', 'sick_leave']) || 
                       str_contains(strtolower($request->type), 'sick') || 
                       (isset($details['leave_type_name']) && str_contains(strtolower($details['leave_type_name']), 'sick'));
        
        if ($isSickLeave && !$request->hasFile('attachment')) {
            return $this->errorResponse('Medical attachment is mandatory for sick leaves. Please upload a medical certificate.', 422);
        }

        // --- SMART VALIDATION: Cross date range overlap / intersection check ---
        $startDate = $details['start_date'] ?? null;
        $duration = (int)($details['duration'] ?? $request->duration ?? 1);
        if ($startDate) {
            $endDate = date('Y-m-d', strtotime($startDate . " + " . ($duration - 1) . " days"));
            $existingRequests = EmployeeRequest::where('employee_profile_id', $employeeProfileId)
                ->where('status', '!=', 'rejected')
                ->get();

            foreach ($existingRequests as $existing) {
                $existStart = $existing->details['start_date'] ?? null;
                $existDuration = (int)($existing->details['duration'] ?? 1);
                if ($existStart) {
                    $existEnd = date('Y-m-d', strtotime($existStart . " + " . ($existDuration - 1) . " days"));
                    // Overlap check formula: (start1 <= end2) && (end1 >= start2)
                    if ($startDate <= $existEnd && $endDate >= $existStart) {
                        return $this->errorResponse('Cross date overlap: You already have an active request submitted that covers this period.', 422);
                    }
                }
            }
        }

        $isLeave = false;
        $leaveType = null;

        // Is this a leave request?
        if (in_array(strtolower($request->type), ['vacation', 'leave', 'sick', 'annual', 'emergency', 'personal']) || str_ends_with(strtolower($request->type), 'leave')) {
            $isLeave = true;
        }

        // Look up leave type
        $searchType = $details['leave_type_id'] ?? $request->type;
        if (is_numeric($searchType)) {
            $leaveType = LeaveType::find($searchType);
        } else {
            $leaveType = LeaveType::where('name_en', 'like', "%{$searchType}%")
                ->orWhere('name_ar', 'like', "%{$searchType}%")
                ->first();
        }

        if ($isLeave && !$leaveType) {
            // Default fallback
            $leaveType = LeaveType::where('name_en', 'Annual Leave')->first();
        }

        if ($leaveType) {
            $isLeave = true;
            $duration = (int)($details['duration'] ?? $request->duration ?? 1);
            $details['leave_type_id'] = $leaveType->id;
            $details['leave_type_name'] = $leaveType->name_en;

            // Check if there is enough balance
            $balance = LeaveBalance::where('employee_profile_id', $employeeProfileId)
                ->where('leave_type_id', $leaveType->id)
                ->first();

            if ($balance && $balance->remaining < $duration) {
                return $this->errorResponse("Insufficient leave balance. You have only {$balance->remaining} days left for {$leaveType->name_en}.", 422);
            }
        }

        // Handle attachment file upload
        if ($request->hasFile('attachment')) {
            $file = $request->file('attachment');
            $path = $file->store('attachments', 'public');
            
            $details['attachment_name'] = $file->getClientOriginalName();
            $details['attachment_url']  = asset('storage/' . $path);
            $details['attachment_size'] = $file->getSize();
        }

        $status = 'pending';
        // Auto-approve if leave doesn't require approval
        if ($leaveType && !$leaveType->requires_approval) {
            $status = 'approved';
        }

        $startDate = $details['start_date'] ?? null;
        $requestDuration = (int)($details['duration'] ?? 1);
        $endDate = $startDate
            ? Carbon::parse($startDate)->addDays($requestDuration - 1)->format('Y-m-d')
            : null;

        $employeeRequest = EmployeeRequest::create([
            'employee_profile_id' => $employeeProfileId,
            'type'                => $request->type,
            'reason'              => $request->reason ?? $request->reson,
            'details'             => $details,
            'status'              => $status,
            'start_date'          => $startDate,
            'end_date'            => $endDate,
        ]);

        // If auto-approved, deduct from balance right away and sync attendance records
        if ($status === 'approved') {
            if ($leaveType) {
                $balance = LeaveBalance::where('employee_profile_id', $employeeProfileId)
                    ->where('leave_type_id', $leaveType->id)
                    ->first();
                if ($balance) {
                    $balance->used += $duration;
                    $balance->remaining = max(0, $balance->allocated - $balance->used);
                    $balance->save();
                }
            }
            $this->syncAttendanceRecords($employeeRequest);
        }

        return $this->successResponse($employeeRequest, 'Request submitted successfully.', 201);
    }

    // PATCH /api/requests/{id}/status (HR Only)
    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $request->validate([
            'status' => 'required|in:approved,rejected',
            'reason' => 'nullable|string',
        ]);

        // --- SMART FEATURES: Complete Database Transaction wrapper for Transaction Integrity ---
        $result = DB::transaction(function () use ($request, $id) {
            $employeeRequest = EmployeeRequest::with('employeeProfile')->lockForUpdate()->find($id);
            if (!$employeeRequest) {
                return ['error' => 'Request not found.', 'code' => 404];
            }

            if ($employeeRequest->status !== 'pending') {
                return ['error' => 'Request has already been actioned.', 'code' => 400];
            }

            $details = $employeeRequest->details ?? [];
            $isLeave = false;
            $leaveType = null;

            // Is this a leave request?
            if (in_array(strtolower($employeeRequest->type), ['vacation', 'leave', 'sick', 'annual', 'emergency', 'personal']) || str_ends_with(strtolower($employeeRequest->type), 'leave')) {
                $isLeave = true;
            }

            // Look up leave type
            $searchType = $details['leave_type_id'] ?? $employeeRequest->type;
            if (is_numeric($searchType)) {
                $leaveType = LeaveType::find($searchType);
            } else {
                $leaveType = LeaveType::where('name_en', 'like', "%{$searchType}%")
                    ->orWhere('name_ar', 'like', "%{$searchType}%")
                    ->first();
            }

            if ($isLeave && !$leaveType) {
                $leaveType = LeaveType::where('name_en', 'Annual Leave')->first();
            }

            if ($request->status === 'approved' && $leaveType) {
                $duration = (int)($details['duration'] ?? 1);
                
                // Check & deduct balance
                $balance = LeaveBalance::where('employee_profile_id', $employeeRequest->employee_profile_id)
                    ->where('leave_type_id', $leaveType->id)
                    ->first();

                if ($balance) {
                    if ($balance->remaining < $duration) {
                        return ['error' => "Cannot approve. Employee only has {$balance->remaining} days left for {$leaveType->name_en}.", 'code' => 400];
                    }

                    $balance->used += $duration;
                    $balance->remaining = max(0, $balance->allocated - $balance->used);
                    $balance->save();

                    $details['remaining_balance'] = $balance->remaining;
                    $employeeRequest->details = $details;
                }
            }

            $employeeRequest->update([
                'status'      => $request->status,
                'reason'      => $request->reason ?? $employeeRequest->reason,
                'actioned_by' => Auth::id(),
                'actioned_at' => now(),
            ]);

            // --- SMART FEATURES: Attendance Sync integration on approval ---
            if ($request->status === 'approved') {
                $this->syncAttendanceRecords($employeeRequest);
            }

            return ['success' => true, 'request' => $employeeRequest];
        });

        if (isset($result['error'])) {
            return $this->errorResponse($result['error'], $result['code']);
        }

        $employeeRequest = $result['request'];

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

        return $this->successResponse($employeeRequest, "Request {$request->status} successfully.");
    }

    // GET /api/leaves/dashboard-analytics (HR / Manager)
    public function dashboardAnalytics(Request $request): JsonResponse
    {
        // 1. Stats card overview
        $pendingRequestsCount = EmployeeRequest::where('status', 'pending')->count();
        $totalAnnualBalance = LeaveBalance::sum('allocated');

        $highestRequesterQuery = EmployeeRequest::select('employee_profile_id', DB::raw('count(*) as total'))
            ->groupBy('employee_profile_id')
            ->orderByDesc('total')
            ->first();
        
        $highestRequesterName = 'None';
        if ($highestRequesterQuery) {
            $profile = EmployeeProfile::find($highestRequesterQuery->employee_profile_id);
            if ($profile) {
                $highestRequesterName = $profile->full_name;
            }
        }

        $totalUsedDays = LeaveBalance::sum('used');

        $stats = [
            [
                'label' => 'Pending Requests',
                'value' => (string)$pendingRequestsCount,
                'icon'  => 'pending_actions',
            ],
            [
                'label' => 'Annual Balance',
                'value' => number_format($totalAnnualBalance) . ' Days',
                'icon'  => 'account_balance',
            ],
            [
                'label' => 'Highest Requester',
                'value' => $highestRequesterName,
                'icon'  => 'person_alert',
            ],
            [
                'label' => 'Used Days',
                'value' => number_format($totalUsedDays),
                'icon'  => 'calendar_today',
            ],
        ];

        // 2. Recent leave requests formatted exactly as Leaves.jsx expects
        $requestsRaw = EmployeeRequest::with(['employeeProfile.department'])
            ->latest()
            ->get();

        $leaveRequests = $requestsRaw->map(function ($req) {
            $profile = $req->employeeProfile;
            $deptName = $profile && $profile->department ? $profile->department->name : 'General';
            $duration = isset($req->details['duration']) ? (int)$req->details['duration'] : 1;
            
            $startDate = $req->details['start_date'] ?? null;
            $endDate = null;
            if ($startDate && $duration > 1) {
                $endDate = date('Y-m-d', strtotime($startDate . " + " . ($duration - 1) . " days"));
            }
            $dates = $startDate ? ($endDate ? "{$startDate} - {$endDate}" : $startDate) : 'Not specified';

            $remainingBalance = 0;
            $leaveType = null;
            $searchType = $req->details['leave_type_id'] ?? $req->type;
            if ($profile) {
                if (is_numeric($searchType)) {
                    $leaveType = LeaveType::find($searchType);
                } else {
                    $leaveType = LeaveType::where('name_en', 'like', "%{$searchType}%")
                        ->orWhere('name_ar', 'like', "%{$searchType}%")
                        ->first();
                }
                if ($leaveType) {
                    $balanceModel = LeaveBalance::where('employee_profile_id', $profile->id)
                        ->where('leave_type_id', $leaveType->id)
                        ->first();
                    if ($balanceModel) {
                        $remainingBalance = $balanceModel->remaining;
                    }
                }
            }

            return [
                'id'       => $req->id,
                'name'     => $profile ? $profile->full_name : 'Unknown Employee',
                'dept'     => $deptName,
                'type'     => $leaveType ? $leaveType->name_en : ucfirst($req->type),
                'dates'    => $dates,
                'duration' => $duration,
                'status'   => $req->status,
                'balance'  => $remainingBalance,
                'reason'   => $req->reason ?? '',
                'avatar'   => $profile && $profile->profile_pic ? asset('storage/' . $profile->profile_pic) : 'https://i.pravatar.cc/150?u=' . $req->id
            ];
        });

        // 3. Leave Type Distribution (percentages)
        $leaveTypeCounts = EmployeeRequest::select('type', DB::raw('count(*) as count'))
            ->groupBy('type')
            ->get();
        $totalRequests = $leaveTypeCounts->sum('count');

        $distribution = [];
        $chartColors = ['bg-blue', 'bg-amber', 'bg-red', 'bg-emerald', 'bg-purple'];
        $idx = 0;
        foreach ($leaveTypeCounts as $ltc) {
            $percent = $totalRequests > 0 ? round(($ltc->count / $totalRequests) * 100) : 0;
            $label = ucfirst($ltc->type);
            $color = $chartColors[$idx % count($chartColors)];
            $distribution[] = [
                'label'   => "{$label} ({$percent}%)",
                'percent' => $percent,
                'color'   => $color,
            ];
            $idx++;
        }

        if (empty($distribution)) {
            $distribution = [
                ['label' => 'Annual (40%)', 'percent' => 40, 'color' => 'bg-blue'],
                ['label' => 'Sick (30%)', 'percent' => 30, 'color' => 'bg-amber'],
                ['label' => 'Emergency (20%)', 'percent' => 20, 'color' => 'bg-red'],
                ['label' => 'Other (10%)', 'percent' => 10, 'color' => 'bg-emerald'],
            ];
        }

        // 4. Departmental Leave Impact
        $departments = Department::withCount('employees')->get();
        
        $impacts = [];
        foreach ($departments as $dept) {
            $totalEmployees = $dept->employees_count;
            if ($totalEmployees == 0) continue;

            $activeLeavesCount = EmployeeRequest::where('status', 'approved')
                ->whereHas('employeeProfile', function ($q) use ($dept) {
                    $q->where('department_id', $dept->id);
                })
                ->count();

            $percent = round(($activeLeavesCount / $totalEmployees) * 100);
            
            $impact = 'low';
            if ($percent > 20) {
                $impact = 'high';
            } elseif ($percent >= 10) {
                $impact = 'medium';
            }

            $impacts[] = [
                'name'    => "{$dept->name} Department",
                'percent' => $percent,
                'impact'  => $impact,
            ];
        }

        if (empty($impacts)) {
            $impacts = [
                ['name' => 'IT Department', 'percent' => 15, 'impact' => 'medium'],
                ['name' => 'Marketing Department', 'percent' => 8, 'impact' => 'low'],
                ['name' => 'HR Department', 'percent' => 25, 'impact' => 'high'],
            ];
        }

        // 5. Monthly trend comparison (grouped in PHP to be 100% database-agnostic)
        $allApproved = EmployeeRequest::where('status', 'approved')->get();
        $q1 = 0; $q2 = 0; $q3 = 0; $q4 = 0;
        foreach ($allApproved as $r) {
            $month = date('m', strtotime($r->created_at));
            if (in_array($month, ['01', '02', '03'])) $q1++;
            elseif (in_array($month, ['04', '05', '06'])) $q2++;
            elseif (in_array($month, ['07', '08', '09'])) $q3++;
            elseif (in_array($month, ['10', '11', '12'])) $q4++;
        }

        $max = max($q1, $q2, $q3, $q4, 1);
        $trends = [
            ['label' => 'Q1', 'percent' => round(($q1 / $max) * 100)],
            ['label' => 'Q2', 'percent' => round(($q2 / $max) * 100)],
            ['label' => 'Q3', 'percent' => round(($q3 / $max) * 100)],
            ['label' => 'Q4', 'percent' => round(($q4 / $max) * 100)],
        ];

        return $this->successResponse([
            'stats'            => $stats,
            'leave_requests'   => $leaveRequests,
            'distribution'     => $distribution,
            'department_impact' => $impacts,
            'trends'           => $trends,
        ], 'Dashboard analytics retrieved successfully.');
    }
    // --- SMART FEATURES: Attendance Sync helper method ---
    private function syncAttendanceRecords(EmployeeRequest $employeeRequest): void
    {
        $profile = $employeeRequest->employeeProfile;
        if (!$profile) return;

        $details = $employeeRequest->details;
        $startDate = $details['start_date'] ?? null;
        $duration = (int)($details['duration'] ?? 1);

        if ($startDate) {
            for ($i = 0; $i < $duration; $i++) {
                $currentDate = date('Y-m-d', strtotime($startDate . " + {$i} days"));
                
                // Create or update pre-approved attendance records to prevent lateness penalties or geofencing alerts
                \App\Models\AttendanceRecord::updateOrCreate(
                    [
                        'employee_profile_id' => $profile->id,
                        'date'                => $currentDate,
                    ],
                    [
                        'status'          => 'Approved Leave',
                        'check_in'        => null,
                        'check_out'       => null,
                        'hours_worked'    => 0,
                    ]
                );
            }
        }
    }
}
