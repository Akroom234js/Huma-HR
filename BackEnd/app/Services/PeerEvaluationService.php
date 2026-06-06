<?php

namespace App\Services;

use App\Models\PeerEvaluation;
use App\Models\PerformanceCycle;
use App\Models\EmployeeProfile;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class PeerEvaluationService
{
    /**
     * Generate a deterministic anonymous token for a given evaluator and cycle.
     * Uses HMAC‑SHA256 with the secret salt stored in env('PEER_EVAL_SALT').
     */
    public function generateAnonymousToken(int $evaluatorId, int $cycleId): string
    {
        $salt = config('peer_eval.salt');
        $data = $evaluatorId . ':' . $cycleId;
        return hash('sha256', $data . ':' . $salt);
    }

    /**
     * Encrypt a plain‑text comment using AES‑256‑CBC.
     * Returns an array with `encrypted` (base64) and `iv` (binary stored as base64).
     */
    public function encryptComment(string $plain): array
    {
        $key = hash('sha256', config('peer_eval.salt'), true); // 32‑byte key
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
        $key = hash('sha256', config('peer_eval.salt'), true);
        $iv = base64_decode($ivBase64);
        $encrypted = base64_decode($encryptedBase64);
        $decrypted = openssl_decrypt($encrypted, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);
        return $decrypted ?: '';
    }

    /**
     * Store a peer evaluation ensuring one‑time submission per evaluator per cycle.
     */
    public function storeEvaluation(int $cycleId, int $evaluatorId, int $evaluateeId, int $collaborationScore, int $teamworkScore, string $comment): PeerEvaluation
    {
        // Generate token hash (unique per evaluator+cycle)
        $token = $this->generateAnonymousToken($evaluatorId, $cycleId);

        // Prevent duplicate submission
        $exists = PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $evaluateeId)
            ->where('token_hash', $token)
            ->exists();
        if ($exists) {
            throw new \Exception('Evaluator has already submitted for this employee in this cycle.');
        }

        // Encrypt comment
        $enc = $this->encryptComment($comment);

        return PeerEvaluation::create([
            'performance_cycle_id' => $cycleId,
            'employee_profile_id' => $evaluateeId,
            'token_hash'          => $token,
            'collaboration_score' => $collaborationScore,
            'teamwork_score'      => $teamworkScore,
            'encrypted_comment'   => $enc['encrypted'],
                        'iv'                  => base64_decode($enc['iv']), // store binary
        ]);
    }

    /**
     * Aggregate average score per evaluatee for a given cycle.
     */
    public function aggregateScores(int $cycleId): array
    {
        $results = PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->get()
            ->groupBy('employee_profile_id')
            ->map(function ($group) {
                $avgCollab = $group->avg('collaboration_score');
                $avgTeam   = $group->avg('teamwork_score');
                $avg = round(($avgCollab + $avgTeam) / 2, 2);
                return round($avg * 10, 2);
            })
            ->toArray();
        return $results; // [employeeId => avgScore]
    }
}
?>
