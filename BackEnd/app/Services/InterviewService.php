<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Interview;
use App\Repositories\Interfaces\InterviewRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class InterviewService
{
    /**
     * Constructor
     */
    public function __construct(private InterviewRepositoryInterface $interviewRepository) {}

    /**
     * جدولة مقابلة جديدة
     */
    public function scheduleInterview(Application $application, array $data): Interview
    {
        // التحقق من البيانات المطلوبة
        $this->validateInterviewData($data);

        // إضافة معرف الطلب
        $data['application_id'] = $application->id;

        // تعيين الحالة الافتراضية
        $data['status'] = 'scheduled';

        return $this->interviewRepository->create($data);
    }

    /**
     * تحديث تفاصيل مقابلة
     */
    public function updateInterview(Interview $interview, array $data): Interview
    {
        return $this->interviewRepository->update($interview, $data);
    }

    /**
     * تسجيل ملاحظات وتقييم المقابلة
     */
    public function recordInterviewFeedback(Interview $interview, array $feedbackData): Interview
    {
        $data = [
            'status' => 'completed',
            'conducted_at' => now(),
        ];

        if (!empty($feedbackData['feedback'])) {
            $data['feedback'] = $feedbackData['feedback'];
        }

        if (!empty($feedbackData['rating'])) {
            // التحقق من أن التقييم بين 1 و 5
            $rating = (int) $feedbackData['rating'];
            if ($rating >= 1 && $rating <= 5) {
                $data['rating'] = $rating;
            }
        }

        return $this->interviewRepository->update($interview, $data);
    }

    /**
     * إلغاء مقابلة
     */
    public function cancelInterview(Interview $interview): Interview
    {
        return $this->interviewRepository->update($interview, [
            'status' => 'canceled',
        ]);
    }

    /**
     * إعادة جدولة مقابلة
     */
    public function rescheduleInterview(Interview $interview, array $data): Interview
    {
        $this->validateInterviewData($data);

        $data['status'] = 'rescheduled';

        return $this->interviewRepository->update($interview, $data);
    }

    /**
     * جلب مقابلة بمعرفها
     */
    public function getInterviewById(int $id): ?Interview
    {
        return $this->interviewRepository->find($id);
    }

    /**
     * جلب مقابلات طلب معين
     */
    public function getInterviewsByApplication(Application $application): Collection
    {
        return $this->interviewRepository->getInterviewsByApplication($application);
    }

    /**
     * جلب المقابلات المجدولة
     */
    public function getScheduledInterviews(): Collection
    {
        return $this->interviewRepository->getScheduledInterviews();
    }

    /**
     * جلب المقابلات المكتملة
     */
    public function getCompletedInterviews(): Collection
    {
        return $this->interviewRepository->getCompletedInterviews();
    }

    /**
     * جلب المقابلات حسب نوع المقابلة
     */
    public function getInterviewsByType(string $type): Collection
    {
        return $this->interviewRepository->getInterviewsByType($type);
    }

    /**
     * جلب المقابلات حسب المحاور
     */
    public function getInterviewsByInterviewer(int $interviewerId): Collection
    {
        return $this->interviewRepository->getInterviewsByInterviewer($interviewerId);
    }

    /**
     * جلب المقابلات المجدولة في تاريخ معين
     */
    public function getInterviewsScheduledOn($date): Collection
    {
        return $this->interviewRepository->getInterviewsScheduledOn($date);
    }

    /**
     * جلب المقابلات المجدولة بين تاريخين
     */
    public function getInterviewsScheduledBetween($startDate, $endDate): Collection
    {
        return $this->interviewRepository->getInterviewsScheduledBetween($startDate, $endDate);
    }

    /**
     * حذف مقابلة
     */
    public function deleteInterview(Interview $interview): bool
    {
        return $this->interviewRepository->delete($interview);
    }

    /**
     * التحقق من صحة بيانات المقابلة
     */
    private function validateInterviewData(array $data): void
    {
        // يمكن إضافة منطق التحقق المخصص هنا إذا لزم الأمر
        // هذا يتم عادة في FormRequest
    }
}
