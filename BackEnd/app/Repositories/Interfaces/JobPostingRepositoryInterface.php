<?php

namespace App\Repositories\Interfaces;

use App\Models\JobPosting;
use Illuminate\Database\Eloquent\Collection;

interface JobPostingRepositoryInterface
{
    /**
     * إنشاء وظيفة جديدة
     */
    public function create(array $data): JobPosting;

    /**
     * تحديث وظيفة موجودة
     */
    public function update(JobPosting $jobPosting, array $data): JobPosting;

    /**
     * جلب وظيفة بمعرفها
     */
    public function find(int $id): ?JobPosting;

    /**
     * جلب جميع الوظائف مع إمكانية التصفية والترتيب
     */
    public function all(array $filters = [], array $orderBy = []): Collection;

    /**
     * حذف وظيفة
     */
    public function delete(JobPosting $jobPosting): bool;

    /**
     * جلب الوظائف المفتوحة
     */
    public function getOpenJobPostings(): Collection;

    /**
     * جلب الوظائف حسب القسم
     */
    public function getJobPostingsByDepartment(int $departmentId): Collection;

    /**
     * جلب الوظائف حسب مستوى الخبرة
     */
    public function getJobPostingsByExperienceLevel(string $level): Collection;

    /**
     * جلب الوظائف حسب نوع التوظيف
     */
    public function getJobPostingsByEmploymentType(string $type): Collection;

    /**
     * جلب الوظائف المنشورة
     */
    public function getPublishedJobPostings(): Collection;

    /**
     * البحث عن الوظائف
     */
    public function search(string $query): Collection;
}
