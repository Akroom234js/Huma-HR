<?php

namespace App\Http\Controllers;

use App\Models\PerformanceCycle;
use App\Models\PerformanceTemplate;
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
        PerformanceCycle::autoUpdateCycles();
        $user = auth()->user();

        $query = PerformanceCycle::with(['template', 'creator'])->latest();

        if (! $user->hasRole('hr', 'api') && ! $user->hasRole('admin', 'api') && ! $user->hasRole('boss', 'api')) {
            $query->where('status', '!=', 'draft');
        }

        $cycles = $query->get()->map(fn($c) => $this->formatCycle($c));

        return $this->successResponse($cycles, 'Performance cycles retrieved successfully.');
    }

    // ─────────────────────────────────────────────────────────────
    // إنشاء دورة جديدة — تستخدم القالب النشط الحالي تلقائياً
    // POST /performance/cycles
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function store(StorePerformanceCycleRequest $request): JsonResponse
    {
        $hrProfile = auth()->user()->employeeProfile;

        if (! $hrProfile) {
            return $this->errorResponse('Authenticated user does not have an employee profile.', null, 403);
        }

        // جلب القالب النشط الحالي — الدورة تحفظ نسخة منه (لا تتأثر بتغييرات لاحقة)
        $activeTemplate = PerformanceTemplate::getActive();

        if (! $activeTemplate) {
            return $this->errorResponse('No active performance template found. Please create one first.', null, 422);
        }

        $cycle = DB::transaction(function () use ($request, $hrProfile, $activeTemplate) {
            return PerformanceCycle::create([
                'title'                   => $request->title,
                'performance_template_id' => $activeTemplate->id,
                'start_date'              => $request->start_date,
                'end_date'                => $request->end_date,
                'status'                  => 'draft',
                'created_by'              => $hrProfile->id,
            ])->load(['template', 'creator']);
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
        PerformanceCycle::autoUpdateCycles();
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
        if ($cycle->status !== 'draft') {
            return $this->errorResponse('Only draft cycles can be updated.', null, 422);
        }

        // ✅ تهيئة دائمة كمصفوفة فاضية — لا تفشل أبداً حتى لو كل القيم null
        $updateData = array_filter([
            'title'      => $request->title,
            'start_date' => $request->start_date,
            'end_date'   => $request->end_date,
        ], fn($v) => ! is_null($v));

        if (! empty($updateData)) {
            $cycle->update($updateData);
        }

        return $this->successResponse(
            $this->formatCycle($cycle->fresh(['template', 'creator'])),
            'Performance cycle updated successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // تفعيل الدورة يدوياً (draft → active)
    // POST /performance/cycles/{cycle}/activate
    // HR فقط — اختياري، لأن autoUpdateCycles بيعمل نفس الشي تلقائياً
    // ─────────────────────────────────────────────────────────────
    public function activate(PerformanceCycle $cycle): JsonResponse
    {
        if ($cycle->status !== 'draft') {
            return $this->errorResponse('Only draft cycles can be activated.', null, 422);
        }

        if (! $cycle->areWeightsValid()) {
            return $this->errorResponse('Cannot activate cycle: template weights do not sum to 100.', null, 422);
        }

        $hrProfile = auth()->user()->employeeProfile;

        if (! $hrProfile) {
            return $this->errorResponse('Authenticated user does not have an employee profile.', null, 403);
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
    // إغلاق الدورة يدوياً وتشغيل حساب الأداء في الخلفية
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
    // ✅ يقرأ من $template->components مباشرة (مش config)
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
            'id'                => $cycle->id,
            'title'             => $cycle->title,
            'start_date'        => $cycle->start_date?->format('Y-m-d'),
            'end_date'          => $cycle->end_date?->format('Y-m-d'),
            'status'            => $cycle->status,
            'template_name'     => $template?->name,
            'created_by'        => $cycle->creator ? [
                'id'   => $cycle->creator->id,
                'name' => $cycle->creator->full_name,
            ] : null,
            'approved_by'       => $cycle->approver ? [
                'id'   => $cycle->approver->id,
                'name' => $cycle->approver->full_name,
            ] : null,
            'approved_at'       => $cycle->approved_at?->format('Y-m-d H:i:s'),
            'components'        => $formattedComponents,
            'components_count'  => count($formattedComponents),
            'weights_valid'     => $cycle->areWeightsValid(),
            'created_at'        => $cycle->created_at?->format('Y-m-d H:i:s'),
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
