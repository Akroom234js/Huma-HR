<?php

namespace App\Services;

use App\Models\PeerEvaluation;
use App\Models\PerformanceCycleComponent;
use App\Models\PerformanceEvaluation;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\DB;

class PeerEvaluationService
{
    /** ---------------------------------------------------------------
     *  Generate anonymous token (deterministic) for evaluator+cycle.
     * --------------------------------------------------------------- */
    public function generateAnonymousToken(int $evaluatorUserId, int $employeeProfileId, int $cycleId): string
    {
        $payload = $evaluatorUserId . ':' . $employeeProfileId . ':' . $cycleId . ':' . Config::get('peer_evaluation.salt');
        // HMAC with application key for extra entropy
        return hash_hmac('sha256', $payload, config('app.key'));
    }

    /** ---------------------------------------------------------------
     *  Hash token for DB storage / uniqueness check.
     * --------------------------------------------------------------- */
    public function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /** ---------------------------------------------------------------
     *  Encrypt textual comment using AES-256-CBC.
     * --------------------------------------------------------------- */
    public function encryptComment(string $plain): array
    {
        $key    = base64_decode(Config::get('peer_evaluation.aes_key'));
        $iv     = random_bytes(16); // 128‑bit IV
        $cipher = 'AES-256-CBC';
        $encrypted = openssl_encrypt($plain, $cipher, $key, OPENSSL_RAW_DATA, $iv);
        return [
            'encrypted' => base64_encode($encrypted),
            'iv'        => $iv,
        ];
    }

    /** ---------------------------------------------------------------
     *  Decrypt comment.
     * --------------------------------------------------------------- */
    public function decryptComment(string $encryptedBase64, string $iv): string
    {
        $key    = base64_decode(Config::get('peer_evaluation.aes_key'));
        $cipher = 'AES-256-CBC';
        $encrypted = base64_decode($encryptedBase64);
        return openssl_decrypt($encrypted, $cipher, $key, OPENSSL_RAW_DATA, $iv);
    }

    /** ---------------------------------------------------------------
     *  Store a new Peer Evaluation.
     * --------------------------------------------------------------- */
    public function storeEvaluation(
        int $cycleId,
        int $employeeProfileId,
        int $evaluatorUserId,
        int $collaborationScore,
        int $teamworkScore,
        string $comment
    ): PeerEvaluation {
        $token = $this->generateAnonymousToken($evaluatorUserId, $employeeProfileId, $cycleId);
        $hash  = $this->hashToken($token);

        // Prevent duplicate evaluation for same employee in same cycle
        if (PeerEvaluation::where('token_hash', $hash)->exists()) {
            throw new \RuntimeException('تم تقييم هذا الموظف مسبقًا من قبل هذا الزميل في هذه الدورة.');
        }

        $enc = $this->encryptComment($comment);

        $peer = PeerEvaluation::create([
            'performance_cycle_id' => $cycleId,
            'employee_profile_id'  => $employeeProfileId,
            'token_hash'           => $hash,
            'collaboration_score' => $collaborationScore,
            'teamwork_score'      => $teamworkScore,
            'encrypted_comment'   => $enc['encrypted'],
            'iv'                  => $enc['iv'],
        ]);

        // After persisting, update the aggregated peer component score in
        // the PerformanceEvaluation snapshot (if it exists) or create it.
        $this->syncAggregatedPeerScore($cycleId, $employeeProfileId);

        return $peer;
    }

    /** ---------------------------------------------------------------
     *  Compute average peer score (0‑10) for a given employee & cycle.
     * --------------------------------------------------------------- */
    public function calculateEmployeePeerAverage(int $cycleId, int $employeeProfileId): float
    {
        $evaluations = PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeProfileId)
            ->get();

        if ($evaluations->isEmpty()) {
            return 0.0;
        }

        $sum = $evaluations->reduce(function ($carry, $item) {
            return $carry + $item->average_score; // accessor defined in model
        }, 0);

        return round($sum / $evaluations->count(), 2);
    }

    /** ---------------------------------------------------------------
     *  Retrieve weight for the "peer" component from the cycle.
     *  Falls back to config weight (15) if not defined.
     * --------------------------------------------------------------- */
    public function getPeerComponentWeight(int $cycleId): float
    {
        $component = PerformanceCycleComponent::where('performance_cycle_id', $cycleId)
            ->where('component_key', 'peer')
            ->first();
        return $component ? (float) $component->weight : (float) config('peer_evaluation.weight');
    }

    /** ---------------------------------------------------------------
     *  Calculate weighted peer score (0‑100) using component weight.
     * --------------------------------------------------------------- */
    public function calculateWeightedPeerScore(int $cycleId, int $employeeProfileId): float
    {
        $average = $this->calculateEmployeePeerAverage($cycleId, $employeeProfileId); // 0‑10
        $rawScore = $average * 10; // 0‑100 raw peer component score
        $weight   = $this->getPeerComponentWeight($cycleId) / 100; // e.g. 0.15
        return round($rawScore * $weight, 2);
    }

    /** ---------------------------------------------------------------
     *  Sync aggregated peer score into PerformanceEvaluation table.
     *  This method either creates a new PerformanceEvaluation row for the
     *  "peer" component or updates the existing one.
     * --------------------------------------------------------------- */
    protected function syncAggregatedPeerScore(int $cycleId, int $employeeProfileId): void
    {
        $weightedScore = $this->calculateWeightedPeerScore($cycleId, $employeeProfileId);

        // Find (or create) the snapshot for this employee & cycle.
        $evaluation = PerformanceEvaluation::firstOrCreate(
            [
                'performance_cycle_id' => $cycleId,
                'employee_profile_id'    => $employeeProfileId,
            ],
            ['snapshot' => []] // placeholder; actual columns may differ
        );

        // Store the peer component score as part of the snapshot array.
        $snapshot = $evaluation->snapshot ?? [];
        $snapshot['peer'] = $weightedScore;
        $evaluation->snapshot = $snapshot;
        $evaluation->save();
    }

    /** ---------------------------------------------------------------
     *  Retrieve decrypted comments for HR view.
     * --------------------------------------------------------------- */
    public function getDecryptedComments(int $cycleId, int $employeeProfileId): array
    {
        $records = PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeProfileId)
            ->get();

        return $records->map(function (PeerEvaluation $e) {
            return [
                'collaboration_score' => $e->collaboration_score,
                'teamwork_score'      => $e->teamwork_score,
                'comment'             => $this->decryptComment($e->encrypted_comment, $e->iv),
            ];
        })->toArray();
    }
}
?>
