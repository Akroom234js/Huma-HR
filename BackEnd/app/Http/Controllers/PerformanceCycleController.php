<?php

namespace App\Http\Controllers;

use App\Models\PerformanceCycle;
use App\Models\PerformanceTemplate;
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
        $this->autoUpdateCycles();
        $user = auth()->user();

        // Eager load template and creator to prevent N+1 queries
        $query = PerformanceCycle::with(['template', 'creator'])
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
        $hrProfile = auth()->user()->employeeProfile;
        if (!$hrProfile) {
            return $this->errorResponse(
                'Authenticated user does not have an employee profile.',
                null,
                403
            );
        }

        $cycle = DB::transaction(function () use ($request, $hrProfile) {
            $templateId = $request->performance_template_id;

            // إذا أرسل مكونات مخصصة، ننشئ لها قالباً ديناميكياً تلقائياً
            if ($request->has('components') && !$templateId) {
                $componentsData = [];
                foreach ($request->components as $comp) {
                    $componentsData[$comp['component_key']] = [
                        'weight' => $comp['weight'],
                        'is_active' => true,
                        // إعدادات افتراضية للمكونات الفرعية
                        'sub_components' => match ($comp['component_key']) {
                            'tasks' => [
                                'completion_weight' => 60.00,
                                'quality_weight' => 40.00,
                                'late_penalty_per_day_percent' => 5.00,
                                'max_late_penalty_percent' => 50.00
                            ],
                            'manager' => [
                                'professionalism' => ['weight' => 33.33],
                                'responsibility' => ['weight' => 33.33],
                                'problem_solving' => ['weight' => 33.34]
                            ],
                            'peer' => [
                                'teamwork' => ['weight' => 50.00],
                                'cooperation' => ['weight' => 50.00]
                            ],
                            default => []
                        }
                    ];
                }

                $template = PerformanceTemplate::create([
                    'name' => "Custom Template for Cycle: " . $request->title,
                    'is_active' => false, // قالب خاص بدورة واحدة وليس عاماً للجميع
                    'components' => $componentsData
                ]);

                $templateId = $template->id;
            }

            // إنشاء الدورة
            $cycle = PerformanceCycle::create([
                'title'                   => $request->title,
                'performance_template_id' => $templateId,
                'start_date'              => $request->start_date,
                'end_date'                => $request->end_date,
                'status'                  => 'draft',
                'created_by'              => $hrProfile->id,
            ]);

            return $cycle->load(['template', 'creator']);
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
        $this->autoUpdateCycles();
        $cycle->load(['template', 'creator', 'approver']);

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
        $hrProfile = auth()->user()->employeeProfile;
        if (!$hrProfile) {
            return $this->errorResponse(
                'Authenticated user does not have an employee profile.',
                null,
                403
            );
        }

        if ($cycle->status !== 'draft') {
            return $this->errorResponse(
                'Only draft cycles can be updated.',
                null,
                422
            );
        }

        DB::transaction(function () use ($request, $cycle) {
            $updateData = array_filter([
                'title'                   => $request->title,
                'performance_template_id' => $request->performance_template_id,
                'start_date'              => $request->start_date,
                'end_date'                => $request->end_date,
            ], fn($v) => ! is_null($v));

            $cycle->update($updateData);
        });

        return $this->successResponse(
            $this->formatCycle($cycle->fresh(['template', 'creator'])),
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
                'Cannot activate cycle: component weights do not sum to 100 or sub-components are invalid.',
                null,
                422
            );
        }

        $hrProfile = auth()->user()->employeeProfile;
        if (!$hrProfile) {
            return $this->errorResponse(
                'Authenticated user does not have an employee profile.',
                null,
                403
            );
        }

        $cycle->update([
            'status'      => 'active',
            'approved_by' => $hrProfile->id,
            'approved_at' => now(),
        ]);

        return $this->successResponse(
            $this->formatCycle($cycle->fresh(['template'])),
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
    // إغلاق كافة الدورات النشطة التي انتهى تاريخها وتشغيل الحساب
    // POST /performance/cycles/process-expired
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function processExpired(): JsonResponse
    {
        $expiredCycles = PerformanceCycle::where('status', 'active')
            ->where('end_date', '<', now()->toDateString())
            ->get();

        if ($expiredCycles->isEmpty()) {
            return $this->successResponse([], 'No expired active cycles found.');
        }

        foreach ($expiredCycles as $cycle) {
            $cycle->update(['status' => 'processing']);
            ProcessPerformanceJob::dispatch($cycle);
        }

        return $this->successResponse(
            $expiredCycles->pluck('id'),
            'Expired cycles have been moved to processing. Performance scoring jobs dispatched.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Helper — تنسيق بيانات الدورة للـ response
    // ─────────────────────────────────────────────────────────────
    private function formatCycle(PerformanceCycle $cycle): array
    {
        $template = $cycle->template;
        $components = $template ? ($template->components ?? []) : [];

        $formattedComponents = [];
        foreach ($components as $key => $component) {
            $formattedComponents[] = [
                'component_key' => $key,
                'weight'        => is_array($component) ? ($component['weight'] ?? 0) : $component,
                'is_active'     => is_array($component) ? ($component['is_active'] ?? true) : true,
                'sub_components'=> is_array($component) ? ($component['sub_components'] ?? ($component['sub_weights'] ?? null)) : null,
            ];
        }

        return [
            'id'               => $cycle->id,
            'title'            => $cycle->title,
            'start_date'       => $cycle->start_date?->format('Y-m-d'),
            'end_date'         => $cycle->end_date?->format('Y-m-d'),
            'status'           => $cycle->status,
            'template_name'    => $template ? $template->name : null,
            'created_by'       => $cycle->creator ? [
                'id'   => $cycle->creator->id,
                'name' => $cycle->creator->full_name,
            ] : null,
            'approved_by'      => $cycle->approver ? [
                'id'   => $cycle->approver->id,
                'name' => $cycle->approver->full_name,
            ] : null,
            'approved_at'      => $cycle->approved_at?->format('Y-m-d H:i:s'),
            'components'       => $formattedComponents,
            'components_count' => count($formattedComponents),
            'weights_valid'    => $cycle->areWeightsValid(),
            'created_at'       => $cycle->created_at?->format('Y-m-d H:i:s'),
        ];
    }

    /**
     * تشغيل التفعيل والإغلاق تلقائيًا عند استدعاء أي endpoint للـ cycles.
     * يغيّر الدورات ذات الحالة "draft" إلى "active" عندما يساوي أو يتجاوز تاريخ البدء.
     * يغيّر الدورات ذات الحالة "active" إلى "processing" عندما يتجاوز تاريخ الانتهاء
     * ويُرسل مهمة ProcessPerformanceJob لحساب الدرجات.
     */
    private function autoUpdateCycles(): void
    {
        // تفعيل تلقائي للدورات في وضع draft
        PerformanceCycle::where('status', 'draft')
            ->whereDate('start_date', '<=', now()->toDateString())
            ->update(['status' => 'active']);

        // إغلاق تلقائي للدورات التي انتهت
        $expired = PerformanceCycle::where('status', 'active')
            ->whereDate('end_date', '<', now()->toDateString())
            ->get();

        foreach ($expired as $cycle) {
            $cycle->update(['status' => 'processing']);
            ProcessPerformanceJob::dispatch($cycle);
        }
    }
}

