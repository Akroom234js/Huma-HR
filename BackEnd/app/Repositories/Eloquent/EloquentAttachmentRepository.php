<?php

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Models\Attachment;
use App\Repositories\Interfaces\AttachmentRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentAttachmentRepository implements AttachmentRepositoryInterface
{
    /**
     * إنشاء مرفق جديد
     */
    public function create(array $data): Attachment
    {
        return Attachment::create($data);
    }

    /**
     * جلب مرفق بمعرفه
     */
    public function find(int $id): ?Attachment
    {
        return Attachment::find($id);
    }

    /**
     * جلب جميع المرفقات
     */
    public function all(): Collection
    {
        return Attachment::orderBy('created_at', 'desc')->get();
    }

    /**
     * حذف مرفق
     */
    public function delete(Attachment $attachment): bool
    {
        return $attachment->delete();
    }

    /**
     * جلب مرفقات طلب معين
     */
    public function getAttachmentsByApplication(Application $application): Collection
    {
        return $application->attachments()->orderBy('created_at', 'desc')->get();
    }

    /**
     * جلب المرفقات حسب نوع الملف
     */
    public function getAttachmentsByType(string $type): Collection
    {
        return Attachment::byType($type)->get();
    }

    /**
     * حذف جميع مرفقات طلب معين
     */
    public function deleteByApplication(Application $application): bool
    {
        return $application->attachments()->delete() > 0;
    }
}
