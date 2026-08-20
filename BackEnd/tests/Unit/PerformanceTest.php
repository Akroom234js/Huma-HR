<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\User;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\PerformanceTemplate;
use App\Models\PerformanceCycle;
use App\Models\Task;
use App\Models\ManagerEvaluation;
use App\Models\PeerEvaluation;
use App\Services\TaskPerformanceService;
use App\Services\PeerEvaluationService;
use App\Services\ManagerEvaluationService;
use App\Services\PerformanceOrchestrationService;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PerformanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_performance_cycle_weight_validation(): void
    {
        $template = PerformanceTemplate::create([
            'name'       => 'Valid Weights Template',
            'is_active'  => true,
            'components' => [
                'tasks'   => ['weight' => 50, 'is_active' => true],
                'manager' => ['weight' => 30, 'is_active' => true],
                'peer'    => ['weight' => 20, 'is_active' => true],
            ],
        ]);

        $this->assertTrue($template->areWeightsValid());
    }

    public function test_peer_evaluation_anonymous_token_and_encryption(): void
    {
        $peerService = new PeerEvaluationService();

        $token1 = $peerService->generateAnonymousToken(1, 10);
        $token2 = $peerService->generateAnonymousToken(1, 10);
        $token3 = $peerService->generateAnonymousToken(2, 10);

        // Deterministic for same evaluator and cycle
        $this->assertEquals($token1, $token2);
        // Different for different evaluator
        $this->assertNotEquals($token1, $token3);

        $comment = "Excellent teamwork and initiative.";
        $encryptedData = $peerService->encryptComment($comment);
        $decrypted = $peerService->decryptComment($encryptedData['encrypted'], $encryptedData['iv']);

        $this->assertEquals($comment, $decrypted);
    }
}
