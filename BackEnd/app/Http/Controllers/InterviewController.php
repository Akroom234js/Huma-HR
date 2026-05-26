<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Interview\RecordFeedbackRequest;
use App\Http\Requests\Interview\StoreInterviewRequest;
use App\Http\Resources\InterviewResource;
use App\Models\Application;
use App\Models\Interview;
use App\Services\InterviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class InterviewController extends Controller
{
    /**
     * Constructor
     */
    public function __construct(private InterviewService $interviewService) {}

    /**
     * عرض قائمة المقابلات
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $interviews = $this->interviewService->getScheduledInterviews();

            return response()->json([
                'status' => true,
                'message' => 'تم جلب المقابلات بنجاح.',
                'data' => InterviewResource::collection($interviews),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء جلب المقابلات.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * جدولة مقابلة جديدة
     */
    public function store(StoreInterviewRequest $request, Application $application): JsonResponse
    {
        try {
            $interview = $this->interviewService->scheduleInterview(
                $application,
                $request->validated()
            );

            $interview->load(['application', 'interviewer']);

            return response()->json([
                'status' => true,
                'message' => 'تم جدولة المقابلة بنجاح.',
                'data' => new InterviewResource($interview),
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error scheduling interview: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء جدولة المقابلة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * عرض مقابلة محددة
     */
    public function show(Interview $interview): JsonResponse
    {
        try {
            $interview->load(['application', 'interviewer']);

            return response()->json([
                'status' => true,
                'message' => 'تم جلب المقابلة بنجاح.',
                'data' => new InterviewResource($interview),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء جلب المقابلة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * تحديث مقابلة
     */
    public function update(StoreInterviewRequest $request, Interview $interview): JsonResponse
    {
        try {
            $interview = $this->interviewService->updateInterview(
                $interview,
                $request->validated()
            );

            $interview->load(['application', 'interviewer']);

            return response()->json([
                'status' => true,
                'message' => 'تم تحديث المقابلة بنجاح.',
                'data' => new InterviewResource($interview),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء تحديث المقابلة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * تسجيل ملاحظات وتقييم المقابلة
     */
    public function recordFeedback(RecordFeedbackRequest $request, Interview $interview): JsonResponse
    {
        try {
            $interview = $this->interviewService->recordInterviewFeedback(
                $interview,
                $request->validated()
            );

            $interview->load(['application', 'interviewer']);

            return response()->json([
                'status' => true,
                'message' => 'تم تسجيل ملاحظات المقابلة بنجاح.',
                'data' => new InterviewResource($interview),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء تسجيل الملاحظات.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * إلغاء مقابلة
     */
    public function cancel(Interview $interview): JsonResponse
    {
        try {
            $interview = $this->interviewService->cancelInterview($interview);

            $interview->load(['application', 'interviewer']);

            return response()->json([
                'status' => true,
                'message' => 'تم إلغاء المقابلة بنجاح.',
                'data' => new InterviewResource($interview),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء إلغاء المقابلة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * إعادة جدولة مقابلة
     */
    public function reschedule(StoreInterviewRequest $request, Interview $interview): JsonResponse
    {
        try {
            $interview = $this->interviewService->rescheduleInterview(
                $interview,
                $request->validated()
            );

            $interview->load(['application', 'interviewer']);

            return response()->json([
                'status' => true,
                'message' => 'تم إعادة جدولة المقابلة بنجاح.',
                'data' => new InterviewResource($interview),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء إعادة جدولة المقابلة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * حذف مقابلة
     */
    public function destroy(Interview $interview): JsonResponse
    {
        try {
            $this->interviewService->deleteInterview($interview);

            return response()->json([
                'status' => true,
                'message' => 'تم حذف المقابلة بنجاح.',
                'data' => null,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء حذف المقابلة.',
                'data' => null,
            ], 500);
        }
    }
}
