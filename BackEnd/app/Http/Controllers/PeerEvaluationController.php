<?php

namespace App\Http\Controllers;

use App\Models\PerformanceCycle;
use App\Models\EmployeeProfile;
use App\Services\PeerEvaluationService;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Symfony\Component\HttpFoundation\Response;

class PeerEvaluationController extends Controller
{
    protected $service;

    public function __construct(PeerEvaluationService $service)
    {
        $this->service = $service;
    }

    /**
     * Store a new peer evaluation.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'performance_cycle_id' => 'required|integer|exists:performance_cycles,id',
            'employee_profile_id'  => 'required|integer|exists:employee_profiles,id',
            'collaboration_score' => ['required', 'integer', 'between:0,10'],
            'teamwork_score'      => ['required', 'integer', 'between:0,10'],
            'comment'              => 'required|string|max:2000',
        ]);

        $evaluatorId = auth()->id();

        $evaluation = $this->service->storeEvaluation(
            $validated['performance_cycle_id'],
            $validated['employee_profile_id'],
            $evaluatorId,
            $validated['collaboration_score'],
            $validated['teamwork_score'],
            $validated['comment']
        );

        return response()->json([
            'message' => 'تم حفظ تقييم الزميل بنجاح.',
            'evaluation_id' => $evaluation->id,
        ], Response::HTTP_CREATED);
    }

    /**
     * Show aggregated peer score for an employee in a given cycle.
     * Optional query param `include_comments=1` returns decrypted comments (HR only).
     */
    public function show($cycleId, $employeeProfileId, Request $request)
    {
        // تأكيد وجود الدورة والموظف
        PerformanceCycle::findOrFail($cycleId);
        EmployeeProfile::findOrFail($employeeProfileId);

        $score = $this->service->calculateWeightedPeerScore($cycleId, $employeeProfileId);

        $response = [
            'peer_score' => $score, // من 0 إلى 100
            'component_weight' => config('peer_evaluation.weight'),
        ];

        if ($request->boolean('include_comments')) {
            // عرض التعليقات تحتاج صلاحية HR فقط (middleware already applied)
            $response['comments'] = $this->service->getDecryptedComments($cycleId, $employeeProfileId);
        }

        return response()->json($response);
    }
}
?>
