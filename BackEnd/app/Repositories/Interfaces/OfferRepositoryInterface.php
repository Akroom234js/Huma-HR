<?php

namespace App\Repositories\Interfaces;

use App\Models\Application;
use App\Models\Offer;
use Illuminate\Database\Eloquent\Collection;

interface OfferRepositoryInterface
{
    /**
     * إنشاء عرض جديد
     */
    public function create(array $data): Offer;

    /**
     * تحديث عرض موجود
     */
    public function update(Offer $offer, array $data): Offer;

    /**
     * جلب عرض بمعرفه
     */
    public function find(int $id): ?Offer;

    /**
     * جلب جميع العروض
     */
    public function all(): Collection;

    /**
     * حذف عرض
     */
    public function delete(Offer $offer): bool;

    /**
     * جلب عرض طلب معين
     */
    public function getOfferByApplication(Application $application): ?Offer;

    /**
     * جلب العروض المعلقة
     */
    public function getPendingOffers(): Collection;

    /**
     * جلب العروض المقبولة
     */
    public function getAcceptedOffers(): Collection;

    /**
     * جلب العروض المرفوضة
     */
    public function getRejectedOffers(): Collection;

    /**
     * جلب العروض المسحوبة
     */
    public function getWithdrawnOffers(): Collection;

    /**
     * جلب العروض حسب الحالة
     */
    public function getOffersByStatus(string $status): Collection;

    /**
     * جلب العروض المقدمة خلال فترة زمنية معينة
     */
    public function getOffersExtendedBetween($startDate, $endDate): Collection;
}
