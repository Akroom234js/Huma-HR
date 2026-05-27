<?php

namespace App\Http\Controllers;

use App\Models\Recognition;
use App\Models\EmployeeProfile;
use App\Models\HrNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class RecognitionController extends Controller
{
    use ApiResponse;

    // GET /api/employee/recognitions
    public function index(): JsonResponse
    {
        $profile = Auth::user()->employeeProfile;
        if (!$profile) {
            return $this->errorResponse('Employee profile not found.', 404);
        }

        $received = Recognition::with(['sender', 'recipient'])
            ->where('recipient_id', $profile->id)
            ->orderBy('created_at', 'desc')
            ->get();

        $public = Recognition::with(['sender', 'recipient'])
            ->where('is_public', true)
            ->where('recipient_id', '!=', $profile->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return $this->successResponse([
            'received' => $received,
            'public' => $public
        ], 'Recognitions retrieved successfully.');
    }

    // POST /api/employee/recognitions
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'recipient_id' => 'required|exists:employee_profiles,id',
            'message' => 'required|string',
            'badge_type' => 'nullable|string|in:rockstar,teamplayer,innovator,leader,creative',
            'is_public' => 'boolean',
        ]);

        $senderProfile = Auth::user()->employeeProfile;
        if (!$senderProfile) {
            return $this->errorResponse('Employee profile not found.', 404);
        }

        if ($senderProfile->id == $request->recipient_id) {
            return $this->errorResponse('You cannot recognize yourself.', 400);
        }

        $recognition = Recognition::create([
            'recipient_id' => $request->recipient_id,
            'sender_id' => $senderProfile->id,
            'message' => $request->message,
            'badge_type' => $request->badge_type,
            'is_public' => $request->input('is_public', true),
        ]);

        // Send Notification
        $recipientProfile = EmployeeProfile::find($request->recipient_id);
        if ($recipientProfile && $recipientProfile->user_id) {
            HrNotification::create([
                'user_id' => $recipientProfile->user_id,
                'type' => 'recognition_received',
                'title' => 'New Recognition Received!',
                'body' => "{$senderProfile->full_name} recognized you: \"{$request->message}\"",
                'data' => json_encode(['recognition_id' => $recognition->id]),
            ]);
        }

        return $this->successResponse($recognition->load(['sender', 'recipient']), 'Recognition sent successfully.', 201);
    }
}
