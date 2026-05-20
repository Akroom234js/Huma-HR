<?php

namespace App\Repositories\Interfaces;

use App\Models\Application;
use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Collection;

interface ApplicationRepositoryInterface
{
    /**
     * إنشاء طلب جديد
     */
    public function create(array $data): Application;

    /**
     * تحديث طلب موجود
     */
    public function update(Application $application, array $data): Application;

    /**
     * جلب طلب بمعرفه
     */
    public function find(int $id): ?Application;

    /**
     * جلب جميع الطلبات مع إمكانية التصفية
     */
    public function all(array $filters = []): Collection;

    /**
     * حذف طلب
     */
    public function delete(Application $application): bool;

    /**
     * جلب طلبات وظيفة معينة
     */
    public function getApplicationsByJobPosting(JobPosting $jobPosting, array $filters = []): Collection;

    /**
     * جلب الطلبات حسب الحالة
     */
    public function getApplicationsByStatus(string $status): Collection;

    /**
     * جلب الطلبات المعلقة
     */
    public function getPendingApplications(): Collection;

    /**
     * جلب الطلبات المختارة
     */
    public function getShortlistedApplications(): Collection;

    /**
     * جلب الطلبات المعروضة
     */
    public function getOfferedApplications(): Collection;

    /**
     * جلب الطلبات المرفوضة
     */
    public function getRejectedApplications(): Collection;

    /**
     * جلب طلبات مستخدم معين
     */
    public function getApplicationsByUser(int $userId): Collection;

    /**
     * البحث عن الطلبات
     */
    public function search(string $query): Collection;
}
