<?php

namespace App\Http\Controllers;

use App\Models\OfficeLocation;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OfficeLocationController extends Controller
{
    use ApiResponse;

    /**
     * عرض قائمة الفروع.
     */
    public function index(): JsonResponse
    {
        try {
            $locations = OfficeLocation::orderBy('name')->get();
            return $this->successResponse($locations, 'Office locations retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to retrieve office locations: ' . $e->getMessage(), 500);
        }
    }

    /**
     * عرض تفاصيل فرع معين.
     */
    public function show(int $id): JsonResponse
    {
        try {
            $location = OfficeLocation::find($id);

            if (!$location) {
                return $this->errorResponse('Office location not found.', 404);
            }

            return $this->successResponse($location, 'Office location retrieved successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Error: ' . $e->getMessage(), 500);
        }
    }

    /**
     * إضافة فرع جديد للشركة.
     */
    public function store(Request $request): JsonResponse
    {
        try {
            $request->validate([
                'name' => 'required|string|max:255',
                'latitude' => 'required|numeric|between:-90,90',
                'longitude' => 'required|numeric|between:-180,180',
                'radius_meters' => 'required|integer|min:10|max:5000',
                'is_active' => 'nullable|boolean',
            ]);

            $location = OfficeLocation::create($request->all());

            return $this->successResponse($location, 'Office location created successfully.', 201);
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to create office location: ' . $e->getMessage(), 500);
        }
    }

    /**
     * تعديل بيانات الفرع.
     */
    public function update(Request $request, int $id): JsonResponse
    {
        try {
            $location = OfficeLocation::find($id);

            if (!$location) {
                return $this->errorResponse('Office location not found.', 404);
            }

            $request->validate([
                'name' => 'sometimes|required|string|max:255',
                'latitude' => 'sometimes|required|numeric|between:-90,90',
                'longitude' => 'sometimes|required|numeric|between:-180,180',
                'radius_meters' => 'sometimes|required|integer|min:10|max:5000',
                'is_active' => 'sometimes|required|boolean',
            ]);

            $location->update($request->all());

            return $this->successResponse($location, 'Office location updated successfully.');
        } catch (\Illuminate\Validation\ValidationException $e) {
            return $this->errorResponse($e->getMessage(), 422);
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to update office location: ' . $e->getMessage(), 500);
        }
    }

    /**
     * حذف فرع من مواقع الشركة.
     */
    public function destroy(int $id): JsonResponse
    {
        try {
            $location = OfficeLocation::find($id);

            if (!$location) {
                return $this->errorResponse('Office location not found.', 404);
            }

            $location->delete();

            return $this->successResponse(null, 'Office location deleted successfully.');
        } catch (\Exception $e) {
            return $this->errorResponse('Failed to delete office location: ' . $e->getMessage(), 500);
        }
    }
}
