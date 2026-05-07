<?php

namespace App\Services;

use App\Services\ResumeParsingService;
use Illuminate\Support\Facades\Log;
use OpenAI\Laravel\Facades\OpenAI;

/**
 * =====================================================================
 * AIResumeEvaluationService — خدمة التقييم الذكي للسيرة الذاتية
 * =====================================================================
 *
 * مسؤوليتها:
 * ──────────
 * 1. بناء الـ Prompt المناسب لـ OpenAI
 * 2. إرسال السيرة الذاتية والوصف الوظيفي لـ GPT
 * 3. تحليل الرد وتحويله لبيانات منظمة
 * 4. حساب الـ Score النهائي بالمعادلة الصحيحة
 * 5. Fallback لو فشل الـ AI
 *
 * المعادلة النهائية (تُحسب هنا فقط — مرة واحدة):
 * ──────────────────────────────────────────────
 *   Final Score = (Keyword Score × 40%) + (AI Score × 60%)
 *
 * ⚠️ مهم: هاد الحساب يصير هنا بس
 * ApplicationService أو EvaluateResumeJob يأخذوا النتيجة مباشرة
 * بدون إعادة حساب — هاد كان الخطأ في الكود القديم
 */
class AIResumeEvaluationService
{
    public function __construct(
        private readonly ResumeParsingService $parsingService
    ) {}

