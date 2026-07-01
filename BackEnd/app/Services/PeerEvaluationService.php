<?php

namespace App\Services;

use App\Models\PeerEvaluation;
use App\Models\PerformanceCycle;
use App\Models\EmployeeProfile;

class PeerEvaluationService
{
    /**
     * Generate a deterministic anonymous token for a given evaluator, evaluatee and cycle.
     * Uses SHA256 hashing with a secret salt.
     */
    public function generateAnonymousToken(int $evaluatorUserId, int $employeeProfileId, int $cycleId): string
    {
        $salt = config('peer_eval.salt', env('PEER_EVAL_SALT', 'default_salt'));
        $data = $evaluatorUserId . ':' . $employeeProfileId . ':' . $cycleId . ':' . $salt;
        return hash('sha256', $data);
    }

    /**
     * Encrypt a plain-text comment using AES-256-CBC.
     * Returns an array with base64 encoded encrypted text and IV.
     */
    public function encryptComment(string $plain): array
    {
        $key = hash('sha256', config('peer_eval.salt', env('PEER_EVAL_SALT', 'default_salt')), true); // 32-byte key
        $iv = random_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted = openssl_encrypt($plain, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
        return [
            'encrypted' => base64_encode($encrypted),
            'iv'        => base64_encode($iv),
        ];
    }

    /**
     * Decrypt the stored comment.
     */
    public function decryptComment(string $encryptedBase64, string $ivBase64): string
    {
        $key = hash('sha256', config('peer_eval.salt', env('PEER_EVAL_SALT', 'default_salt')), true);
        $iv = base64_decode($ivBase64);
        $encrypted = base64_decode($encryptedBase64);
        $decrypted = openssl_decrypt($encrypted, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
        return $decrypted ?: '';
    }

    /**
     * Store a peer evaluation ensuring one-time submission per evaluator per colleague per cycle.
     */
    public function storeEvaluation(
        int    $cycleId,
        int    $employeeProfileId,
        int    $evaluatorUserId,
        int    $collaborationScore,
        int    $teamworkScore,
        string $comment
    ): PeerEvaluation {
        // Generate anonymous token
        $token = $this->generateAnonymousToken($evaluatorUserId, $employeeProfileId, $cycleId);

        // Prevent duplicate submission
        if (PeerEvaluation::where('token_hash', $token)->exists()) {
            throw new \RuntimeException('You have already evaluated this colleague in this cycle.');
        }

        // Encrypt comment
        $enc = $this->encryptComment($comment);

        return PeerEvaluation::create([
            'performance_cycle_id' => $cycleId,
            'employee_profile_id'  => $employeeProfileId,
            'token_hash'           => $token,
            'collaboration_score'  => $collaborationScore,
            'teamwork_score'       => $teamworkScore,
            'encrypted_comment'    => $enc['encrypted'],
            'iv'                   => base64_decode($enc['iv']), // store binary
        ]);
    }

    /**
     * Calculate raw peer score for a specific employee in a cycle (scaled to 100).
     */
    public function calculateRawPeerScore(int $cycleId, int $employeeProfileId): float
    {
        $evaluations = PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeProfileId)
            ->get();

        if ($evaluations->isEmpty()) {
            return 0.0;
        }

        $avgCollab = $evaluations->avg('collaboration_score');
        $avgTeam   = $evaluations->avg('teamwork_score');
        $avg = ($avgCollab + $avgTeam) / 2;
        return round($avg * 10, 2); // Scale 0-10 to 0-100
    }

    /**
     * Aggregate average score per evaluatee for a given cycle.
     */
    public function aggregateScores(int $cycleId): array
    {
        $results = PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->get()
            ->groupBy('employee_profile_id')
            ->map(function ($group) use ($cycleId) {
                return $this->calculateRawPeerScore($cycleId, $group->first()->employee_profile_id);
            })
            ->toArray();
        return $results; // [employeeId => avgScore]
    }

    /**
     * Decrypt and return all comments submitted by peers for an employee in a cycle.
     */
    public function getDecryptedComments(int $cycleId, int $employeeProfileId): array
    {
        return PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeProfileId)
            ->get()
            ->map(fn($e) => [
                'collaboration_score' => $e->collaboration_score,
                'teamwork_score'      => $e->teamwork_score,
                'comment'             => $this->decryptComment($e->encrypted_comment, base64_encode($e->iv)),
            ])
            ->toArray();
    }
}
?>
