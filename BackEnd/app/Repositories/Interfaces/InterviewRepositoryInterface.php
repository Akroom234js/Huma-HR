<?php

namespace App\Repositories\Interfaces;

use App\Models\Application;
use App\Models\Interview;
use Illuminate\Database\Eloquent\Collection;

interface InterviewRepositoryInterface
{
    /**
     * إنشاء مقابلة جديدة
     */
    public function create(array $data): Interview;

    /**
     * تحديث مقابلة موجودة
     */
    public function update(Interview $interview, array $data): Interview;

    /**
     * جلب مقابلة بمعرفها
     */
    public function find(int $id): ?Interview;

    /**
     * جلب جميع المقابلات
     */
    public function all(): Collection;

    /**
     * حذف مقابلة
     */
    public function delete(Interview $interview): bool;

    /**
     * جلب مقابلات طلب معين
     */
    public function getInterviewsByApplication(Application $application): Collection;

    /**
     * جلب المقابلات المجدولة
     */
    public function getScheduledInterviews(): Collection;

    /**
     * جلب المقابلات المكتملة
     */
    public function getCompletedInterviews(): Collection;

    /**
     * جلب المقابلات حسب نوع المقابلة
     */
    public function getInterviewsByType(string $type): Collection;

    /**
     * جلب المقابلات حسب المحاور
     */
    public function getInterviewsByInterviewer(int $interviewerId): Collection;

    /**
     * جلب المقابلات المجدولة في تاريخ معين
     */
    public function getInterviewsScheduledOn($date): Collection;

    /**
     * جلب المقابلات المجدولة بين تاريخين
     */
    public function getInterviewsScheduledBetween($startDate, $endDate): Collection;
}
