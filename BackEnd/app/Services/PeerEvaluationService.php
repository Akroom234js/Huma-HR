<?php

namespace App\Services;

use App\Models\PeerEvaluation;
use App\Models\PerformanceCycleComponent;
use Illuminate\Support\Facades\Config;

class PeerEvaluationService
{
    // ─────────────────────────────────────────────────────────────
    // توليد anonymous token (حتمي — نفس المدخلات = نفس الـ token)
    // ─────────────────────────────────────────────────────────────
    public function generateAnonymousToken(int $evaluatorUserId, int $employeeProfileId, int $cycleId): string
    {
        $payload = $evaluatorUserId . ':' . $employeeProfileId . ':' . $cycleId . ':' . Config::get('peer_evaluation.salt');
        return hash_hmac('sha256', $payload, config('app.key'));
    }

    public function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    // ─────────────────────────────────────────────────────────────
    // تشفير التعليق
    // ─────────────────────────────────────────────────────────────
    public function encryptComment(string $plain): array
    {
        $key       = base64_decode(Config::get('peer_evaluation.aes_key'));
        $iv        = random_bytes(16);
        $encrypted = openssl_encrypt($plain, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);

        return [
            'encrypted' => base64_encode($encrypted),
            'iv'        => $iv,
        ];
    }

    public function decryptComment(string $encryptedBase64, string $iv): string
    {
        $key       = base64_decode(Config::get('peer_evaluation.aes_key'));
        $encrypted = base64_decode($encryptedBase64);
        return openssl_decrypt($encrypted, 'AES-256-CBC', $key, OPENSSL_RAW_DATA, $iv);
    }

    // ─────────────────────────────────────────────────────────────
    // حفظ تقييم زميل جديد
    // ─────────────────────────────────────────────────────────────
    public function storeEvaluation(
        int    $cycleId,
        int    $employeeProfileId,
        int    $evaluatorUserId,
        int    $collaborationScore,
        int    $teamworkScore,
        string $comment
    ): PeerEvaluation {

        $token = $this->generateAnonymousToken($evaluatorUserId, $employeeProfileId, $cycleId);
        $hash  = $this->hashToken($token);

        // منع التقييم المكرر
        if (PeerEvaluation::where('token_hash', $hash)->exists()) {
            throw new \RuntimeException('You have already evaluated this employee in this cycle.');
        }

        $enc = $this->encryptComment($comment);

        return PeerEvaluation::create([
            'performance_cycle_id' => $cycleId,
            'employee_profile_id'  => $employeeProfileId,
            'token_hash'           => $hash,
            'collaboration_score'  => $collaborationScore,
            'teamwork_score'       => $teamworkScore,
            'encrypted_comment'    => $enc['encrypted'],
            'iv'                   => $enc['iv'],
        ]);

        // ✅ حُذف syncAggregatedPeerScore — الحساب يصير في ProcessPerformanceJob
        // عند إغلاق الدورة وليس عند كل تقييم
    }

    // ─────────────────────────────────────────────────────────────
    // حساب متوسط تقييمات الزملاء لموظف في دورة (0-10)
    // ─────────────────────────────────────────────────────────────
    public function calculateEmployeePeerAverage(int $cycleId, int $employeeProfileId): float
    {
        $evaluations = PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeProfileId)
            ->get();

        if ($evaluations->isEmpty()) {
            return 0.0;
        }

        $sum = $evaluations->sum(fn($e) => ($e->collaboration_score + $e->teamwork_score) / 2);

        return round($sum / $evaluations->count(), 2);
    }

    // ─────────────────────────────────────────────────────────────
    // تحويل المتوسط (0-10) إلى درجة من 100
    // ─────────────────────────────────────────────────────────────
    public function calculateRawPeerScore(int $cycleId, int $employeeProfileId): float
    {
        return round($this->calculateEmployeePeerAverage($cycleId, $employeeProfileId) * 10, 2);
    }

    // ─────────────────────────────────────────────────────────────
    // جلب التعليقات المفككة لـ HR
    // ─────────────────────────────────────────────────────────────
    public function getDecryptedComments(int $cycleId, int $employeeProfileId): array
    {
        return PeerEvaluation::where('performance_cycle_id', $cycleId)
            ->where('employee_profile_id', $employeeProfileId)
            ->get()
            ->map(fn($e) => [
                'collaboration_score' => $e->collaboration_score,
                'teamwork_score'      => $e->teamwork_score,
                'comment'             => $this->decryptComment($e->encrypted_comment, $e->iv),
            ])
            ->toArray();
    }

    // ─────────────────────────────────────────────────────────────
    // جلب وزن مكوّن peer من الدورة
    // ─────────────────────────────────────────────────────────────
    public function getPeerComponentWeight(int $cycleId): float
    {
        $component = PerformanceCycleComponent::where('performance_cycle_id', $cycleId)
            ->where('component_key', 'peer')
            ->first();

        return $component ? (float) $component->weight : 15.0;
    }
}
