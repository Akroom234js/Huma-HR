<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * AIResumeEvaluationService — مبني على Google Gemini
 * المعادلة: 100% AI — وفي حال فشل الـ AI: 100% Keyword
 */
class AIResumeEvaluationService
{
    private string $apiKey;
    private string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }

    /**
     * التقييم الكامل — نقطة الدخول الرئيسية
     * المعادلة: 100% AI — وفي حال فشل: 100% Keyword Fallback
     */
    public function evaluateResume(
        string $resumeText,
        string $jobDescription,
    ): array {
        // نحتاج الـ keyword analysis فقط كـ Fallback في حال فشل الـ AI
        $parsingService  = app(ResumeParsingService::class);
        $keywordAnalysis = $parsingService->compareWithJobDescription(
            $resumeText,
            $jobDescription
        );

        try {
            $prompt   = $this->buildEvaluationPrompt($resumeText, $jobDescription);
            $aiResult = $this->callGeminiAPI($prompt);

            if (!($aiResult['success'] ?? false)) {
                Log::warning('AIResumeEvaluationService: Gemini failed, using 100% keyword fallback');
                return $this->buildFallbackResult($keywordAnalysis);
            }

            // ✅ النتيجة النهائية = 100% من الـ AI
            $finalScore = $aiResult['overall_score'];

            return [
                'success'             => true,
                'overall_score'       => $finalScore,
                'keyword_score'       => $keywordAnalysis['match_score'],
                'ai_score'            => $finalScore,
                'skills_match'        => $aiResult['breakdown']['skills']     ?? 0,
                'experience_match'    => $aiResult['breakdown']['experience'] ?? 0,
                'education_match'     => $aiResult['breakdown']['education']  ?? 0,
                'matched_skills'      => $keywordAnalysis['matched_skills'],
                'missing_skills'      => $keywordAnalysis['missing_skills'],
                'strengths'           => $aiResult['summary']['strengths']    ?? [],
                'weaknesses'          => $aiResult['summary']['weaknesses']   ?? [],
                'recommendation'      => $aiResult['summary']['verdict']      ?? '',
                'fit_level'           => $aiResult['fit_level']               ?? 'Low',
                'hire_recommendation' => $finalScore >= 60,
            ];

        } catch (\Exception $e) {
            Log::error('AIResumeEvaluationService: ' . $e->getMessage());
            return $this->buildFallbackResult($keywordAnalysis);
        }
    }

    /**
     * استدعاء Gemini API مباشرة عبر HTTP
     */
    private function callGeminiAPI(string $prompt): array
    {
        $url  = $this->apiUrl . '?key=' . $this->apiKey;
        $body = json_encode([
            'contents' => [
                [
                    'parts' => [['text' => $prompt]]
                ]
            ],
            'generationConfig' => [
                'temperature'     => 0.3,
                'maxOutputTokens' => 2048,
            ]
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 30,
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            Log::error("Gemini API error: HTTP {$httpCode} — Response: {$response}");
            return ['success' => false];
        }

        $data = json_decode($response, true);
        $text = $data['candidates'][0]['content']['parts'][0]['text'] ?? '';

        if (empty($text)) {
            return ['success' => false];
        }

        return $this->parseAIResponse($text);
    }

    /**
     * الـ Prompt — يرسل وصف الوظيفة + نص السيرة كاملاً
     * ويطلب من الـ AI تقييم مدى التطابق
     */
    private function buildEvaluationPrompt(
        string $resumeText,
        string $jobDescription,
    ): string {
        $resumeTextTrimmed = mb_substr($resumeText, 0, 3000, 'UTF-8');
        $jobDescTrimmed    = mb_substr($jobDescription, 0, 1500, 'UTF-8');

        return <<<PROMPT
أنت خبير ATS (Applicant Tracking System) بخبرة 15 سنة في تقييم المرشحين للوظائف التقنية.

مهمتك: قدّر مدى التطابق بين محتوى السيرة الذاتية ووصف الوظيفة التالي.

### وصف الوظيفة:
{$jobDescTrimmed}

### السيرة الذاتية للمرشح:
{$resumeTextTrimmed}

### تعليمات التقييم:
- قيّم مدى تطابق مهارات المرشح مع متطلبات الوظيفة.
- قيّم مدى تطابق خبرته ومستواه الوظيفي.
- قيّم مؤهلاته الأكاديمية والشهادات.
- إذا وجدت تقنيات مرتبطة (مثل Docker وKubernetes)، أعطِ نقاطاً جزئية.
- افهم المصطلحات التقنية بالعربي والإنجليزي على حدٍّ سواء.
- كن موضوعياً ومهنياً في تقييمك.
- لا تضيف أي نص خارج الـ JSON.

### صيغة الإجابة (JSON فقط بدون أي إضافات):
{
    "overall_score": <عدد صحيح من 0 إلى 100>,
    "breakdown": {
        "skills": <عدد صحيح من 0 إلى 100>,
        "experience": <عدد صحيح من 0 إلى 100>,
        "education": <عدد صحيح من 0 إلى 100>
    },
    "summary": {
        "strengths": ["نقطة قوة 1", "نقطة قوة 2", "نقطة قوة 3"],
        "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2"],
        "verdict": "<جملة واحدة احترافية بالتوصية>"
    },
    "fit_level": "<High|Medium|Low>"
}
PROMPT;
    }

    /**
     * تحليل رد Gemini
     */
    private function parseAIResponse(string $content): array
    {
        try {
            $content = preg_replace('/```(?:json)?\s*/i', '', $content);
            $content = preg_replace('/```\s*$/', '', trim($content));

            if (preg_match('/\{[\s\S]*\}/u', $content, $matches)) {
                $data = json_decode($matches[0], true);

                if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
                    return ['success' => false];
                }

                if (!isset($data['overall_score'])) {
                    return ['success' => false];
                }

                // تأكد إن الـ score في النطاق الصحيح
                $data['overall_score'] = max(0, min(100, (int) $data['overall_score']));

                // تأكد إن breakdown موجود
                if (!isset($data['breakdown'])) {
                    $data['breakdown'] = [
                        'skills'     => $data['overall_score'],
                        'experience' => 0,
                        'education'  => 0,
                    ];
                }

                // تأكد إن summary موجود
                if (!isset($data['summary'])) {
                    $data['summary'] = [
                        'strengths' => [],
                        'weaknesses'=> [],
                        'verdict'   => $this->generateRecommendation($data['overall_score']),
                    ];
                }

                return ['success' => true, ...$data];
            }

            return ['success' => false];

        } catch (\Exception $e) {
            Log::error('parseAIResponse error: ' . $e->getMessage());
            return ['success' => false];
        }
    }

    /**
     * Fallback — لو فشل Gemini → 100% Keyword Score
     */
    private function buildFallbackResult(array $keywordAnalysis): array
    {
        $score = $keywordAnalysis['match_score'];

        return [
            'success'             => true,
            'overall_score'       => $score,
            'keyword_score'       => $score,
            'ai_score'            => 0,
            'skills_match'        => $score,
            'experience_match'    => 0,
            'education_match'     => 0,
            'matched_skills'      => $keywordAnalysis['matched_skills'],
            'missing_skills'      => $keywordAnalysis['missing_skills'],
            'strengths'           => $keywordAnalysis['matched_skills'],
            'weaknesses'          => $keywordAnalysis['missing_skills'],
            'recommendation'      => $this->generateRecommendation($score),
            'fit_level'           => $score >= 80 ? 'High' : ($score >= 60 ? 'Medium' : 'Low'),
            'hire_recommendation' => $score >= 60,
        ];
    }

    private function generateRecommendation(float $score): string
    {
        return match (true) {
            $score >= 80 => 'Excellent match. Strongly recommended for interview.',
            $score >= 60 => 'Good match. Recommended for interview.',
            $score >= 40 => 'Average match. Requires HR review before proceeding.',
            default      => 'Low match. Manual HR review required.',
        };
    }
}
