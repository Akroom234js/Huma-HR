<?php

namespace App\Repositories\Interfaces;

use App\Models\Application;
use App\Models\Attachment;
use Illuminate\Database\Eloquent\Collection;

interface AttachmentRepositoryInterface
{
    /**
     * إنشاء مرفق جديد
     */
    public function create(array $data): Attachment;

    /**
     * جلب مرفق بمعرفه
     */
    public function find(int $id): ?Attachment;

    /**
     * جلب جميع المرفقات
     */
    public function all(): Collection;

    /**
     * حذف مرفق
     */
    public function delete(Attachment $attachment): bool;

    /**
     * جلب مرفقات طلب معين
     */
    public function getAttachmentsByApplication(Application $application): Collection;

    /**
     * جلب المرفقات حسب نوع الملف
     */
    public function getAttachmentsByType(string $type): Collection;

    /**
     * حذف جميع مرفقات طلب معين
     */
    public function deleteByApplication(Application $application): bool;
}
