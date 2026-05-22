<?php

namespace App\Services;

use App\Exceptions\DuplicateApplicationException;
use App\Exceptions\InvalidStatusTransitionException;
use App\Jobs\EvaluateResumeJob;
use App\Mail\ApplicationStatusChangedMail;
use App\Models\Application;
use App\Models\JobPosting;
use App\Services\ATS\ApplicationPipelineGuard;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Storage;

class ApplicationService
{
    public function __construct(
        private readonly ApplicationPipelineGuard $pipelineGuard,
    ) {}

    // =========================================================
    // تقديم طلب جديد
    // =========================================================

    public function applyForJob(
        JobPosting    $jobPosting,
        array         $data,
        ?UploadedFile $resume      = null,
        ?UploadedFile $coverLetter = null
    ): Application {

        // ─── 1. Duplicate Check ──────────────────────────────
        // ليش؟ نمنع نفس الشخص من التقديم مرتين على نفس الوظيفة
        // نستثني الحالات النهائية — لو اترفض يقدر يقدم مرة ثانية
        $existing = Application::where('job_posting_id', $jobPosting->id)
            ->where('email', $data['email'])
            ->whereNotIn('status', [
                Application::STATUS_REJECTED,
                Application::STATUS_WITHDRAWN,
                Application::STATUS_EXPIRED,
            ])
            ->first();

        if ($existing) {
            throw new DuplicateApplicationException(
                "You have already applied for this position. Your application status is: {$existing->status}."
            );
        }

        // ─── 2. تحضير البيانات ───────────────────────────────
        $data['job_posting_id'] = $jobPosting->id;
        $data['status']         = Application::STATUS_PENDING;
        $data['current_stage']  = 'Application Received';
        $data['submitted_at']   = now();

        // ─── 3. رفع الملفات (خارج الـ transaction) ──────────
        // ليش خارج الـ transaction؟
        // عمليات الـ I/O (رفع الملفات) بطيئة
        // لو حطيناها داخل transaction بيبقى الـ DB connection مفتوح وقت طويل
        // وهاد بيسبب مشاكل في الـ performance
        if ($resume) {
            // ✅ 'local' disk = storage/app/private — آمن ومش متاح للعموم
            $data['resume_path'] = $resume->store('resumes', 'local');
        }

        if ($coverLetter) {
            $data['cover_letter_path'] = $coverLetter->store('cover_letters', 'local');
        }

        // ─── 4. حفظ الطلب والمرفقات في transaction ──────────
        $application = DB::transaction(function () use ($data, $resume, $coverLetter) {
            $application = Application::create($data);

            // حفظ مرفق السيرة الذاتية
            if ($resume && isset($data['resume_path'])) {
                $application->attachments()->create([
                    'file_url'    => $data['resume_path'],
                    'file_name'   => $resume->getClientOriginalName(),
                    'file_type'   => 'resume',
                    'file_size'   => $resume->getSize(),
                    'uploaded_at' => now(),
                ]);
            }

            // حفظ مرفق خطاب التغطية
            if ($coverLetter && isset($data['cover_letter_path'])) {
                $application->attachments()->create([
                    'file_url'    => $data['cover_letter_path'],
                    'file_name'   => $coverLetter->getClientOriginalName(),
                    'file_type'   => 'cover_letter',
                    'file_size'   => $coverLetter->getSize(),
                    'uploaded_at' => now(),
                ]);
            }

            return $application;
        });

        // ─── 5. إرسال التقييم للـ Queue ──────────────────────
        // ✅ الطلب بيرجع فوراً للمتقدم
        // التقييم يصير في الخلفية بشكل مستقل عن الـ HTTP Request
        if ($resume) {
            EvaluateResumeJob::dispatch($application->id, $jobPosting->id)
                ->onQueue('ai-evaluation');
        }

        return $application;
    }

    // =========================================================
    // تحديث حالة الطلب — كل تغيير يمر من هنا
    // =========================================================

    public function updateApplicationStatus(
        Application $application,
        string      $newStatus,
        ?string     $feedback     = null,
        ?string     $currentStage = null
    ): Application {

        // ✅ Pipeline Guard — يمنع الانتقال غير المسموح
        $this->pipelineGuard->assertCanTransition($application, $newStatus);

        $updateData = [
            'status'      => $newStatus,
            'reviewed_at' => now(),
        ];

        if ($feedback !== null) {
            $updateData['feedback'] = $feedback;
        }

        if ($currentStage !== null) {
            $updateData['current_stage'] = $currentStage;
        }

        $application->update($updateData);
        $application->refresh();

        // ✅ إشعار المتقدم بتغيير الحالة
        $this->notifyApplicant($application);

        return $application;
    }

