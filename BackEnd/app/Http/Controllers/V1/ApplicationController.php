<?php

namespace App\Http\Controllers\V1;

use App\Http\Controllers\Controller;
use App\Http\Requests\Application\StoreApplicationRequest;
use App\Http\Requests\Application\UpdateApplicationStatusRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\JobPosting;
use App\Services\ApplicationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    /**
     * Constructor
     */
    public function __construct(private ApplicationService $applicationService) {}

    /**
     * عرض قائمة الطلبات
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['status', 'job_posting_id', 'user_id', 'search']);
            $applications = $this->applicationService->getApplicationsByJobPosting(
                JobPosting::find($filters['job_posting_id'] ?? 0) ?? new JobPosting(),
                $filters
            );

            return response()->json([
                'status' => true,
                'message' => 'تم جلب الطلبات بنجاح.',
                'data' => ApplicationResource::collection($applications),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء جلب الطلبات.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * تقديم طلب لوظيفة
     */
    public function store(StoreApplicationRequest $request, JobPosting $jobPosting): JsonResponse
    {
        try {
            $application = $this->applicationService->applyForJob(
                $jobPosting,
                $request->only(['full_name', 'email', 'phone']),
                $request->file('resume'),
                $request->file('cover_letter')
            );

            return response()->json([
                'status' => true,
                'message' => 'تم تقديم الطلب بنجاح.',
                'data' => new ApplicationResource($application),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء تقديم الطلب.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * عرض طلب محدد
     */
    public function show(Application $application): JsonResponse
    {
        try {
            $application->load(['jobPosting', 'interviews', 'offer']);

            return response()->json([
                'status' => true,
                'message' => 'تم جلب الطلب بنجاح.',
                'data' => new ApplicationResource($application),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء جلب الطلب.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * تحديث حالة الطلب
     */
    public function updateStatus(UpdateApplicationStatusRequest $request, Application $application): JsonResponse
    {
        try {
            $application = $this->applicationService->updateApplicationStatus(
                $application,
                $request->input('status'),
                $request->input('feedback'),
                $request->input('current_stage')
            );

            return response()->json([
                'status' => true,
                'message' => 'تم تحديث حالة الطلب بنجاح.',
                'data' => new ApplicationResource($application),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء تحديث حالة الطلب.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * نقل الطلب إلى مرحلة المراجعة
     */
    public function moveToReview(Application $application): JsonResponse
    {
        try {
            $application = $this->applicationService->moveToReview($application);

            return response()->json([
                'status' => true,
                'message' => 'تم نقل الطلب إلى مرحلة المراجعة بنجاح.',
                'data' => new ApplicationResource($application),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء نقل الطلب.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * اختيار الطلب (Shortlist)
     */
    public function shortlist(Request $request, Application $application): JsonResponse
    {
        try {
            $application = $this->applicationService->shortlistApplication(
                $application,
                $request->input('feedback')
            );

            return response()->json([
                'status' => true,
                'message' => 'تم اختيار الطلب بنجاح.',
                'data' => new ApplicationResource($application),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء اختيار الطلب.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * رفض الطلب
     */
    public function reject(Request $request, Application $application): JsonResponse
    {
        try {
            $application = $this->applicationService->rejectApplication(
                $application,
                $request->input('feedback')
            );

            return response()->json([
                'status' => true,
                'message' => 'تم رفض الطلب بنجاح.',
                'data' => new ApplicationResource($application),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء رفض الطلب.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * حذف طلب
     */
    public function destroy(Application $application): JsonResponse
    {
        try {
            $this->applicationService->deleteApplication($application);

            return response()->json([
                'status' => true,
                'message' => 'تم حذف الطلب بنجاح.',
                'data' => null,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء حذف الطلب.',
                'data' => null,
            ], 500);
        }
    }
}
