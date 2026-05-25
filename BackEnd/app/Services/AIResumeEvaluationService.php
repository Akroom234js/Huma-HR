<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * AIResumeEvaluationService — مبني على Google Gemini
 * مع Prompt محسّن بأفضل الممارسات
 */
class AIResumeEvaluationService
{
    private string $apiKey;
    private string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }

    /**
     * التقييم الكامل — نقطة الدخول الرئيسية
     * المعادلة: 40% keyword + 60% AI — تُحسب هنا فقط
     */
    public function evaluateResume(
        string $resumeText,
        string $jobDescription,
    ): array {
        $parsingService  = app(ResumeParsingService::class);
        $keywordAnalysis = $parsingService->compareWithJobDescription(
            $resumeText,
            $jobDescription
        );

        try {
            $prompt   = $this->buildEvaluationPrompt(
                $resumeText,
                $jobDescription,
                $keywordAnalysis['missing_skills']
            );

            $aiResult = $this->callGeminiAPI($prompt);

            if (!($aiResult['success'] ?? false)) {
                Log::warning('AIResumeEvaluationService: Gemini failed, using fallback');
                return $this->buildFallbackResult($keywordAnalysis);
            }

            // ✅ المعادلة تُحسب هنا فقط — مرة واحدة
            $finalScore = round(
                ($keywordAnalysis['match_score'] * 0.4) +
                ($aiResult['overall_score']      * 0.6)
            );

            return [
                'success'             => true,
                'overall_score'       => $finalScore,
                'keyword_score'       => $keywordAnalysis['match_score'],
                'ai_score'            => $aiResult['overall_score'],
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
                'maxOutputTokens' => 1000,
            ]
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST           => true,
            CURLOPT_POSTFIELDS     => $body,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 30,
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
     * Prompt محسّن بأفضل الممارسات
     *
     * ليش هاد الـ Prompt أفضل؟
     * ─────────────────────────
     * 1. Role Prompting: بيعرّف Gemini إنه خبير ATS
     * 2. معايير واضحة بنسب مئوية
     * 3. مرونة: يفهم التقنيات المرتبطة (Docker ↔ Kubernetes)
     * 4. يدعم العربي والإنجليزي
     * 5. JSON صارم بدون markdown
     */
    private function buildEvaluationPrompt(
        string $resumeText,
        string $jobDescription,
        array  $missingSkills = []
    ): string {
        $missingList       = !empty($missingSkills)
            ? implode(', ', array_slice($missingSkills, 0, 15))
            : 'None identified';
        $resumeTextTrimmed = mb_substr($resumeText, 0, 3000, 'UTF-8');
        $jobDescTrimmed    = mb_substr($jobDescription, 0, 1500, 'UTF-8');

        return <<<PROMPT
Act as an expert ATS (Applicant Tracking System) with 15 years of experience evaluating technical candidates. Your task is to evaluate the provided RESUME against the JOB DESCRIPTION.

### EVALUATION CRITERIA:
1. **Skills Match (40%)**: Compare technical and soft skills. If a related technology is present (e.g., Docker vs Kubernetes), give partial credit.
2. **Experience Match (40%)**: Verify years of experience and relevant roles. Analyze seniority level based on responsibilities, not just years.
3. **Education & Certifications (20%)**: Check for required degrees or equivalent certifications.

### LANGUAGE NOTE:
Understand Arabic and English technical terms equally (e.g., "مطور واجهات" = "Frontend Developer").

### DATA:
JOB DESCRIPTION:
{$jobDescTrimmed}

RESUME:
{$resumeTextTrimmed}

PRE-IDENTIFIED MISSING KEYWORDS: {$missingList}

### INSTRUCTIONS:
- Be objective and professional.
- Base your evaluation strictly on the job requirements above.
- Do NOT add markdown code blocks or any text outside the JSON.

### OUTPUT FORMAT (Strict JSON only):
{
    "overall_score": <integer 0-100>,
    "breakdown": {
        "skills": <integer 0-100>,
        "experience": <integer 0-100>,
        "education": <integer 0-100>
    },
    "summary": {
        "strengths": ["strength 1", "strength 2", "strength 3"],
        "weaknesses": ["gap 1", "gap 2", "gap 3"],
        "verdict": "<one professional sentence recommendation>"
    },
    "fit_level": "<High|Medium|Low>"
}
PROMPT;
    }

    /**
     * تحليل رد Gemini — يتعامل مع الـ JSON الجديد
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
     * Fallback — لو فشل Gemini
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
