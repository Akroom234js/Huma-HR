<?php

namespace App\Repositories\Eloquent;

use App\Models\JobPosting;
use App\Repositories\Interfaces\JobPostingRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentJobPostingRepository implements JobPostingRepositoryInterface
{
    /**
     * إنشاء وظيفة جديدة
     */
    public function create(array $data): JobPosting
    {
        return JobPosting::create($data);
    }

    /**
     * تحديث وظيفة موجودة
     */
    public function update(JobPosting $jobPosting, array $data): JobPosting
    {
        $jobPosting->update($data);
        return $jobPosting->fresh();
    }

    /**
     * جلب وظيفة بمعرفها
     */
    public function find(int $id): ?JobPosting
    {
        return JobPosting::find($id);
    }

    /**
     * جلب جميع الوظائف مع إمكانية التصفية والترتيب
     */
    public function all(array $filters = [], array $orderBy = []): Collection
    {
        $query = JobPosting::query();

        // تطبيق التصفية
        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['department_id'])) {
            $query->where('department_id', $filters['department_id']);
        }

        if (!empty($filters['experience_level'])) {
            $query->where('experience_level', $filters['experience_level']);
        }

        if (!empty($filters['employment_type'])) {
            $query->where('employment_type', $filters['employment_type']);
        }

        if (!empty($filters['search'])) {
            $query->where('title', 'like', '%' . $filters['search'] . '%')
                  ->orWhere('description', 'like', '%' . $filters['search'] . '%');
        }

        // تطبيق الترتيب
        if (!empty($orderBy)) {
            foreach ($orderBy as $column => $direction) {
                $query->orderBy($column, $direction);
            }
        } else {
            $query->orderBy('created_at', 'desc');
        }

        return $query->get();
    }

    /**
     * حذف وظيفة
     */
    public function delete(JobPosting $jobPosting): bool
    {
        return $jobPosting->delete();
    }

    /**
     * جلب الوظائف المفتوحة
     */
    public function getOpenJobPostings(): Collection
    {
        return JobPosting::open()->get();
    }

    /**
     * جلب الوظائف حسب القسم
     */
    public function getJobPostingsByDepartment(int $departmentId): Collection
    {
        return JobPosting::byDepartment($departmentId)->get();
    }

    /**
     * جلب الوظائف حسب مستوى الخبرة
     */
    public function getJobPostingsByExperienceLevel(string $level): Collection
    {
        return JobPosting::byExperienceLevel($level)->get();
    }

    /**
     * جلب الوظائف حسب نوع التوظيف
     */
    public function getJobPostingsByEmploymentType(string $type): Collection
    {
        return JobPosting::byEmploymentType($type)->get();
    }

    /**
     * جلب الوظائف المنشورة
     */
    public function getPublishedJobPostings(): Collection
    {
        return JobPosting::published()->get();
    }

    /**
     * البحث عن الوظائف
     */
    public function search(string $query): Collection
    {
        return JobPosting::where('title', 'like', '%' . $query . '%')
                         ->orWhere('description', 'like', '%' . $query . '%')
                         ->get();
    }
}
