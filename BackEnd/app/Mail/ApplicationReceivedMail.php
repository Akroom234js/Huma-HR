
<?php

namespace app\Mail;

use App\Models\Application;
use App\Models\JobPosting;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * إيميل تأكيد استلام الطلب
 * يُرسل بعد انتهاء تقييم الـ AI من EvaluateResumeJob
 */
class ApplicationReceivedMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly Application $application,
        public readonly JobPosting  $jobPosting
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: "Application Received — {$this->jobPosting->title}",
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-received',
            with: [
                'applicantName' => $this->application->full_name,
                'jobTitle'      => $this->jobPosting->title,
                'submittedAt'   => $this->application->submitted_at?->format('F j, Y') ?? now()->format('F j, Y'),
            ],
        );
    }
}