    /**
     * التقييم الكامل — نقطة الدخول الرئيسية
     *
     * الخطوات بالترتيب:
     * 1. مقارنة الكلمات المفتاحية (keyword score)
     * 2. تقييم الـ AI (ai score)
     * 3. حساب المعادلة النهائية
     * 4. لو فشل AI → fallback على keyword score فقط
     */
    public function evaluateResume(
        string $resumeText,
        string $jobDescription,
    ): array {
        // ─── الخطوة 1: تحليل الكلمات المفتاحية ─────────────────
        $keywordAnalysis = $this->parsingService->compareWithJobDescription(
            $resumeText,
            $jobDescription
        );

        // ─── الخطوة 2: تقييم الـ AI ──────────────────────────────
        try {
            $prompt   = $this->buildEvaluationPrompt(
                $resumeText,
                $jobDescription,
                $keywordAnalysis['missing_skills']
            );

            $response = OpenAI::chat()->create([
                'model'       => 'gpt-4o-mini', // أسرع وأرخص من gpt-4
                'messages'    => [
                    [
                        'role'    => 'system',
                        'content' => 'You are an expert HR specialist. Evaluate resumes objectively based on job requirements. Always respond with valid JSON only — no markdown, no extra text.',
                    ],
                    [
                        'role'    => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.3, // منخفض = نتائج أكثر ثباتاً وأقل إبداعاً
                'max_tokens'  => 1000,
            ]);

            $content  = $response->choices[0]->message->content;
            $aiResult = $this->parseAIResponse($content);

            if (!($aiResult['success'] ?? false)) {
                Log::warning('AIResumeEvaluationService: AI response parsing failed, using fallback');
                return $this->buildFallbackResult($keywordAnalysis);
            }

            // ─── الخطوة 3: المعادلة النهائية ─────────────────────
            // ✅ تُحسب هنا فقط — مرة واحدة
            // keyword_score × 40% + ai_score × 60%
            $finalScore = round(
                ($keywordAnalysis['match_score'] * 0.4) +
                ($aiResult['overall_score']      * 0.6)
            );

            return [
                'success'             => true,

                // ✅ overall_score = النتيجة النهائية الجاهزة
                // ApplicationService يأخذها مباشرة بدون إعادة حساب
                'overall_score'       => $finalScore,

                // للمعلومية فقط — لعرضها في لوحة HR
                'keyword_score'       => $keywordAnalysis['match_score'],
                'ai_score'            => $aiResult['overall_score'],

                // تفاصيل التقييم
                'skills_match'        => $aiResult['skills_match']     ?? 0,
                'experience_match'    => $aiResult['experience_match'] ?? 0,
                'education_match'     => $aiResult['education_match']  ?? 0,

                // المهارات
                'matched_skills'      => $keywordAnalysis['matched_skills'],
                'missing_skills'      => $keywordAnalysis['missing_skills'],

                // توصية الـ AI
                'strengths'           => $aiResult['strengths']        ?? [],
                'weaknesses'          => $aiResult['weaknesses']       ?? [],
                'recommendation'      => $aiResult['recommendation']   ?? '',
                'hire_recommendation' => $finalScore >= 60,
            ];

        } catch (\Exception $e) {
            Log::error('AIResumeEvaluationService: OpenAI call failed: ' . $e->getMessage());
            return $this->buildFallbackResult($keywordAnalysis);
        }
    }

    /**
     * بناء الـ Prompt
     *
     * ليش نعطي الـ AI الكلمات الناقصة؟
     * ────────────────────────────────
     * لأن الـ AI ممكن يعوّض — مثلاً:
     * الوصف الوظيفي يطلب "Docker"
     * السيرة ما ذكرت "Docker" بالاسم بس ذكرت "containerization"
     * الـ keyword match بيحسبها ناقصة
     * لكن الـ AI يعرف إنها نفس الشي
     */
    private function buildEvaluationPrompt(
        string $resumeText,
        string $jobDescription,
        array  $missingSkills = []
    ): string {
        $missingList = !empty($missingSkills)
            ? implode(', ', array_slice($missingSkills, 0, 15))
            : 'None';

        // نقطع النص لو طويل جداً — لتجنب تجاوز الـ token limit
        $resumeTextTrimmed = mb_substr($resumeText, 0, 3000, 'UTF-8');
        $jobDescTrimmed    = mb_substr($jobDescription, 0, 1500, 'UTF-8');

        return <<<PROMPT
Evaluate this resume against the job description below.

JOB DESCRIPTION:
{$jobDescTrimmed}

RESUME:
{$resumeTextTrimmed}

Keywords missing from resume: {$missingList}

Respond with ONLY this JSON (no markdown, no extra text):
{
    "overall_score": <0-100>,
    "skills_match": <0-100>,
    "experience_match": <0-100>,
    "education_match": <0-100>,
    "strengths": ["strength1", "strength2"],
    "weaknesses": ["weakness1", "weakness2"],
    "recommendation": "<one sentence>",
    "hire_recommendation": <true|false>
}
PROMPT;
    }

    /**
     * تحليل رد الـ AI واستخراج الـ JSON
     *
     * ليش نستخدم Regex بدل json_decode مباشرة؟
     * ─────────────────────────────────────────
     * الـ AI أحياناً بيضيف نص قبل أو بعد الـ JSON
     * أو يلفه بـ ```json ... ```
     * الـ Regex يستخرج الـ JSON فقط بغض النظر عن الباقي
     */
    private function parseAIResponse(string $content): array
    {
        try {
            // إزالة markdown code blocks لو موجودة
            $content = preg_replace('/```(?:json)?\s*/i', '', $content);
            $content = preg_replace('/```\s*$/', '', trim($content));

            // استخراج الـ JSON من النص
            if (preg_match('/\{[\s\S]*\}/u', $content, $matches)) {
                $data = json_decode($matches[0], true);

                if (json_last_error() !== JSON_ERROR_NONE) {
                    return ['success' => false, 'error' => 'JSON decode error: ' . json_last_error_msg()];
                }

                if (!isset($data['overall_score'])) {
                    return ['success' => false, 'error' => 'Missing overall_score in AI response'];
                }

                // تأكد إن الـ score في النطاق الصحيح 0-100
                $data['overall_score'] = max(0, min(100, (int) $data['overall_score']));

                return ['success' => true, ...$data];
            }

            return ['success' => false, 'error' => 'No JSON found in AI response'];

        } catch (\Exception $e) {
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * Fallback — لو فشل الـ AI
     *
     * ليش مهم؟
     * ─────────
     * OpenAI ممكن يكون:
     * - Down مؤقتاً
     * - Rate limit وصلنا له
     * - Timeout
     *
     * بدل ما يفشل الطلب كاملاً
     * نرجع نتيجة مبنية على keyword analysis فقط
     * والطلب بيكمل طبيعي — HR يراجعه يدوياً
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
            'hire_recommendation' => $score >= 60,
        ];
    }

    /**
     * توليد توصية نصية بناءً على الـ Score
     */
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
