<?php

namespace App\Http\Controllers;

use App\Models\Conversation;
use App\Models\Message;
use App\Models\User;
use App\Models\EmployeeProfile;
use App\Models\HrNotification;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ChatController extends Controller
{
    use ApiResponse;

    // GET /api/employee/chats
    public function getConversations(): JsonResponse
    {
        $userId = Auth::id();

        $conversations = Conversation::with([
                'participantOne.employeeProfile',
                'participantTwo.employeeProfile',
                'messages' => function ($q) {
                    $q->orderBy('created_at', 'desc');
                }
            ])
            ->where('participant_one_id', $userId)
            ->orWhere('participant_two_id', $userId)
            ->orderBy('last_message_at', 'desc')
            ->get();

        $formatted = $conversations->map(function ($convo) use ($userId) {
            $otherUser = $convo->otherParticipant($userId);
            $otherProfile = $otherUser ? $otherUser->employeeProfile : null;
            $latestMsg = $convo->messages->first();

            return [
                'id' => $convo->id,
                'other_participant' => [
                    'id' => $otherUser ? $otherUser->id : null,
                    'full_name' => $otherProfile ? $otherProfile->full_name : 'System User',
                    'job_title' => $otherProfile ? $otherProfile->job_title : '',
                    'profile_pic' => $otherProfile ? $otherProfile->profile_pic : null,
                ],
                'last_message' => $latestMsg ? [
                    'body' => $latestMsg->body,
                    'created_at' => $latestMsg->created_at,
                    'sender_id' => $latestMsg->sender_id,
                ] : null,
                'unread_count' => $convo->unreadCountFor($userId),
                'last_message_at' => $convo->last_message_at,
            ];
        });

        return $this->successResponse($formatted, 'Conversations retrieved successfully.');
    }

    // GET /api/employee/chats/{id}/messages
    public function getMessages(int $id): JsonResponse
    {
        $userId = Auth::id();
        $conversation = Conversation::where(function ($q) use ($userId) {
                $q->where('participant_one_id', $userId)
                  ->orWhere('participant_two_id', $userId);
            })
            ->find($id);

        if (!$conversation) {
            return $this->errorResponse('Conversation not found or access denied.', 403);
        }

        // Mark messages as read
        Message::where('conversation_id', $id)
            ->where('sender_id', '!=', $userId)
            ->whereNull('read_at')
            ->update(['read_at' => now()]);

        $messages = Message::where('conversation_id', $id)
            ->orderBy('created_at', 'asc')
            ->get();

        return $this->successResponse($messages, 'Messages retrieved successfully.');
    }

    // POST /api/employee/chats/send
    public function sendMessage(Request $request): JsonResponse
    {
        $request->validate([
            'body' => 'required|string',
            'recipient_id' => 'nullable|exists:users,id',
            'conversation_id' => 'nullable|exists:conversations,id',
        ]);

        $userId = Auth::id();
        $convoId = $request->conversation_id;
        $recipientId = $request->recipient_id;

        if (!$convoId && !$recipientId) {
            return $this->errorResponse('Either conversation_id or recipient_id must be provided.', 400);
        }

        if ($recipientId == $userId) {
            return $this->errorResponse('You cannot chat with yourself.', 400);
        }

        $conversation = null;

        if ($convoId) {
            $conversation = Conversation::where(function ($q) use ($userId) {
                    $q->where('participant_one_id', $userId)
                      ->orWhere('participant_two_id', $userId);
                })
                ->find($convoId);

            if (!$conversation) {
                return $this->errorResponse('Conversation not found or access denied.', 403);
            }
        } else {
            // Find or create conversation
            $one = min($userId, $recipientId);
            $two = max($userId, $recipientId);

            $conversation = Conversation::where('participant_one_id', $one)
                ->where('participant_two_id', $two)
                ->first();

            if (!$conversation) {
                $conversation = Conversation::create([
                    'participant_one_id' => $one,
                    'participant_two_id' => $two,
                    'last_message_at' => now(),
                ]);
            }
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $userId,
            'body' => $request->body,
        ]);

        $conversation->update(['last_message_at' => now()]);

        // Send HrNotification to the recipient
        $recipientUser = $conversation->otherParticipant($userId);
        if ($recipientUser) {
            $senderProfile = Auth::user()->employeeProfile;
            $senderName = $senderProfile ? $senderProfile->full_name : 'A Colleague';
            
            HrNotification::create([
                'user_id' => $recipientUser->id,
                'type' => 'chat_message',
                'title' => "New Message from {$senderName}",
                'body' => mb_strlen($request->body, 'UTF-8') > 60 ? mb_substr($request->body, 0, 57, 'UTF-8') . '...' : $request->body,
                'data' => json_encode([
                    'conversation_id' => $conversation->id,
                    'message_id' => $message->id
                ]),
            ]);
        }

        return $this->successResponse($message, 'Message sent successfully.', 201);
    }

    // GET /api/employee/chats/contacts
    public function getContacts(): JsonResponse
    {
        $userId = Auth::id();

        // Get all other active employees who have a user account
        $contacts = EmployeeProfile::with('user')
            ->whereHas('user', function ($q) use ($userId) {
                $q->where('id', '!=', $userId)
                  ->where('account_status', 'active');
            })
            ->where('employment_status', 'active')
            ->get()
            ->map(function ($profile) {
                return [
                    'user_id' => $profile->user_id,
                    'profile_id' => $profile->id,
                    'full_name' => $profile->full_name,
                    'job_title' => $profile->job_title,
                    'profile_pic' => $profile->profile_pic,
                ];
            });

        return $this->successResponse($contacts, 'Contacts retrieved successfully.');
    }
}
