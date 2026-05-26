<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\JobPosting\StoreJobPostingRequest;
use App\Http\Requests\JobPosting\UpdateJobPostingRequest;
use App\Http\Resources\JobPostingResource;
use App\Models\JobPosting;
use App\Services\JobPostingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class JobPostingController extends Controller
{
    /**
     * Constructor
     */
    public function __construct(private JobPostingService $jobPostingService) {}

    /**
     * عرض قائمة الوظائف
     */
    public function index(Request $request): JsonResponse
    {
        try {
            $filters = $request->only(['status', 'department_id', 'experience_level', 'employment_type', 'search']);
            $orderBy = [];

            if ($request->has('sort_by')) {
                $orderBy[$request->input('sort_by')] = $request->input('sort_order', 'desc');
            }

            $jobPostings = $this->jobPostingService->getAllJobPostings($filters, $orderBy);

            return response()->json([
                'status' => true,
                'message' => 'تم جلب الوظائف بنجاح.',
                'data' => JobPostingResource::collection($jobPostings),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء جلب الوظائف.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * إنشاء وظيفة جديدة
     */
    public function store(StoreJobPostingRequest $request): JsonResponse
    {
        try {
            $jobPosting = $this->jobPostingService->createJobPosting($request->validated());

            return response()->json([
                'status' => true,
                'message' => 'تم إنشاء الوظيفة بنجاح.',
                'data' => new JobPostingResource($jobPosting),
            ], 201);
        } catch (\Exception $e) {
            \Illuminate\Support\Facades\Log::error('Error creating job: ' . $e->getMessage(), [
                'exception' => $e,
                'trace' => $e->getTraceAsString()
            ]);
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء إنشاء الوظيفة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * عرض وظيفة محددة
     */
    public function show(JobPosting $jobPosting): JsonResponse
    {
        try {
            return response()->json([
                'status' => true,
                'message' => 'تم جلب الوظيفة بنجاح.',
                'data' => new JobPostingResource($jobPosting),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء جلب الوظيفة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * تحديث وظيفة
     */
    public function update(UpdateJobPostingRequest $request, JobPosting $jobPosting): JsonResponse
    {
        try {
            $jobPosting = $this->jobPostingService->updateJobPosting($jobPosting, $request->validated());

            return response()->json([
                'status' => true,
                'message' => 'تم تحديث الوظيفة بنجاح.',
                'data' => new JobPostingResource($jobPosting),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء تحديث الوظيفة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * نشر وظيفة
     */
    public function publish(JobPosting $jobPosting): JsonResponse
    {
        try {
            $jobPosting = $this->jobPostingService->publishJobPosting($jobPosting);

            return response()->json([
                'status' => true,
                'message' => 'تم نشر الوظيفة بنجاح.',
                'data' => new JobPostingResource($jobPosting),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء نشر الوظيفة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * إغلاق وظيفة
     */
    public function close(JobPosting $jobPosting): JsonResponse
    {
        try {
            $jobPosting = $this->jobPostingService->closeJobPosting($jobPosting);

            return response()->json([
                'status' => true,
                'message' => 'تم إغلاق الوظيفة بنجاح.',
                'data' => new JobPostingResource($jobPosting),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء إغلاق الوظيفة.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * حذف وظيفة
     */
    public function destroy(JobPosting $jobPosting): JsonResponse
    {
        try {
            $this->jobPostingService->deleteJobPosting($jobPosting);

            return response()->json([
                'status' => true,
                'message' => 'تم حذف الوظيفة بنجاح.',
                'data' => null,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء حذف الوظيفة.',
                'data' => null,
            ], 500);
        }
    }
}
