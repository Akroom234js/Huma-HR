<?php

namespace App\Http\Controllers;

use App\Models\PerformanceTemplate;
use App\Models\PerformanceCycle;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PerformanceTemplateController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────────────────────
    // عرض القالب النشط الحالي
    // GET /performance/templates
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        $template = PerformanceTemplate::where('is_active', true)->first();

        if (! $template) {
            return $this->successResponse(null, 'No active template found.');
        }

        return $this->successResponse(
            $this->formatTemplate($template),
            'Active performance template retrieved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // إنشاء قالب جديد وتفعيله تلقائياً
    // POST /performance/templates
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'                    => ['required', 'string', 'max:100'],
            'components'              => ['required', 'array', 'min:1'],
            'components.*.key'        => ['required', 'string', 'in:tasks,manager,peer,attendance,overtime,self_assessment'],
            'components.*.weight'     => ['required', 'numeric', 'min:1', 'max:100'],
            // المكونات الفرعية — اختيارية
            'components.*.sub_components'=> ['sometimes', 'array'],
        ]);

        // التحقق من أن مجموع الأوزان = 100
        $total = collect($validated['components'])->sum('weight');
        if (round($total, 2) !== 100.00) {
            return $this->errorResponse(
                "Component weights must sum to 100. Current sum: {$total}.",
                null,
                422
            );
        }

        // التحقق من عدم تكرار المكونات
        $keys = collect($validated['components'])->pluck('key');
        if ($keys->count() !== $keys->unique()->count()) {
            return $this->errorResponse('Duplicate component keys are not allowed.', null, 422);
        }

        $template = DB::transaction(function () use ($validated) {
            // تعطيل القالب النشط الحالي
            PerformanceTemplate::where('is_active', true)->update(['is_active' => false]);

            // بناء الـ components JSON
            $components = [];
            foreach ($validated['components'] as $comp) {
                $components[$comp['key']] = [
                    'weight'         => $comp['weight'],
                    'sub_components' => $comp['sub_components'] ?? $this->defaultSubWeights($comp['key']),
                ];
            }

            return PerformanceTemplate::create([
                'name'       => $validated['name'],
                'is_active'  => true,
                'components' => $components,
            ]);
        });

        return $this->successResponse(
            $this->formatTemplate($template),
            'Performance template created and activated successfully.',
            201
        );
    }

    // ─────────────────────────────────────────────────────────────
    // تعديل القالب النشط
    // PUT /performance/templates/{template}
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function update(Request $request, PerformanceTemplate $template): JsonResponse
    {
        $validated = $request->validate([
            'name'                      => ['sometimes', 'string', 'max:100'],
            'components'                => ['sometimes', 'array', 'min:1'],
            'components.*.key'          => ['required_with:components', 'string', 'in:tasks,manager,peer,attendance,overtime,self_assessment'],
            'components.*.weight'       => ['required_with:components', 'numeric', 'min:1', 'max:100'],
            'components.*.sub_components'=> ['sometimes', 'array'],
        ]);

        // التحقق من الأوزان إذا أُرسلت مكونات
        if (isset($validated['components'])) {
            $total = collect($validated['components'])->sum('weight');
            if (round($total, 2) !== 100.00) {
                return $this->errorResponse(
                    "Component weights must sum to 100. Current sum: {$total}.",
                    null,
                    422
                );
            }

            $keys = collect($validated['components'])->pluck('key');
            if ($keys->count() !== $keys->unique()->count()) {
                return $this->errorResponse('Duplicate component keys are not allowed.', null, 422);
            }
        }

        $updateData = [];

        if (isset($validated['name'])) {
            $updateData['name'] = $validated['name'];
        }

        if (isset($validated['components'])) {
            $components = [];
            foreach ($validated['components'] as $comp) {
                $components[$comp['key']] = [
                    'weight'         => $comp['weight'],
                    'sub_components' => $comp['sub_components'] ?? $this->defaultSubWeights($comp['key']),
                ];
            }
            $updateData['components'] = $components;
        }

        $template->update($updateData);

        return $this->successResponse(
            $this->formatTemplate($template->fresh()),
            'Performance template updated successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // حذف قالب — ممنوع إذا مستخدم في دورات
    // DELETE /performance/templates/{template}
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function destroy(PerformanceTemplate $template): JsonResponse
    {
        // منع حذف قالب مستخدم في دورات
        $usedInCycles = PerformanceCycle::where('performance_template_id', $template->id)->exists();

        if ($usedInCycles) {
            return $this->errorResponse(
                'Cannot delete a template that is used in cycles.',
                null,
                422
            );
        }

        $template->delete();

        return $this->successResponse(null, 'Performance template deleted successfully.');
    }

    // ─────────────────────────────────────────────────────────────
    // Helper — أوزان فرعية افتراضية لكل مكوّن
    // ─────────────────────────────────────────────────────────────
    private function defaultSubWeights(string $key): array
    {
        return match ($key) {
            'tasks'   => ['completion' => 60, 'quality' => 40],
            'manager' => ['professionalism' => 34, 'responsibility' => 33, 'problem_solving' => 33],
            'peer'    => ['collaboration' => 50, 'teamwork' => 50],
            default   => [],
        };
    }

    // ─────────────────────────────────────────────────────────────
    // Helper — تنسيق القالب للـ response
    // ─────────────────────────────────────────────────────────────
    private function formatTemplate(PerformanceTemplate $template): array
    {
        $components = $template->components ?? [];

        $formatted = [];
        foreach ($components as $key => $data) {
            $formatted[] = [
                'key'            => $key,
                'weight'         => $data['weight'],
                'sub_components' => $data['sub_components'] ?? [],
            ];
        }

        return [
            'id'         => $template->id,
            'name'       => $template->name,
            'is_active'  => $template->is_active,
            'components' => $formatted,
            'total_weight' => collect($components)->sum('weight'),
            'created_at' => $template->created_at?->format('Y-m-d H:i:s'),
            'updated_at' => $template->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
