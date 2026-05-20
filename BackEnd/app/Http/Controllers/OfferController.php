<?php

namespace App\Http\Controllers;

use App\Http\Controllers\Controller;
use App\Http\Requests\Offer\StoreOfferRequest;
use App\Http\Resources\OfferResource;
use App\Models\Application;
use App\Models\Offer;
use App\Services\OfferService;
use Illuminate\Http\JsonResponse;

class OfferController extends Controller
{
    /**
     * Constructor
     */
    public function __construct(private OfferService $offerService) {}

    /**
     * عرض قائمة العروض
     */
    public function index(): JsonResponse
    {
        try {
            $offers = $this->offerService->getPendingOffers();

            return response()->json([
                'status' => true,
                'message' => 'تم جلب العروض بنجاح.',
                'data' => OfferResource::collection($offers),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء جلب العروض.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * تقديم عرض وظيفي
     */
    public function store(StoreOfferRequest $request, Application $application): JsonResponse
    {
        try {
            $offer = $this->offerService->extendOffer(
                $application,
                $request->validated()
            );

            $offer->load(['application']);

            return response()->json([
                'status' => true,
                'message' => 'تم تقديم العرض الوظيفي بنجاح.',
                'data' => new OfferResource($offer),
            ], 201);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء تقديم العرض.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * عرض عرض محدد
     */
    public function show(Offer $offer): JsonResponse
    {
        try {
            $offer->load(['application']);

            return response()->json([
                'status' => true,
                'message' => 'تم جلب العرض بنجاح.',
                'data' => new OfferResource($offer),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء جلب العرض.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * قبول عرض وظيفي
     */
    public function accept(Offer $offer): JsonResponse
    {
        try {
            $offer = $this->offerService->acceptOffer($offer);

            $offer->load(['application']);

            return response()->json([
                'status' => true,
                'message' => 'تم قبول العرض الوظيفي بنجاح.',
                'data' => new OfferResource($offer),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء قبول العرض.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * رفض عرض وظيفي
     */
    public function reject(Offer $offer): JsonResponse
    {
        try {
            $offer = $this->offerService->rejectOffer($offer);

            $offer->load(['application']);

            return response()->json([
                'status' => true,
                'message' => 'تم رفض العرض الوظيفي بنجاح.',
                'data' => new OfferResource($offer),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء رفض العرض.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * سحب عرض وظيفي
     */
    public function withdraw(Offer $offer): JsonResponse
    {
        try {
            $offer = $this->offerService->withdrawOffer($offer);

            $offer->load(['application']);

            return response()->json([
                'status' => true,
                'message' => 'تم سحب العرض الوظيفي بنجاح.',
                'data' => new OfferResource($offer),
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء سحب العرض.',
                'data' => null,
            ], 500);
        }
    }

    /**
     * حذف عرض
     */
    public function destroy(Offer $offer): JsonResponse
    {
        try {
            $this->offerService->deleteOffer($offer);

            return response()->json([
                'status' => true,
                'message' => 'تم حذف العرض بنجاح.',
                'data' => null,
            ], 200);
        } catch (\Exception $e) {
            return response()->json([
                'status' => false,
                'message' => 'حدث خطأ أثناء حذف العرض.',
                'data' => null,
            ], 500);
        }
    }
}
