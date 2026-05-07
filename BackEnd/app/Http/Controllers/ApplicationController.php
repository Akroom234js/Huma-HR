<?php

namespace App\Http\Controllers;

use App\Exceptions\DuplicateApplicationException;
use App\Exceptions\InvalidStatusTransitionException;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreApplicationRequest;
use App\Http\Requests\UpdateApplicationStatusRequest;
use App\Http\Resources\ApplicationResource;
use App\Models\Application;
use App\Models\JobPosting;
use App\Services\ApplicationService;
use App\Services\ATS\ApplicationPipelineGuard;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    use ApiResponse;

    public function __construct(
        private readonly ApplicationService       $applicationService,
        private readonly ApplicationPipelineGuard $pipelineGuard,
    ) {}

    // ── GET /api/applications ─────────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr|manager
    public function index(Request $request): JsonResponse
    {
        $applications = Application::with(['jobPosting', 'attachments'])
            ->when($request->filled('status'),
                fn($q) => $q->byStatus($request->status)
            )
            ->when($request->filled('job_posting_id'),
                fn($q) => $q->forJobPosting((int) $request->job_posting_id)
            )
            ->when($request->filled('search'),
                fn($q) => $q->where(function ($q) use ($request) {
                    $q->where('full_name', 'like', "%{$request->search}%")
                      ->orWhere('email', 'like', "%{$request->search}%");
                })
            )
            ->latest('submitted_at')
            ->paginate($request->get('per_page', 15));

        return $this->successResponse(
            data: [
                'applications' => ApplicationResource::collection($applications)->resolve(),
                'pagination'   => [
                    'total'        => $applications->total(),
                    'per_page'     => $applications->perPage(),
                    'current_page' => $applications->currentPage(),
                    'last_page'    => $applications->lastPage(),
                ],
            ],
            message: 'Applications retrieved successfully.'
        );
    }

    // ── GET /api/applications/{id} ────────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr|manager
    public function show(int $id): JsonResponse
    {
        $application = Application::with(['jobPosting', 'attachments', 'interviews'])
            ->find($id);

        if (!$application) {
            return $this->errorResponse(message: 'Application not found.', statusCode: 404);
        }

        return $this->successResponse(
            data: new ApplicationResource($application),
            message: 'Application retrieved successfully.'
        );
    }

    // ── POST /api/job-postings/{jobPosting}/apply ─────────────────────────────
    // Public — بدون Auth (متقدمون خارجيون)
    public function store(StoreApplicationRequest $request, int $jobPostingId): JsonResponse
    {
        $jobPosting = JobPosting::find($jobPostingId);

        if (!$jobPosting) {
            return $this->errorResponse(message: 'Job posting not found.', statusCode: 404);
        }

        // ✅ التحقق إن الوظيفة لا تزال تقبل طلبات
        if (!$jobPosting->is_active) {
            return $this->errorResponse(
                message: 'This job posting is no longer accepting applications.',
                statusCode: 422
            );
        }

        try {
            $application = $this->applicationService->applyForJob(
                $jobPosting,
                $request->only(['full_name', 'email', 'phone']),
                $request->file('resume'),
                $request->file('cover_letter')
            );

            return $this->successResponse(
                data: new ApplicationResource($application),
                message: 'Your application has been submitted successfully. You will receive a confirmation email shortly.',
                statusCode: 201
            );

        } catch (DuplicateApplicationException $e) {
            return $this->errorResponse(message: $e->getMessage(), statusCode: 422);

        } catch (\Exception $e) {
            return $this->errorResponse(
                message: 'Failed to submit application. Please try again.',
                statusCode: 500
            );
        }
    }

    // ── PATCH /api/applications/{id}/status ───────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function updateStatus(UpdateApplicationStatusRequest $request, int $id): JsonResponse
    {
        $application = Application::find($id);

        if (!$application) {
            return $this->errorResponse(message: 'Application not found.', statusCode: 404);
        }

        try {
            $updated = $this->applicationService->updateApplicationStatus(
                $application,
                $request->input('status'),
                $request->input('feedback'),
                $request->input('current_stage')
            );

            return $this->successResponse(
                data: new ApplicationResource($updated),
                message: 'Application status updated successfully.'
            );

        } catch (InvalidStatusTransitionException $e) {
            return $this->errorResponse(message: $e->getMessage(), statusCode: 422);

        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Failed to update status.', statusCode: 500);
        }
    }

    // ── Action Endpoints ──────────────────────────────────────────────────────
    // كل زر في الـ UI له endpoint خاص — أوضح من PATCH /status عام

    // PATCH /api/applications/{id}/review
    public function review(int $id): JsonResponse
    {
        return $this->handleAction($id, fn($app) =>
            $this->applicationService->moveToReview($app),
            'Application moved to review.'
        );
    }

    // PATCH /api/applications/{id}/shortlist
    public function shortlist(Request $request, int $id): JsonResponse
    {
        return $this->handleAction($id, fn($app) =>
            $this->applicationService->shortlistApplication($app, $request->input('feedback')),
            'Application shortlisted successfully.'
        );
    }

    // PATCH /api/applications/{id}/interview
    public function interview(int $id): JsonResponse
    {
        return $this->handleAction($id, fn($app) =>
            $this->applicationService->moveToInterviewing($app),
            'Application moved to interviewing.'
        );
    }

    // PATCH /api/applications/{id}/offer
    public function offer(int $id): JsonResponse
    {
        return $this->handleAction($id, fn($app) =>
            $this->applicationService->moveToOffered($app),
            'Offer extended successfully.'
        );
    }

    // PATCH /api/applications/{id}/hire
    public function hire(int $id): JsonResponse
    {
        return $this->handleAction($id, fn($app) =>
            $this->applicationService->hireCandidate($app),
            'Candidate hired successfully.'
        );
    }

    // PATCH /api/applications/{id}/reject
    public function reject(Request $request, int $id): JsonResponse
    {
        return $this->handleAction($id, fn($app) =>
            $this->applicationService->rejectApplication($app, $request->input('feedback')),
            'Application rejected.'
        );
    }

    // PATCH /api/applications/{id}/withdraw
    public function withdraw(int $id): JsonResponse
    {
        return $this->handleAction($id, fn($app) =>
            $this->applicationService->withdrawApplication($app),
            'Application withdrawn.'
        );
    }

    // ── GET /api/applications/{id}/allowed-transitions ───────────────────────
    // Middleware: auth:sanctum + role:hr|manager
    // يرجع الأزرار المسموحة للـ Frontend
    public function allowedTransitions(int $id): JsonResponse
    {
        $application = Application::find($id);

        if (!$application) {
            return $this->errorResponse(message: 'Application not found.', statusCode: 404);
        }

        return $this->successResponse(
            data: [
                'current_status'      => $application->status,
                'current_stage'       => $application->current_stage,
                'allowed_transitions' => $this->pipelineGuard->getAllowedTransitions($application->status),
                'is_final'            => $this->pipelineGuard->isFinalStatus($application->status),
            ],
            message: 'Allowed transitions retrieved.'
        );
    }

    // ── GET /api/job-postings/{id}/stats ──────────────────────────────────────
    // Middleware: auth:sanctum + role:hr|manager
    public function stats(int $jobPostingId): JsonResponse
    {
        $jobPosting = JobPosting::find($jobPostingId);

        if (!$jobPosting) {
            return $this->errorResponse(message: 'Job posting not found.', statusCode: 404);
        }

        return $this->successResponse(
            data: $this->applicationService->getJobStats($jobPosting),
            message: 'Stats retrieved successfully.'
        );
    }

    // ── DELETE /api/applications/{id} ─────────────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    public function destroy(int $id): JsonResponse
    {
        $application = Application::find($id);

        if (!$application) {
            return $this->errorResponse(message: 'Application not found.', statusCode: 404);
        }

        // ✅ Soft Delete — البيانات بتبقى في DB
        $application->delete();

        return $this->successResponse(message: 'Application deleted successfully.');
    }

    // ── GET /api/applications/{id}/resume ─────────────────────────────────────
    // Middleware: auth:sanctum + role:hr
    // تحميل السيرة الذاتية بشكل آمن
    public function downloadResume(int $id): mixed
    {
        $application = Application::find($id);

        if (!$application || !$application->resume_path) {
            return $this->errorResponse(message: 'Resume not found.', statusCode: 404);
        }

        return $this->applicationService->downloadResume($application);
    }

    // =========================================================
    // Private Helper — يقلص تكرار try/catch في كل Action
    // =========================================================
    private function handleAction(int $id, callable $action, string $successMessage): JsonResponse
    {
        $application = Application::find($id);

        if (!$application) {
            return $this->errorResponse(message: 'Application not found.', statusCode: 404);
        }

        try {
            $updated = $action($application);

            return $this->successResponse(
                data: new ApplicationResource($updated),
                message: $successMessage
            );

        } catch (InvalidStatusTransitionException $e) {
            return $this->errorResponse(message: $e->getMessage(), statusCode: 422);

        } catch (\Exception $e) {
            return $this->errorResponse(message: 'Operation failed. Please try again.', statusCode: 500);
        }
    }
}
