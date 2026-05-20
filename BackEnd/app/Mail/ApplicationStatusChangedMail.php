<?php

namespace App\Mail;

use App\Models\Application;
use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

/**
 * إيميل تغيير حالة الطلب
 * يُرسل عند: shortlisted, interviewing, offered, hired, rejected
 * لا يُرسل عند: pending, reviewed (المتقدم ما يحتاج يعرف)
 */
class ApplicationStatusChangedMail extends Mailable
{
    use Queueable, SerializesModels;

    private const STATUS_SUBJECTS = [
        'shortlisted'  => "You've Been Shortlisted!",
        'interviewing' => "Interview Invitation",
        'offered'      => "Job Offer",
        'hired'        => "Welcome Aboard!",
        'rejected'     => "Application Status Update",
    ];

    private const STATUS_MESSAGES = [
        'shortlisted'  => 'Congratulations! Your application has been shortlisted.',
        'interviewing' => 'Great news! You have been selected for an interview.',
        'offered'      => 'We are pleased to extend you a job offer.',
        'hired'        => 'Welcome to the team! Your application has been accepted.',
        'rejected'     => 'Thank you for your interest. We have moved forward with other candidates.',
    ];

    public function __construct(
        public readonly Application $application
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: self::STATUS_SUBJECTS[$this->application->status] ?? 'Application Update',
        );
    }

    public function content(): Content
    {
        return new Content(
            view: 'emails.application-status-changed',
            with: [
                'applicantName' => $this->application->full_name,
                'jobTitle'      => $this->application->jobPosting->title ?? 'the position',
                'statusMessage' => self::STATUS_MESSAGES[$this->application->status] ?? 'Your application status has been updated.',
                'currentStatus' => $this->application->status,
                // ✅ نخفي الـ feedback عند الرفض — نعطي رسالة عامة فقط
                'showFeedback'  => in_array($this->application->status, ['shortlisted', 'offered', 'hired']),
                'feedback'      => $this->application->feedback,
            ],
        );
    }
}
