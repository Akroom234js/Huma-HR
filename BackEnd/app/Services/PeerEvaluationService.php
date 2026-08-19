<?php

namespace App\Services;

use App\Models\PeerEvaluation;
use Illuminate\Support\Facades\Log;

class PeerEvaluationService
{
    // ─── Token & Encryption ───────────────────────────────────────

    /**
     * توليد token مجهول حتمي لكل مُقيِّم في كل دورة.
     * HMAC-SHA256(evaluatorId:cycleId:salt)
     */
    public function generateAnonymousToken(int $evaluatorUserId, int $cycleId): string
    {
        $salt = config('app.key');   // نستخدم مفتاح التطبيق كـ salt
        return hash_hmac('sha256', "{$evaluatorUserId}:{$cycleId}", $salt);
    }

    /**
     * تشفير التعليق بـ AES-256-CBC.
     * يُرجع ['encrypted' => base64, 'iv' => base64]
     */
    public function encryptComment(string $plain): array
    {
        $key       = hash('sha256', config('app.key'), true);
        $iv        = random_bytes(openssl_cipher_iv_length('aes-256-cbc'));
        $encrypted = openssl_encrypt($plain, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);

        return [
            'encrypted' => base64_encode($encrypted),
            'iv'        => base64_encode($iv),
        ];
    }

    /**
     * فكّ تشفير التعليق.
     */
    public function decryptComment(string $encryptedBase64, string $ivBase64): string
    {
        $key       = hash('sha256', config('app.key'), true);
        $iv        = base64_decode($ivBase64);
        $encrypted = base64_decode($encryptedBase64);
        $decrypted = openssl_decrypt($encrypted, 'aes-256-cbc', $key, OPENSSL_RAW_DATA, $iv);

        return $decrypted ?: '';
    }

    // ─── Store ────────────────────────────────────────────────────

    /**
     * حفظ تقييم زميل — يمنع التكرار بالـ token_hash.
     *
     * @throws \RuntimeException إذا سبق للمُقيِّم إرسال تقييم
     */
    public function storeEvaluation(
        int    $cycleId,
        int    $employeeProfileId,
        int    $evaluatorUserId,
        int    $collaborationScore,
        int    $teamworkScore,
        string $comment
    ): PeerEvaluation {
        $token = $this->generateAnonymousToken($evaluatorUserId, $cycleId);

        // منع التكرار
        $exists = PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeProfileId)
            ->where('token_hash', $token)
            ->exists();

        if ($exists) {
            throw new \RuntimeException('Evaluator has already submitted a peer evaluation for this employee in this cycle.');
        }

        $enc = $this->encryptComment($comment);

        return PeerEvaluation::create([
            'performance_cycle_id' => $cycleId,
            'employee_profile_id'  => $employeeProfileId,
            'token_hash'           => $token,
            'collaboration_score'  => $collaborationScore,
            'teamwork_score'       => $teamworkScore,
            'encrypted_comment'    => $enc['encrypted'],
            'iv'                   => base64_decode($enc['iv']),
        ]);
    }

    // ─── Scoring ─────────────────────────────────────────────────

    /**
     * الدرجة المجمّعة لموظف (من 0 إلى 100).
     * avg((collaboration + teamwork) / 2) × 10
     * تُرجع null إذا لم يكن هناك تقييمات.
     */
    public function calculateRawPeerScore(int $cycleId, int $employeeProfileId): ?float
    {
        $evaluations = PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeProfileId)
            ->get();

        if ($evaluations->isEmpty()) {
            return null;
        }

        $total = $evaluations->sum(fn($e) => ($e->collaboration_score + $e->teamwork_score) / 2);
        $avg   = $total / $evaluations->count();

        return round($avg * 10, 2);   // 0–10 → 0–100
    }

    /**
     * درجات جميع الموظفين في دورة محددة [employeeProfileId => score].
     */
    public function aggregateScores(int $cycleId): array
    {
        return PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->get()
            ->groupBy('employee_profile_id')
            ->map(function ($group) {
                $avgCollab = $group->avg('collaboration_score');
                $avgTeam   = $group->avg('teamwork_score');
                $avg       = ($avgCollab + $avgTeam) / 2;
                return round($avg * 10, 2);
            })
            ->toArray();
    }

    /**
     * جلب التعليقات المفكوكة التشفير لموظف في دورة.
     */
    public function getDecryptedComments(int $cycleId, int $employeeProfileId): array
    {
        return PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeProfileId)
            ->whereNotNull('encrypted_comment')
            ->get()
            ->map(function ($eval) {
                try {
                    $comment = $this->decryptComment(
                        $eval->encrypted_comment,
                        base64_encode($eval->iv)
                    );
                } catch (\Throwable $e) {
                    $comment = null;
                }
                return [
                    'collaboration_score' => $eval->collaboration_score,
                    'teamwork_score'      => $eval->teamwork_score,
                    'comment'             => $comment,
                ];
            })
            ->toArray();
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
