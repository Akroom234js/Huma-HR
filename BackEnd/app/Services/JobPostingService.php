<?php

namespace App\Services;

use App\Models\JobPosting;
use App\Repositories\Interfaces\JobPostingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class JobPostingService
{
    /**
     * Constructor
     */
    public function __construct(private JobPostingRepositoryInterface $jobPostingRepository) {}

    /**
     * إنشاء وظيفة جديدة
     */
    public function createJobPosting(array $data): JobPosting
    {
        // التحقق من البيانات المطلوبة
        $this->validateJobPostingData($data);

        // إضافة معرف المستخدم الحالي
        $data['created_by'] = auth()->id();

        return $this->jobPostingRepository->create($data);
    }

    /**
     * تحديث وظيفة موجودة
     */
    public function updateJobPosting(JobPosting $jobPosting, array $data): JobPosting
    {
        // التحقق من البيانات المطلوبة
        $this->validateJobPostingData($data, true);

        // إضافة معرف المستخدم الذي قام بالتحديث
        $data['updated_by'] = auth()->id();

        return $this->jobPostingRepository->update($jobPosting, $data);
    }

    /**
     * نشر وظيفة
     */
    public function publishJobPosting(JobPosting $jobPosting): JobPosting
    {
        return $this->jobPostingRepository->update($jobPosting, [
            'status' => 'open',
            'posted_at' => now(),
            'updated_by' => auth()->id(),
        ]);
    }

    /**
     * إغلاق وظيفة
     */
    public function closeJobPosting(JobPosting $jobPosting): JobPosting
    {
        return $this->jobPostingRepository->update($jobPosting, [
            'status' => 'closed',
            'updated_by' => auth()->id(),
        ]);
    }

    /**
     * أرشفة وظيفة
     */
    public function archiveJobPosting(JobPosting $jobPosting): JobPosting
    {
        return $this->jobPostingRepository->update($jobPosting, [
            'status' => 'archived',
            'updated_by' => auth()->id(),
        ]);
    }

    /**
     * جلب وظيفة بمعرفها
     */
    public function getJobPostingById(int $id): ?JobPosting
    {
        return $this->jobPostingRepository->find($id);
    }

    /**
     * جلب جميع الوظائف مع إمكانية التصفية
     */
    public function getAllJobPostings(array $filters = [], array $orderBy = []): Collection
    {
        return $this->jobPostingRepository->all($filters, $orderBy);
    }

    /**
     * جلب الوظائف المفتوحة
     */
    public function getOpenJobPostings(): Collection
    {
        return $this->jobPostingRepository->getOpenJobPostings();
    }

    /**
     * جلب الوظائف المنشورة
     */
    public function getPublishedJobPostings(): Collection
    {
        return $this->jobPostingRepository->getPublishedJobPostings();
    }

    /**
     * جلب الوظائف حسب القسم
     */
    public function getJobPostingsByDepartment(int $departmentId): Collection
    {
        return $this->jobPostingRepository->getJobPostingsByDepartment($departmentId);
    }

    /**
     * جلب الوظائف حسب مستوى الخبرة
     */
    public function getJobPostingsByExperienceLevel(string $level): Collection
    {
        return $this->jobPostingRepository->getJobPostingsByExperienceLevel($level);
    }

    /**
     * جلب الوظائف حسب نوع التوظيف
     */
    public function getJobPostingsByEmploymentType(string $type): Collection
    {
        return $this->jobPostingRepository->getJobPostingsByEmploymentType($type);
    }

    /**
     * البحث عن الوظائف
     */
    public function searchJobPostings(string $query): Collection
    {
        return $this->jobPostingRepository->search($query);
    }

    /**
     * حذف وظيفة
     */
    public function deleteJobPosting(JobPosting $jobPosting): bool
    {
        return $this->jobPostingRepository->delete($jobPosting);
    }

    /**
     * التحقق من صحة بيانات الوظيفة
     */
    private function validateJobPostingData(array $data, bool $isUpdate = false): void
    {
        // يمكن إضافة منطق التحقق المخصص هنا إذا لزم الأمر
        // هذا يتم عادة في FormRequest
    }
}
