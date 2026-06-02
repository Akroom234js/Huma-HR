<?php

namespace App\Http\Controllers;

use App\Models\PerformanceCycle;
use App\Models\PerformanceCycleComponent;
use App\Http\Requests\StorePerformanceCycleRequest;
use App\Http\Requests\UpdatePerformanceCycleRequest;
use App\Jobs\ProcessPerformanceJob;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class PerformanceCycleController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────────────────────
    // عرض كل الدورات
    // GET /performance/cycles
    // HR → كل الدورات | Manager → النشطة فقط
    // ─────────────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        $user = auth()->user();

        $query = PerformanceCycle::with(['components', 'creator'])
            ->latest();

        // Manager يشوف النشطة فقط
        if (! $user->hasRole('hr', 'api')) {
            $query->where('status', 'active');
        }

        $cycles = $query->get()->map(fn($c) => $this->formatCycle($c));

        return $this->successResponse($cycles, 'Performance cycles retrieved successfully.');
    }

    // ─────────────────────────────────────────────────────────────
    // إنشاء دورة جديدة + مكوناتها
    // POST /performance/cycles
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function store(StorePerformanceCycleRequest $request): JsonResponse
    {
        $cycle = DB::transaction(function () use ($request) {

            $hrProfile = auth()->user()->employeeProfile;

            // إنشاء الدورة
            $cycle = PerformanceCycle::create([
                'title'      => $request->title,
                'start_date' => $request->start_date,
                'end_date'   => $request->end_date,
                'status'     => 'draft',
                'created_by' => $hrProfile->id,
            ]);

            // إنشاء المكونات
            foreach ($request->components as $component) {
                PerformanceCycleComponent::create([
                    'performance_cycle_id' => $cycle->id,
                    'component_key'        => $component['component_key'],
                    'weight'               => $component['weight'],
                    'is_active'            => true,
                ]);
            }

            return $cycle->load(['components', 'creator']);
        });

        return $this->successResponse(
            $this->formatCycle($cycle),
            'Performance cycle created successfully.',
            201
        );
    }

    // ─────────────────────────────────────────────────────────────
    // تفاصيل دورة واحدة
    // GET /performance/cycles/{cycle}
    // HR + Manager
    // ─────────────────────────────────────────────────────────────
    public function show(PerformanceCycle $cycle): JsonResponse
    {
        $cycle->load(['components', 'creator', 'approver']);

        return $this->successResponse(
            $this->formatCycle($cycle),
            'Performance cycle retrieved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // تعديل دورة (draft فقط)
    // PUT /performance/cycles/{cycle}
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function update(UpdatePerformanceCycleRequest $request, PerformanceCycle $cycle): JsonResponse
    {
        DB::transaction(function () use ($request, $cycle) {

            // تحديث بيانات الدورة
            $cycle->update(array_filter([
                'title'      => $request->title,
                'start_date' => $request->start_date,
                'end_date'   => $request->end_date,
            ], fn($v) => ! is_null($v)));

            // إذا أرسل مكونات جديدة → احذف القديمة واستبدلها
            if ($request->has('components')) {
                $cycle->components()->delete();

                foreach ($request->components as $component) {
                    PerformanceCycleComponent::create([
                        'performance_cycle_id' => $cycle->id,
                        'component_key'        => $component['component_key'],
                        'weight'               => $component['weight'],
                        'is_active'            => true,
                    ]);
                }
            }
        });

        return $this->successResponse(
            $this->formatCycle($cycle->fresh(['components', 'creator'])),
            'Performance cycle updated successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // تفعيل الدورة (draft → active)
    // POST /performance/cycles/{cycle}/activate
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function activate(PerformanceCycle $cycle): JsonResponse
    {
        if ($cycle->status !== 'draft') {
            return $this->errorResponse(
                'Only draft cycles can be activated.',
                null,
                422
            );
        }

        // تأكيد أن المكونات موجودة وأوزانها = 100
        if (! $cycle->areWeightsValid()) {
            return $this->errorResponse(
                'Cannot activate cycle: component weights do not sum to 100.',
                null,
                422
            );
        }

        $hrProfile = auth()->user()->employeeProfile;

        $cycle->update([
            'status'      => 'active',
            'approved_by' => $hrProfile->id,
            'approved_at' => now(),
        ]);

        return $this->successResponse(
            $this->formatCycle($cycle->fresh(['components'])),
            'Performance cycle activated successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // إغلاق الدورة وتشغيل حساب الأداء في الخلفية
    // POST /performance/cycles/{cycle}/close
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function close(PerformanceCycle $cycle): JsonResponse
    {
        if ($cycle->status !== 'active') {
            return $this->errorResponse(
                'Only active cycles can be closed.',
                null,
                422
            );
        }

        // تغيير الحالة إلى processing فوراً
        $cycle->update(['status' => 'processing']);

        // تشغيل الحساب في الخلفية
        ProcessPerformanceJob::dispatch($cycle);

        return $this->successResponse(
            ['cycle_id' => $cycle->id, 'status' => 'processing'],
            'Cycle closed. Performance scoring has started in the background.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Helper — تنسيق بيانات الدورة للـ response
    // ─────────────────────────────────────────────────────────────
    private function formatCycle(PerformanceCycle $cycle): array
    {
        return [
            'id'               => $cycle->id,
            'title'            => $cycle->title,
            'start_date'       => $cycle->start_date?->format('Y-m-d'),
            'end_date'         => $cycle->end_date?->format('Y-m-d'),
            'status'           => $cycle->status,
            'created_by'       => $cycle->creator ? [
                'id'   => $cycle->creator->id,
                'name' => $cycle->creator->full_name,
            ] : null,
            'approved_by'      => $cycle->approver ? [
                'id'   => $cycle->approver->id,
                'name' => $cycle->approver->full_name,
            ] : null,
            'approved_at'      => $cycle->approved_at?->format('Y-m-d H:i:s'),
            'components'       => $cycle->components->map(fn($c) => [
                'id'            => $c->id,
                'component_key' => $c->component_key,
                'weight'        => $c->weight,
                'is_active'     => $c->is_active,
            ])->values(),
            'components_count' => $cycle->components->count(),
            'weights_valid'    => $cycle->areWeightsValid(),
            'created_at'       => $cycle->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}
