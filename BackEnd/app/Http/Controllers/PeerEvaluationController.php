<?php

namespace App\Http\Controllers;

use App\Models\PerformanceCycle;
use App\Models\EmployeeProfile;
use App\Services\PeerEvaluationService;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PeerEvaluationController extends Controller
{
    use ApiResponse;

    public function __construct(private PeerEvaluationService $service) {}

    // ─────────────────────────────────────────────────────────────
    // موظف يقيّم زميله في نفس القسم
    // POST /performance/peer-evaluations
    // ─────────────────────────────────────────────────────────────
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'performance_cycle_id' => ['required', 'integer', 'exists:performance_cycles,id'],
            'employee_profile_id'  => ['required', 'integer', 'exists:employee_profiles,id'],
            'collaboration_score'  => ['required', 'integer', 'between:0,10'],
            'teamwork_score'       => ['required', 'integer', 'between:0,10'],
            'comment'              => ['required', 'string', 'max:2000'],
        ]);

        // الدورة لازم تكون active
        $cycle = PerformanceCycle::find($validated['performance_cycle_id']);
        if ($cycle->status !== 'active') {
            return $this->errorResponse(
                'Peer evaluations can only be submitted for active cycles.',
                null,
                422
            );
        }

        $evaluatorProfile = auth()->user()->employeeProfile;
        $targetEmployee   = EmployeeProfile::find($validated['employee_profile_id']);

        // الموظف لا يقيّم نفسه
        if ($evaluatorProfile && $evaluatorProfile->id === $targetEmployee->id) {
            return $this->errorResponse('You cannot evaluate yourself.', null, 422);
        }

        // ✅ الموظف يقيّم زملاء قسمه فقط
        if ($evaluatorProfile && $evaluatorProfile->department_id !== $targetEmployee->department_id) {
            return $this->errorResponse(
                'You can only evaluate colleagues in your own department.',
                null,
                403
            );
        }

        try {
            $evaluation = $this->service->storeEvaluation(
                cycleId:            $validated['performance_cycle_id'],
                employeeProfileId:  $validated['employee_profile_id'],
                evaluatorUserId:    auth()->id(),
                collaborationScore: $validated['collaboration_score'],
                teamworkScore:      $validated['teamwork_score'],
                comment:            $validated['comment']
            );

            return $this->successResponse(
                ['evaluation_id' => $evaluation->id],
                'Peer evaluation submitted successfully.',
                201
            );

        } catch (\RuntimeException $e) {
            return $this->errorResponse($e->getMessage(), null, 409);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // HR يشوف درجة زملاء موظف + التعليقات (اختياري)
    // GET /performance/peer-evaluations/{cycleId}/{employeeProfileId}
    // HR فقط
    // ─────────────────────────────────────────────────────────────
    public function show(int $cycleId, int $employeeProfileId, Request $request): JsonResponse
    {
        PerformanceCycle::findOrFail($cycleId);
        EmployeeProfile::findOrFail($employeeProfileId);

        $rawScore = $this->service->calculateRawPeerScore($cycleId, $employeeProfileId);

        $data = [
            'employee_profile_id' => $employeeProfileId,
            'cycle_id'            => $cycleId,
            'peer_raw_score'      => $rawScore,
            'evaluations_count'   => \App\Models\PeerEvaluation::where('performance_cycle_id', $cycleId)
                ->where('employee_profile_id', $employeeProfileId)
                ->count(),
        ];

        if ($request->boolean('include_comments')) {
            $data['comments'] = $this->service->getDecryptedComments($cycleId, $employeeProfileId);
        }

        return $this->successResponse($data, 'Peer evaluation score retrieved successfully.');
    }
}
