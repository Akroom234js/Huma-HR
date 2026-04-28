<?php

namespace App\Services;

use App\Models\Application;
use App\Models\JobPosting;
use App\Repositories\Interfaces\ApplicationRepositoryInterface;
use App\Repositories\Interfaces\AttachmentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Http\UploadedFile;

class ApplicationService
{
    private ResumeParsingService $resumeParsingService;
    private AIResumeEvaluationService $aiEvaluationService;

    /**
     * Constructor
     */
    public function __construct(
        private ApplicationRepositoryInterface $applicationRepository,
        private AttachmentRepositoryInterface $attachmentRepository,
        ResumeParsingService $resumeParsingService,
        AIResumeEvaluationService $aiEvaluationService
    ) {
        $this->resumeParsingService = $resumeParsingService;
        $this->aiEvaluationService = $aiEvaluationService;
    }

    /**
     * تقديم طلب لوظيفة مع التقييم الذكي
     */
    public function applyForJob(
        JobPosting $jobPosting,
        array $data,
        ?UploadedFile $resume = null,
        ?UploadedFile $coverLetter = null
    ): Application {
        // إضافة معرف الوظيفة
        $data['job_posting_id'] = $jobPosting->id;

        // إضافة معرف المستخدم الحالي إذا كان مسجلاً
        if (auth()->check()) {
            $data['user_id'] = auth()->id();
        }

        // تحديد المرحلة الأولى
        $data['current_stage'] = 'Application Received';
        $data['status'] = 'pending';
        $data['submitted_at'] = now();

        // تحميل الملفات إذا كانت موجودة
        if ($resume) {
            $data['resume_path'] = $resume->store('resumes', 'public');
        }

        if ($coverLetter) {
            $data['cover_letter_path'] = $coverLetter->store('cover_letters', 'public');
        }

        // إنشاء الطلب
        $application = $this->applicationRepository->create($data);

        // حفظ المرفقات إذا كانت موجودة
        if ($resume) {
            $this->attachmentRepository->create([
                'application_id' => $application->id,
                'file_name' => $resume->getClientOriginalName(),
                'file_path' => $data['resume_path'],
                'file_type' => $resume->getMimeType(),
                'file_size' => $resume->getSize(),
            ]);
        }

        if ($coverLetter) {
            $this->attachmentRepository->create([
                'application_id' => $application->id,
                'file_name' => $coverLetter->getClientOriginalName(),
                'file_path' => $data['cover_letter_path'],
                'file_type' => $coverLetter->getMimeType(),
                'file_size' => $coverLetter->getSize(),
            ]);
        }

        // تقييم السيرة الذاتية بذكاء
        if ($resume) {
            $this->evaluateAndScoreApplication($application, $jobPosting);
        }

        return $application;
    }

    /**
     * تقييم وحساب نقاط الطلب باستخدام AI والكلمات المفتاحية
     */
    private function evaluateAndScoreApplication(
        Application $application,
        JobPosting $jobPosting
    ): void {
        try {
            if (!$application->resume_path) {
                return;
            }

            // استخراج النص من السيرة الذاتية
            $resumeText = $this->resumeParsingService->extractTextFromResume($application->resume_path);

            if (empty($resumeText)) {
                return;
            }

            // استخراج الكلمات المفتاحية من السيرة الذاتية
            $resumeKeywords = $this->resumeParsingService->extractKeywords($resumeText);

            // استخراج الكلمات المفتاحية من الوصف الوظيفي
            $jobKeywords = $this->resumeParsingService->extractKeywords($jobPosting->description);

            // حساب نسبة المطابقة بناءً على الكلمات المفتاحية
            $keywordMatchScore = $this->resumeParsingService->calculateMatchScore(
                $resumeKeywords,
                array_keys($jobKeywords)
            );

            // محاولة التقييم باستخدام OpenAI
            $aiEvaluation = $this->aiEvaluationService->evaluateResume(
                $resumeText,
                $jobPosting->description,
                array_keys($jobKeywords)
            );

            // استخدام نتيجة OpenAI إذا نجحت
            if ($aiEvaluation['success'] ?? false) {
                $finalScore = $aiEvaluation['overall_score'];
                $evaluation = $aiEvaluation;
            } else {
                // استخدام التقييم السريع بناءً على الكلمات المفتاحية
                $finalScore = $keywordMatchScore;
                $evaluation = $this->aiEvaluationService->quickEvaluate(
                    $resumeKeywords,
                    array_keys($jobKeywords),
                    $keywordMatchScore
                );
            }

            // تحديث الطلب بنتائج التقييم
            $application->update([
                'match_score' => $finalScore,
                'ai_analysis' => json_encode($evaluation),
                'feedback' => $evaluation['recommendation'] ?? '',
            ]);

            // تحديث حالة الطلب بناءً على النقاط
            $this->updateApplicationStatusByScore($application, $finalScore);
        } catch (\Exception $e) {
            \Log::error('خطأ في تقييم السيرة الذاتية: ' . $e->getMessage());
        }
    }

