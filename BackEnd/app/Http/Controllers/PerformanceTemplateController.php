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
    // عرض جميع القوالب مع تفاصيل الدورات المرتبطة
    // GET /performance/templates
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        $templates = PerformanceTemplate::with(['cycles'])
            ->latest()
            ->get()
            ->map(fn($t) => $this->formatTemplate($t));

        return $this->successResponse(
            $templates,
            'Performance templates retrieved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // إنشاء قالب جديد
    // POST /performance/templates
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $name = $request->input('name');
        if (! $name) {
            return $this->errorResponse('Template name is required.', null, 422);
        }

        $rawComponents = $request->input('components') ?? $request->input('config.components');
        if (! $rawComponents) {
            return $this->errorResponse('Components are required.', null, 422);
        }

        // بناء وتوحيد components JSON
        $components = [];
        if (is_array($rawComponents)) {
            if (! isset($rawComponents[0])) {
                foreach ($rawComponents as $key => $comp) {
                    $components[$key] = [
                        'weight'      => is_array($comp) ? floatval($comp['weight'] ?? 0) : floatval($comp),
                        'is_active'   => is_array($comp) ? (bool) ($comp['is_active'] ?? true) : true,
                        'sub_weights' => is_array($comp) ? ($comp['sub_weights'] ?? ($comp['sub_components'] ?? $this->defaultSubWeights($key))) : $this->defaultSubWeights($key),
                    ];
                }
            } else {
                foreach ($rawComponents as $comp) {
                    $key = $comp['key'] ?? $comp['component_key'];
                    $components[$key] = [
                        'weight'      => floatval($comp['weight'] ?? 0),
                        'is_active'   => (bool) ($comp['is_active'] ?? true),
                        'sub_weights' => $comp['sub_weights'] ?? ($comp['sub_components'] ?? $this->defaultSubWeights($key)),
                    ];
                }
            }
        }

        // حساب مجموع أوزان المكونات النشطة فقط
        $total = collect($components)->filter(function ($c) {
            if (! is_array($c)) return true;
            $isActive = $c['is_active'] ?? true;
            return filter_var($isActive, FILTER_VALIDATE_BOOLEAN);
        })->sum(fn($c) => is_array($c) ? floatval($c['weight'] ?? 0) : floatval($c));

        if (abs($total - 100) > 0.05) {
            return $this->errorResponse("Component weights must sum to 100. Current active components sum: {$total}.", null, 422);
        }

        $template = DB::transaction(function () use ($name, $components, $request) {
            $isDefault = $request->boolean('is_default') || $request->boolean('is_active');
            if ($isDefault) {
                PerformanceTemplate::where('is_active', true)->update(['is_active' => false]);
            }

            return PerformanceTemplate::create([
                'name'       => $name,
                'is_active'  => $isDefault,
                'components' => $components,
            ]);
        });

        return $this->successResponse(
            $this->formatTemplate($template->load('cycles')),
            'Performance template created successfully.',
            201
        );
    }

    // ─────────────────────────────────────────────────────────────
    // تعديل قالب
    // PUT /performance/templates/{template}
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function update(Request $request, PerformanceTemplate $template): JsonResponse
    {
        $updateData = [];

        if ($request->has('name')) {
            $updateData['name'] = $request->input('name');
        }

        $rawComponents = $request->input('components') ?? $request->input('config.components');
        if ($rawComponents) {
            $components = [];
            if (is_array($rawComponents)) {
                if (! isset($rawComponents[0])) {
                    foreach ($rawComponents as $key => $comp) {
                        $components[$key] = [
                            'weight'      => is_array($comp) ? floatval($comp['weight'] ?? 0) : floatval($comp),
                            'is_active'   => is_array($comp) ? (bool) ($comp['is_active'] ?? true) : true,
                            'sub_weights' => is_array($comp) ? ($comp['sub_weights'] ?? ($comp['sub_components'] ?? $this->defaultSubWeights($key))) : $this->defaultSubWeights($key),
                        ];
                    }
                } else {
                    foreach ($rawComponents as $comp) {
                        $key = $comp['key'] ?? $comp['component_key'];
                        $components[$key] = [
                            'weight'      => floatval($comp['weight'] ?? 0),
                            'is_active'   => (bool) ($comp['is_active'] ?? true),
                            'sub_weights' => $comp['sub_weights'] ?? ($comp['sub_components'] ?? $this->defaultSubWeights($key)),
                        ];
                    }
                }
            }

            // حساب مجموع أوزان المكونات النشطة فقط
            $total = collect($components)->filter(function ($c) {
                if (! is_array($c)) return true;
                $isActive = $c['is_active'] ?? true;
                return filter_var($isActive, FILTER_VALIDATE_BOOLEAN);
            })->sum(fn($c) => is_array($c) ? floatval($c['weight'] ?? 0) : floatval($c));

            if (abs($total - 100) > 0.05) {
                return $this->errorResponse("Component weights must sum to 100. Current active components sum: {$total}.", null, 422);
            }
            $updateData['components'] = $components;
        }

        if ($request->has('is_default') || $request->has('is_active')) {
            $isDefault = $request->boolean('is_default') || $request->boolean('is_active');
            if ($isDefault) {
                PerformanceTemplate::where('id', '!=', $template->id)->update(['is_active' => false]);
            }
            $updateData['is_active'] = $isDefault;
        }

        $template->update($updateData);

        return $this->successResponse(
            $this->formatTemplate($template->fresh(['cycles'])),
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
                'key'         => $key,
                'weight'      => is_array($data) ? ($data['weight'] ?? 0) : $data,
                'is_active'   => is_array($data) ? ($data['is_active'] ?? true) : true,
                'sub_weights' => is_array($data) ? ($data['sub_weights'] ?? ($data['sub_components'] ?? [])) : [],
            ];
        }

        $cycles = $template->cycles ?? collect();
        $activeCycle = $cycles->firstWhere('status', 'active');

        return [
            'id'             => $template->id,
            'name'           => $template->name,
            'is_active'      => (bool) $template->is_active,
            'is_default'     => (bool) $template->is_active,
            'components'     => $formatted,
            'raw_components' => $components,
            'total_weight'   => collect($formatted)->where('is_active', true)->sum('weight'),
            'cycles_count'   => $cycles->count(),
            'active_cycle'   => $activeCycle ? [
                'id'         => $activeCycle->id,
                'title'      => $activeCycle->title,
                'status'     => $activeCycle->status,
                'start_date' => $activeCycle->start_date?->format('Y-m-d'),
                'end_date'   => $activeCycle->end_date?->format('Y-m-d'),
            ] : null,
            'cycles'         => $cycles->map(fn($c) => [
                'id'         => $c->id,
                'title'      => $c->title,
                'status'     => $c->status,
                'start_date' => $c->start_date?->format('Y-m-d'),
                'end_date'   => $c->end_date?->format('Y-m-d'),
            ]),
            'created_at'     => $template->created_at?->format('Y-m-d H:i:s'),
            'updated_at'     => $template->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
