<?php

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Models\JobPosting;
use App\Repositories\Interfaces\ApplicationRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentApplicationRepository implements ApplicationRepositoryInterface
{
    /**
     * إنشاء طلب جديد
     */
    public function create(array $data): Application
    {
        return Application::create($data);
    }

    /**
     * تحديث طلب موجود
     */
    public function update(Application $application, array $data): Application
    {
        $application->update($data);
        return $application->fresh();
    }

    /**
     * جلب طلب بمعرفه
     */
    public function find(int $id): ?Application
    {
        return Application::find($id);
    }

    /**
     * جلب جميع الطلبات مع إمكانية التصفية
     */
    public function all(array $filters = []): Collection
    {
        $query = Application::query();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['job_posting_id'])) {
            $query->where('job_posting_id', $filters['job_posting_id']);
        }

        if (!empty($filters['user_id'])) {
            $query->where('user_id', $filters['user_id']);
        }

        if (!empty($filters['search'])) {
            $query->where('full_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('submitted_at', 'desc')->get();
    }

    /**
     * حذف طلب
     */
    public function delete(Application $application): bool
    {
        return $application->delete();
    }

    /**
     * جلب طلبات وظيفة معينة
     */
    public function getApplicationsByJobPosting(JobPosting $jobPosting, array $filters = []): Collection
    {
        $query = $jobPosting->applications();

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['search'])) {
            $query->where('full_name', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('email', 'like', '%' . $filters['search'] . '%');
        }

        return $query->orderBy('submitted_at', 'desc')->get();
    }

    /**
     * جلب الطلبات حسب الحالة
     */
    public function getApplicationsByStatus(string $status): Collection
    {
        return Application::byStatus($status)->get();
    }

    /**
     * جلب الطلبات المعلقة
     */
    public function getPendingApplications(): Collection
    {
        return Application::pending()->get();
    }

    /**
     * جلب الطلبات المختارة
     */
    public function getShortlistedApplications(): Collection
    {
        return Application::shortlisted()->get();
    }

    /**
     * جلب الطلبات المعروضة
     */
    public function getOfferedApplications(): Collection
    {
        return Application::offered()->get();
    }

    /**
     * جلب الطلبات المرفوضة
     */
    public function getRejectedApplications(): Collection
    {
        return Application::rejected()->get();
    }

    /**
     * جلب طلبات مستخدم معين
     */
    public function getApplicationsByUser(int $userId): Collection
    {
        return Application::where('user_id', $userId)->get();
    }

    /**
     * البحث عن الطلبات
     */
    public function search(string $query): Collection
    {
        return Application::where('full_name', 'like', '%' . $query . '%')
                          ->orWhere('email', 'like', '%' . $query . '%')
                          ->get();
    }
}
