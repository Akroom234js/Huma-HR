<?php

namespace App\Http\Controllers;

use App\Models\ManagerEvaluation;
use App\Models\EmployeeProfile;
use App\Models\PerformanceCycle;
use App\Http\Requests\StoreManagerEvaluationRequest;
use App\Http\Requests\UpdateManagerEvaluationRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;

class ManagerEvaluationController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────────────────────
    // مدير يقيّم موظف في دورة
    // POST /performance/manager-evaluations
    // manager, department_manager, boss, hr
    // ─────────────────────────────────────────────────────────────
    public function store(StoreManagerEvaluationRequest $request): JsonResponse
    {
        // منع التكرار — مدير واحد = تقييم واحد لنفس الموظف في نفس الدورة
        $exists = ManagerEvaluation::where('performance_cycle_id', $request->performance_cycle_id)
            ->where('employee_profile_id', $request->employee_profile_id)
            ->exists();

        if ($exists) {
            return $this->errorResponse(
                'An evaluation already exists for this employee in this cycle.',
                null,
                409
            );
        }

        // average_score و final_score يُحسبان تلقائياً في الـ Model boot
        $evaluation = ManagerEvaluation::create([
            'performance_cycle_id' => $request->performance_cycle_id,
            'employee_profile_id'  => $request->employee_profile_id,
            'manager_user_id'      => auth()->id(),
            'professionalism'      => $request->professionalism,
            'responsibility'       => $request->responsibility,
            'problem_solving'      => $request->problem_solving,
        ]);

        return $this->successResponse(
            $this->formatEvaluation($evaluation->load(['performanceCycle', 'employeeProfile'])),
            'Manager evaluation submitted successfully.',
            201
        );
    }

    // ─────────────────────────────────────────────────────────────
    // مدير يعدّل تقييمه
    // PUT /performance/manager-evaluations/{managerEvaluation}
    // نفس المدير الذي قدّم التقييم + الدورة active
    // ─────────────────────────────────────────────────────────────
    public function update(UpdateManagerEvaluationRequest $request, ManagerEvaluation $managerEvaluation): JsonResponse
    {
        $managerEvaluation->update($request->only([
            'professionalism',
            'responsibility',
            'problem_solving',
            'notes',
        ]));

        // average_score و final_score يُعاد حسابهما تلقائياً في boot

        return $this->successResponse(
            $this->formatEvaluation($managerEvaluation->fresh(['performanceCycle', 'employeeProfile'])),
            'Manager evaluation updated successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // HR يشوف تقييم موظف في دورة
    // GET /performance/manager-evaluations/{cycleId}/{employeeId}
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function show(int $cycleId, int $employeeId): JsonResponse
    {
        PerformanceCycle::findOrFail($cycleId);
        EmployeeProfile::findOrFail($employeeId);

        $evaluation = ManagerEvaluation::with(['performanceCycle', 'employeeProfile', 'manager'])
            ->where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeId)
            ->first();

        if (! $evaluation) {
            return $this->errorResponse(
                'No manager evaluation found for this employee in this cycle.',
                null,
                404
            );
        }

        return $this->successResponse(
            $this->formatEvaluation($evaluation),
            'Manager evaluation retrieved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // مدير يشوف قائمة موظفيه + هل قيّم كل واحد
    // GET /performance/manager-evaluations/my-team/{cycleId}
    // manager, department_manager, boss
    // ─────────────────────────────────────────────────────────────
    public function myTeam(int $cycleId): JsonResponse
    {
        PerformanceCycle::findOrFail($cycleId);

        $managerProfile = auth()->user()->employeeProfile;

        if (! $managerProfile) {
            return $this->errorResponse('Manager profile not found.', null, 404);
        }

        // جلب كل موظفي القسم (عدا المدير نفسه)
        $teamMembers = EmployeeProfile::where('department_id', $managerProfile->department_id)
            ->where('id', '!=', $managerProfile->id)
            ->where('employment_status', 'active')
            ->get();

        // جلب التقييمات الموجودة لهذه الدورة
        $existingEvaluations = ManagerEvaluation::where('performance_cycle_id', $cycleId)
            ->whereIn('employee_profile_id', $teamMembers->pluck('id'))
            ->get()
            ->keyBy('employee_profile_id');

        $result = $teamMembers->map(function ($member) use ($existingEvaluations, $cycleId) {
            $evaluation = $existingEvaluations->get($member->id);

            return [
                'employee' => [
                    'id'        => $member->id,
                    'name'      => $member->full_name,
                    'job_title' => $member->job_title,
                ],
                'evaluated'    => ! is_null($evaluation),
                'evaluation'   => $evaluation ? [
                    'id'            => $evaluation->id,
                    'professionalism' => $evaluation->professionalism,
                    'responsibility'  => $evaluation->responsibility,
                    'problem_solving' => $evaluation->problem_solving,
                    'average_score'   => $evaluation->average_score,
                    'final_score'     => $evaluation->final_score,
                    'submitted_at'    => $evaluation->created_at?->format('Y-m-d H:i:s'),
                ] : null,
            ];
        });

        $evaluated   = $result->where('evaluated', true)->count();
        $total       = $result->count();
        $remaining   = $total - $evaluated;

        return $this->successResponse(
            [
                'cycle_id'  => $cycleId,
                'summary'   => [
                    'total'     => $total,
                    'evaluated' => $evaluated,
                    'remaining' => $remaining,
                ],
                'team'      => $result->values(),
            ],
            'Team evaluations retrieved successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Helper — تنسيق بيانات التقييم للـ response
    // ─────────────────────────────────────────────────────────────
    private function formatEvaluation(ManagerEvaluation $evaluation): array
    {
        return [
            'id'                   => $evaluation->id,
            'performance_cycle'    => $evaluation->performanceCycle ? [
                'id'    => $evaluation->performanceCycle->id,
                'title' => $evaluation->performanceCycle->title,
            ] : null,
            'employee'             => $evaluation->employeeProfile ? [
                'id'   => $evaluation->employeeProfile->id,
                'name' => $evaluation->employeeProfile->full_name,
            ] : null,
            'manager'              => $evaluation->manager ? [
                'id'    => $evaluation->manager->id,
                'email' => $evaluation->manager->email,
            ] : null,
            'professionalism'      => $evaluation->professionalism,
            'responsibility'       => $evaluation->responsibility,
            'problem_solving'      => $evaluation->problem_solving,
            'average_score'        => $evaluation->average_score,
            'final_score'          => $evaluation->final_score,
            'submitted_at'         => $evaluation->created_at?->format('Y-m-d H:i:s'),
            'updated_at'           => $evaluation->updated_at?->format('Y-m-d H:i:s'),
        ];
    }
}
