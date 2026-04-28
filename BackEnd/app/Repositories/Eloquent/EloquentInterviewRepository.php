<?php

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Models\Interview;
use App\Repositories\Interfaces\InterviewRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentInterviewRepository implements InterviewRepositoryInterface
{
    /**
     * إنشاء مقابلة جديدة
     */
    public function create(array $data): Interview
    {
        return Interview::create($data);
    }

    /**
     * تحديث مقابلة موجودة
     */
    public function update(Interview $interview, array $data): Interview
    {
        $interview->update($data);
        return $interview->fresh();
    }

    /**
     * جلب مقابلة بمعرفها
     */
    public function find(int $id): ?Interview
    {
        return Interview::find($id);
    }

    /**
     * جلب جميع المقابلات
     */
    public function all(): Collection
    {
        return Interview::orderBy('scheduled_at', 'desc')->get();
    }

    /**
     * حذف مقابلة
     */
    public function delete(Interview $interview): bool
    {
        return $interview->delete();
    }

    /**
     * جلب مقابلات طلب معين
     */
    public function getInterviewsByApplication(Application $application): Collection
    {
        return $application->interviews()->orderBy('scheduled_at', 'desc')->get();
    }

    /**
     * جلب المقابلات المجدولة
     */
    public function getScheduledInterviews(): Collection
    {
        return Interview::scheduled()->get();
    }

    /**
     * جلب المقابلات المكتملة
     */
    public function getCompletedInterviews(): Collection
    {
        return Interview::completed()->get();
    }

    /**
     * جلب المقابلات حسب نوع المقابلة
     */
    public function getInterviewsByType(string $type): Collection
    {
        return Interview::byType($type)->get();
    }

    /**
     * جلب المقابلات حسب المحاور
     */
    public function getInterviewsByInterviewer(int $interviewerId): Collection
    {
        return Interview::byInterviewer($interviewerId)->get();
    }

    /**
     * جلب المقابلات المجدولة في تاريخ معين
     */
    public function getInterviewsScheduledOn($date): Collection
    {
        return Interview::scheduledOn($date)->get();
    }

    /**
     * جلب المقابلات المجدولة بين تاريخين
     */
    public function getInterviewsScheduledBetween($startDate, $endDate): Collection
    {
        return Interview::scheduledBetween($startDate, $endDate)->get();
    }
}