    /**
     * إرسال إيميل للمتقدم عند تغيير الحالة
     * فقط للحالات اللي المتقدم يحتاج يعرفها
     */
    private function notifyApplicant(Application $application): void
    {
        $notifiableStatuses = [
            Application::STATUS_SHORTLISTED,
            Application::STATUS_INTERVIEWING,
            Application::STATUS_OFFERED,
            Application::STATUS_HIRED,
            Application::STATUS_REJECTED,
        ];

        if (!in_array($application->status, $notifiableStatuses)) {
            return;
        }

        try {
            Mail::to($application->email)
                ->send(new ApplicationStatusChangedMail($application));
        } catch (\Exception $e) {
            // فشل الإيميل ما يوقف العملية الرئيسية
            Log::error("ApplicationService: Email failed for Application #{$application->id}: " . $e->getMessage());
        }
    }

    // =========================================================
    // Action Methods — كل زر في الـ UI له دالة
    // =========================================================

    public function moveToReview(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            Application::STATUS_REVIEWED,
            currentStage: 'HR Review'
        );
    }

    public function shortlistApplication(Application $application, ?string $feedback = null): Application
    {
        return $this->updateApplicationStatus(
            $application,
            Application::STATUS_SHORTLISTED,
            $feedback ?? 'Selected for further consideration.',
            'Shortlisted'
        );
    }

    public function moveToInterviewing(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            Application::STATUS_INTERVIEWING,
            currentStage: 'Interview Scheduled'
        );
    }

    public function moveToOffered(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            Application::STATUS_OFFERED,
            currentStage: 'Offer Extended'
        );
    }

    public function hireCandidate(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            Application::STATUS_HIRED,
            currentStage: 'Hired'
        );
    }

    public function rejectApplication(Application $application, ?string $feedback = null): Application
    {
        return $this->updateApplicationStatus(
            $application,
            Application::STATUS_REJECTED,
            $feedback ?? 'Thank you for your interest. We have decided to move forward with other candidates.',
            'Rejected'
        );
    }

    public function withdrawApplication(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            Application::STATUS_WITHDRAWN,
            currentStage: 'Withdrawn by Applicant'
        );
    }

    public function expireOffer(Application $application): Application
    {
        return $this->updateApplicationStatus(
            $application,
            Application::STATUS_EXPIRED,
            'Offer expired — no response received.',
            'Offer Expired'
        );
    }

    // =========================================================
    // تحميل السيرة الذاتية بشكل آمن
    // =========================================================

    /**
     * ✅ تحميل آمن — ما نعطي URL مباشر
     * الملف على 'local' disk (private) — ما يتوصل بـ URL
     * لازم يمر من هاد الـ method
     */
    public function downloadResume(Application $application): \Symfony\Component\HttpFoundation\StreamedResponse
    {
        return Storage::disk('local')->download(
            $application->resume_path,
            $application->full_name . '_resume.pdf'
        );
    }

    // =========================================================
    // إحصائيات الوظيفة
    // =========================================================

    public function getJobStats(JobPosting $jobPosting): array
    {
        return $this->getGlobalOrJobStats($jobPosting->id);
    }

    /**
     * جلب إحصائيات التقديمات بشكل مجمع (عالمي أو لوظيفة معينة)
     */
    public function getGlobalOrJobStats(?int $jobPostingId = null): array
    {
        $query = Application::query();
        if ($jobPostingId !== null) {
            $query->where('job_posting_id', $jobPostingId);
        }

        $stats = $query->selectRaw('
                COUNT(*) as total,
                SUM(status = "pending") as pending,
                SUM(status = "reviewed") as reviewed,
                SUM(status = "shortlisted") as shortlisted,
                SUM(status = "interviewing") as interviewing,
                SUM(status = "offered") as offered,
                SUM(status = "hired") as hired,
                SUM(status = "rejected") as rejected,
                AVG(match_score) as avg_score,
                MAX(match_score) as max_score
            ')
            ->first();

        return [
            'total'       => (int) $stats->total,
            'pending'     => (int) $stats->pending,
            'reviewed'    => (int) $stats->reviewed,
            'shortlisted' => (int) $stats->shortlisted,
            'interviewing'=> (int) $stats->interviewing,
            'offered'     => (int) $stats->offered,
            'hired'       => (int) $stats->hired,
            'rejected'    => (int) $stats->rejected,
            'avg_score'   => round((float) ($stats->avg_score ?? 0), 2),
            'max_score'   => (float) ($stats->max_score ?? 0),
        ];
    }
}