    /**
     * تحديث حالة الطلب بناءً على النقاط
     */
    private function updateApplicationStatusByScore(Application $application, float $score): void
    {
        if ($score >= 80) {
            $this->updateApplicationStatus(
                $application,
                'shortlisted',
                'مرشح ممتاز - نقاط مطابقة عالية جداً',
                'Shortlisted - Excellent Match'
            );
        } elseif ($score >= 60) {
            $this->updateApplicationStatus(
                $application,
                'reviewed',
                'مرشح جيد - يستحق المراجعة',
                'Under Review'
            );
        } elseif ($score >= 40) {
            $this->updateApplicationStatus(
                $application,
                'reviewed',
                'مرشح متوسط - يحتاج تقييم إضافي',
                'Under Review - Needs Assessment'
            );
        } else {
            $this->updateApplicationStatus(
                $application,
                'rejected',
                'مرشح ضعيف - نقاط مطابقة منخفضة',
                'Rejected - Low Match'
            );
        }
    }

    /**
     * تحديث حالة الطلب
     */
    public function updateApplicationStatus(
        Application $application,
        string $status,
        ?string $feedback = null,
        ?string $currentStage = null
    ): Application {
        $data = [
            'status' => $status,
            'reviewed_at' => now(),
        ];

        if ($feedback) {
            $data['feedback'] = $feedback;
        }

        if ($currentStage) {
            $data['current_stage'] = $currentStage;
        }

        return $this->applicationRepository->update($application, $data);
    }

    /**
     * نقل الطلب إلى مرحلة المراجعة
     */
    public function moveToReview(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            'reviewed',
            currentStage: 'HR Review'
        );
    }

    /**
     * اختيار الطلب (Shortlist)
     */
    public function shortlistApplication(Application $application, ?string $feedback = null): Application
    {
        return $this->updateApplicationStatus(
            $application,
            'shortlisted',
            $feedback,
            'Shortlisted'
        );
    }

    /**
     * نقل الطلب إلى مرحلة المقابلة
     */
    public function moveToInterviewing(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            'interviewing',
            currentStage: 'Interview Scheduled'
        );
    }

    /**
     * نقل الطلب إلى مرحلة العرض
     */
    public function moveToOffered(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            'offered',
            currentStage: 'Offer Extended'
        );
    }

    /**
     * قبول الطلب (توظيف)
     */
    public function hireCandidate(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            'hired',
            currentStage: 'Hired'
        );
    }

    /**
     * رفض الطلب
     */
    public function rejectApplication(Application $application, ?string $feedback = null): Application
    {
        return $this->updateApplicationStatus(
            $application,
            'rejected',
            $feedback,
            'Rejected'
        );
    }

    /**
     * سحب الطلب
     */
    public function withdrawApplication(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            'withdrawn',
            currentStage: 'Withdrawn'
        );
    }

    /**
     * جلب طلب بمعرفه
     */
    public function getApplicationById(int $id): ?Application
    {
        return $this->applicationRepository->find($id);
    }

    /**
     * جلب طلبات وظيفة معينة
     */
    public function getApplicationsByJobPosting(JobPosting $jobPosting, array $filters = []): Collection
    {
        return $this->applicationRepository->getApplicationsByJobPosting($jobPosting, $filters);
    }

    /**
     * جلب الطلبات حسب الحالة
     */
    public function getApplicationsByStatus(string $status): Collection
    {
        return $this->applicationRepository->getApplicationsByStatus($status);
    }

    /**
     * جلب الطلبات المعلقة
     */
    public function getPendingApplications(): Collection
    {
        return $this->applicationRepository->getPendingApplications();
    }

    /**
     * جلب الطلبات المختارة
     */
    public function getShortlistedApplications(): Collection
    {
        return $this->applicationRepository->getShortlistedApplications();
    }

    /**
     * جلب الطلبات المعروضة
     */
    public function getOfferedApplications(): Collection
    {
        return $this->applicationRepository->getOfferedApplications();
    }

    /**
     * جلب الطلبات المرفوضة
     */
    public function getRejectedApplications(): Collection
    {
        return $this->applicationRepository->getRejectedApplications();
    }

    /**
     * البحث عن الطلبات
     */
    public function searchApplications(string $query): Collection
    {
        return $this->applicationRepository->search($query);
    }

    /**
     * حذف طلب
     */
    public function deleteApplication(Application $application): bool
    {
        // حذف المرفقات أولاً
        $this->attachmentRepository->deleteByApplication($application);

        // ثم حذف الطلب
        return $this->applicationRepository->delete($application);
    }

    /**
     * الحصول على إحصائيات الطلبات
     */
    public function getApplicationStats(JobPosting $jobPosting): array
    {
        $applications = $jobPosting->applications;

        return [
            'total' => $applications->count(),
            'pending' => $applications->where('status', 'pending')->count(),
            'reviewed' => $applications->where('status', 'reviewed')->count(),
            'shortlisted' => $applications->where('status', 'shortlisted')->count(),
            'interviewing' => $applications->where('status', 'interviewing')->count(),
            'offered' => $applications->where('status', 'offered')->count(),
            'hired' => $applications->where('status', 'hired')->count(),
            'rejected' => $applications->where('status', 'rejected')->count(),
            'average_match_score' => round($applications->avg('match_score') ?? 0, 2),
            'highest_match_score' => $applications->max('match_score') ?? 0,
            'lowest_match_score' => $applications->min('match_score') ?? 0,
        ];
    }
}
