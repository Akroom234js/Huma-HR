<?php

namespace App\Http\Controllers;

use App\Models\PerformanceEvaluation;
use App\Services\PerformanceOrchestrationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PerformanceEvaluationController extends Controller
{
    protected $orchestrationService;

    public function __construct(PerformanceOrchestrationService $orchestrationService)
    {
        $this->orchestrationService = $orchestrationService;
    }

    /**
     * Compute and store the performance evaluation for a given cycle and employee.
     */
    public function store(Request $request, int $cycleId, int $employeeId)
    {
        // Basic validation (cycle and employee existence can be checked via services)
        $validator = Validator::make($request->all(), []);
        $validator->validate();

        $evaluation = $this->orchestrationService->evaluate($cycleId, $employeeId);
        return response()->json($evaluation, 201);
    }

    /**
     * Retrieve the stored performance evaluation.
     */
    public function show(int $cycleId, int $employeeId)
    {
        $evaluation = PerformanceEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeId)
            ->firstOrFail();
        return response()->json($evaluation);
    }
}

?>
