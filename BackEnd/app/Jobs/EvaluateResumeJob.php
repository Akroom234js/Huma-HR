<?php

namespace App\Jobs;

use App\Models\Application;
use App\Models\JobPosting;
use App\Services\AIResumeEvaluationService;
use App\Services\ResumeParsingService;
use App\Mail\ApplicationReceivedMail;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;

/**
 * EvaluateResumeJob — تقييم السيرة الذاتية في الخلفية
 *
 * ليش Queue بدل direct call؟
 * ───────────────────────────
 * OpenAI بياخذ 3-15 ثانية للرد
 * لو استنينا بنفس الـ Request:
 *   - المتقدم بيستنى 15 ثانية ← تجربة سيئة
 *   - لو انقطع الاتصال → الطلب ضاع
 *   - لو OpenAI down → الـ API بترجع 500
 *
 * مع Queue:
 *   - المتقدم يحصل رده فوراً ✅
 *   - التقييم يصير في الخلفية ✅
 *   - لو فشل → يحاول تاني تلقائياً ✅
 */
class EvaluateResumeJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    // عدد مرات إعادة المحاولة لو فشل
    // لو OpenAI down مؤقتاً، بيحاول بعد 60 ث ثم 120 ث ثم 300 ث
    public int $tries = 3;
    public array $backoff = [60, 120, 300];

    // لو ما خلّص خلال دقيقتين → timeout
    public int $timeout = 120;

    public function __construct(
        private readonly int $applicationId,
        private readonly int $jobPostingId
    ) {}

    public function handle(
        ResumeParsingService      $parsingService,
        AIResumeEvaluationService $aiService
    ): void {
        $application = Application::find($this->applicationId);
        $jobPosting  = JobPosting::find($this->jobPostingId);

        // لو الطلب أو الوظيفة اتحذفوا قبل ما يشتغل الـ Job
        if (!$application || !$jobPosting) {
            Log::warning("EvaluateResumeJob: Application #{$this->applicationId} or JobPosting not found.");
            return;
        }

        // لو اتقيّم مسبقاً (ممكن لو نفس الـ Job اتشغّل مرتين)
        if ($application->evaluated_at !== null) {
            Log::info("EvaluateResumeJob: Application #{$this->applicationId} already evaluated.");
            return;
        }

        try {
            // ─── 1. استخراج النص ────────────────────────────────
            $resumeText = $parsingService->extractTextFromResume(
                $application->resume_path
            );

            if (empty(trim($resumeText))) {
                Log::warning("EvaluateResumeJob: Empty resume text for Application #{$this->applicationId}");
                $application->update([
                    'feedback'     => 'Could not extract text from resume. Manual review required.',
                    'evaluated_at' => now(),
                ]);
                return;
            }

            // ─── 2. تقييم الـ AI ─────────────────────────────────
            // ✅ overall_score جاهز من evaluateResume — مش نحسبه تاني
            $evaluation = $aiService->evaluateResume($resumeText, $jobPosting->description);
            $finalScore = $evaluation['overall_score'];

            // ─── 3. تحديث الطلب ─────────────────────────────────
            $application->update([
                'match_score'   => round($finalScore, 2),
                'ai_analysis'   => $evaluation,  // الـ cast في الموديل يعمل json_encode تلقائياً
                'feedback'      => $evaluation['recommendation'] ?? '',
                'evaluated_at'  => now(),
            ]);

            // ─── 4. تحريك الطلب للمرحلة المناسبة ───────────────
            $this->updateStatusByScore($application->fresh(), $finalScore);

            Log::info("EvaluateResumeJob: Done for Application #{$this->applicationId}. Score: {$finalScore}");

            // ─── 5. إيميل تأكيد للمتقدم ─────────────────────────
            try {
                Mail::to($application->email)
                    ->send(new ApplicationReceivedMail($application, $jobPosting));
            } catch (\Exception $mailEx) {
                // فشل الإيميل ما يوقف العملية
                Log::error("EvaluateResumeJob: Email failed for Application #{$this->applicationId}: " . $mailEx->getMessage());
            }

        } catch (\Exception $e) {
            Log::error("EvaluateResumeJob: Failed for Application #{$this->applicationId}: " . $e->getMessage());
            throw $e; // يرمي الـ Exception ليعيد المحاولة تلقائياً
        }
    }

    /**
     * لو فشلت كل المحاولات — سجّل وخلّي الطلب للمراجعة اليدوية
     */
    public function failed(\Throwable $exception): void
    {
        Log::critical("EvaluateResumeJob: All attempts failed for Application #{$this->applicationId}: " . $exception->getMessage());

        Application::where('id', $this->applicationId)->update([
            'feedback'     => 'AI evaluation failed. Manual review required.',
            'evaluated_at' => now(),
        ]);
    }

    /**
     * تحريك الطلب للمرحلة المناسبة بناءً على الـ Score
     * ✅ الـ AI لا يرفض أحد — Human-in-the-Loop
     */
    private function updateStatusByScore(Application $application, float $score): void
    {
        if ($score >= 80) {
            $application->update([
                'status'        => Application::STATUS_SHORTLISTED,
                'current_stage' => 'Shortlisted - Excellent Match',
                'reviewed_at'   => now(),
            ]);
        } elseif ($score >= 60) {
            $application->update([
                'status'        => Application::STATUS_REVIEWED,
                'current_stage' => 'Under Review - Good Match',
                'reviewed_at'   => now(),
            ]);
        } elseif ($score >= 40) {
            $application->update([
                'status'        => Application::STATUS_REVIEWED,
                'current_stage' => 'Under Review - Average Match',
                'reviewed_at'   => now(),
            ]);
        } else {
            $application->update([
                'status'        => Application::STATUS_REVIEWED,
                'current_stage' => 'Under Review - Low Match',
                'reviewed_at'   => now(),
            ]);
        }
    }
}
