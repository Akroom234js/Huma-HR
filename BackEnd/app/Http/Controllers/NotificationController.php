<?php

namespace App\Http\Controllers;

use App\Models\HrNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    use ApiResponse;

    // GET /api/employee/notifications
    public function index(): JsonResponse
    {
        $notifications = HrNotification::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse($notifications, 'Notifications retrieved successfully.');
    }

    // GET /api/employee/notifications/unread-count
    public function unreadCount(): JsonResponse
    {
        $count = HrNotification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->count();

        return $this->successResponse(['unread_count' => $count], 'Unread notifications count retrieved.');
    }

    // POST /api/employee/notifications/{id}/read
    public function markRead(int $id): JsonResponse
    {
        $notification = HrNotification::where('user_id', Auth::id())->find($id);

        if (!$notification) {
            return $this->errorResponse('Notification not found or access denied.', 404);
        }

        $notification->update(['read_at' => now()]);

        return $this->successResponse($notification, 'Notification marked as read.');
    }

    // POST /api/employee/notifications/read-all
    public function markAllRead(): JsonResponse
    {
        $updated = HrNotification::where('user_id', Auth::id())
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        return $this->successResponse(['updated_count' => $updated], 'All notifications marked as read.');
    }
}
