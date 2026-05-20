<?php

namespace App\Services;

use App\Models\Application;
use App\Models\Offer;
use App\Repositories\Interfaces\OfferRepositoryInterface;
use Illuminate\Database\Eloquent\Collection;

class OfferService
{
    /**
     * Constructor
     */
    public function __construct(private OfferRepositoryInterface $offerRepository) {}

    /**
     * تقديم عرض وظيفي
     */
    public function extendOffer(Application $application, array $data): Offer
    {
        // التحقق من البيانات المطلوبة
        $this->validateOfferData($data);

        // إضافة معرف الطلب
        $data['application_id'] = $application->id;

        // تعيين الحالة الافتراضية
        $data['status'] = 'pending';
        $data['extended_at'] = now();

        return $this->offerRepository->create($data);
    }

    /**
     * قبول عرض وظيفي
     */
    public function acceptOffer(Offer $offer): Offer
    {
        return $this->offerRepository->update($offer, [
            'status' => 'accepted',
            'accepted_at' => now(),
        ]);
    }

    /**
     * رفض عرض وظيفي
     */
    public function rejectOffer(Offer $offer): Offer
    {
        return $this->offerRepository->update($offer, [
            'status' => 'rejected',
            'rejected_at' => now(),
        ]);
    }

    /**
     * سحب عرض وظيفي
     */
    public function withdrawOffer(Offer $offer): Offer
    {
        return $this->offerRepository->update($offer, [
            'status' => 'withdrawn',
        ]);
    }

    /**
     * تحديث عرض وظيفي
     */
    public function updateOffer(Offer $offer, array $data): Offer
    {
        return $this->offerRepository->update($offer, $data);
    }

    /**
     * جلب عرض بمعرفه
     */
    public function getOfferById(int $id): ?Offer
    {
        return $this->offerRepository->find($id);
    }

    /**
     * جلب عرض وظيفي لطلب معين
     */
    public function getOfferByApplication(Application $application): ?Offer
    {
        return $this->offerRepository->getOfferByApplication($application);
    }

    /**
     * جلب العروض المعلقة
     */
    public function getPendingOffers(): Collection
    {
        return $this->offerRepository->getPendingOffers();
    }

    /**
     * جلب العروض المقبولة
     */
    public function getAcceptedOffers(): Collection
    {
        return $this->offerRepository->getAcceptedOffers();
    }

    /**
     * جلب العروض المرفوضة
     */
    public function getRejectedOffers(): Collection
    {
        return $this->offerRepository->getRejectedOffers();
    }

    /**
     * جلب العروض المسحوبة
     */
    public function getWithdrawnOffers(): Collection
    {
        return $this->offerRepository->getWithdrawnOffers();
    }

    /**
     * جلب العروض حسب الحالة
     */
    public function getOffersByStatus(string $status): Collection
    {
        return $this->offerRepository->getOffersByStatus($status);
    }

    /**
     * جلب العروض المقدمة خلال فترة زمنية معينة
     */
    public function getOffersExtendedBetween($startDate, $endDate): Collection
    {
        return $this->offerRepository->getOffersExtendedBetween($startDate, $endDate);
    }

    /**
     * حذف عرض
     */
    public function deleteOffer(Offer $offer): bool
    {
        return $this->offerRepository->delete($offer);
    }

    /**
     * التحقق من صحة بيانات العرض
     */
    private function validateOfferData(array $data): void
    {
        // يمكن إضافة منطق التحقق المخصص هنا إذا لزم الأمر
        // هذا يتم عادة في FormRequest
    }
}
