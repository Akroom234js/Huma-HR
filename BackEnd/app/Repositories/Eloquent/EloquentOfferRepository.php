<?php

namespace App\Repositories\Eloquent;

use App\Models\Application;
use App\Models\Offer;
use App\Repositories\Interfaces\OfferRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class EloquentOfferRepository implements OfferRepositoryInterface
{
    /**
     * إنشاء عرض جديد
     */
    public function create(array $data): Offer
    {
        return Offer::create($data);
    }

    /**
     * تحديث عرض موجود
     */
    public function update(Offer $offer, array $data): Offer
    {
        $offer->update($data);
        return $offer->fresh();
    }

    /**
     * جلب عرض بمعرفه
     */
    public function find(int $id): ?Offer
    {
        return Offer::find($id);
    }

    /**
     * جلب جميع العروض
     */
    public function all(): Collection
    {
        return Offer::orderBy('extended_at', 'desc')->get();
    }

    /**
     * حذف عرض
     */
    public function delete(Offer $offer): bool
    {
        return $offer->delete();
    }

    /**
     * جلب عرض طلب معين
     */
    public function getOfferByApplication(Application $application): ?Offer
    {
        return $application->offer;
    }

    /**
     * جلب العروض المعلقة
     */
    public function getPendingOffers(): Collection
    {
        return Offer::pending()->get();
    }

    /**
     * جلب العروض المقبولة
     */
    public function getAcceptedOffers(): Collection
    {
        return Offer::accepted()->get();
    }

    /**
     * جلب العروض المرفوضة
     */
    public function getRejectedOffers(): Collection
    {
        return Offer::rejected()->get();
    }

    /**
     * جلب العروض المسحوبة
     */
    public function getWithdrawnOffers(): Collection
    {
        return Offer::withdrawn()->get();
    }

    /**
     * جلب العروض حسب الحالة
     */
    public function getOffersByStatus(string $status): Collection
    {
        return Offer::byStatus($status)->get();
    }

    /**
     * جلب العروض المقدمة خلال فترة زمنية معينة
     */
    public function getOffersExtendedBetween($startDate, $endDate): Collection
    {
        return Offer::extendedBetween($startDate, $endDate)->get();
    }
}
