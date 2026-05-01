<?php

namespace App\Services;

use OpenAI\Client;
use Illuminate\Support\Facades\Log;

class AIResumeEvaluationService
{
    private Client $openai;

    public function __construct()
    {
        $this->openai = \OpenAI::client(config('services.openai.key'));
        // ✅ config() بدل env() مباشرة — أفضل ممارسة
    }

    /**
     * ✅ التقييم الكامل — كلمات مفتاحية + AI معاً
     */
    public function evaluateResume(
        string $resumeText,
        string $jobDescription,
        array  $requiredSkills = []
    ): array {
        try {
            // الخطوة 1: مقارنة الكلمات المفتاحية (بدون AI)
            $parser          = app(ResumeParsingService::class);
            $keywordAnalysis = $parser->compareWithJobDescription(
                $resumeText,
                $jobDescription
            );

            // الخطوة 2: تقييم الـ AI
            $prompt   = $this->buildEvaluationPrompt(
                $resumeText,
                $jobDescription,
                // ✅ نمرر المهارات الناقصة للـ AI ليأخذها بعين الاعتبار
                $keywordAnalysis['missing_skills']
            );

            $response = $this->openai->chat()->create([
                'model'       => 'gpt-4o-mini', // ✅ تم تصحيح الاسم
                'messages'    => [
                    [
                        'role'    => 'system',
                        'content' => 'أنت خبير موارد بشرية متخصص في تقييم السير الذاتية لأي مجال وظيفي. قيّم المرشح بناءً على الوظيفة المحددة فقط وأرجع النتيجة بصيغة JSON.',
                    ],
                    [
                        'role'    => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.3, // ✅ خفضنا الـ temperature للحصول على نتائج أكثر ثباتاً
                'max_tokens'  => 1500,
            ]);

            $content   = $response->choices[0]->message->content;
            $aiResult  = $this->parseAIResponse($content);

            if (!$aiResult['success']) {
                // ✅ لو فشل الـ AI، نرجع نتيجة الكلمات المفتاحية بدل 0
                return $this->fallbackToKeywordResult($keywordAnalysis);
            }

            // الخطوة 3: دمج النتيجتين
            // 40% كلمات مفتاحية + 60% تقييم AI
            $finalScore = round(
                ($keywordAnalysis['match_score'] * 0.4) +
                ($aiResult['overall_score']      * 0.6)
            );

            return [
                'success'          => true,
                'overall_score'    => $finalScore,
                'keyword_score'    => $keywordAnalysis['match_score'],
                'ai_score'         => $aiResult['overall_score'],
                'skills_match'     => $aiResult['skills_match']     ?? 0,
                'experience_match' => $aiResult['experience_match'] ?? 0,
                'education_match'  => $aiResult['education_match']  ?? 0,
                'matched_skills'   => $keywordAnalysis['matched_skills'],
                'missing_skills'   => $keywordAnalysis['missing_skills'],
                'strengths'        => $aiResult['strengths']        ?? [],
                'weaknesses'       => $aiResult['weaknesses']       ?? [],
                'recommendation'   => $aiResult['recommendation']   ?? '',
                'hire_recommendation' => $finalScore >= 60,
            ];

        } catch (\Exception $e) {
            Log::error('خطأ في تقييم السيرة: ' . $e->getMessage());

            // ✅ بدل ما نرجع 0، نحاول نرجع نتيجة كلمات مفتاحية
            return isset($keywordAnalysis)
                ? $this->fallbackToKeywordResult($keywordAnalysis)
                : ['success' => false, 'overall_score' => 0, 'error' => $e->getMessage()];
        }
    }

    /**
     * ✅ Prompt محسّن — عام لأي مجال
     */
    private function buildEvaluationPrompt(
        string $resumeText,
        string $jobDescription,
        array  $missingSkills = []
    ): string {
        $missingList = !empty($missingSkills)
            ? implode(', ', array_slice($missingSkills, 0, 10))
            : 'لا يوجد';

        return <<<PROMPT
        قيّم السيرة الذاتية التالية بناءً على الوصف الوظيفي.

        **الوصف الوظيفي:**
        {$jobDescription}

        **السيرة الذاتية:**
        {$resumeText}

        **ملاحظة:** الكلمات المفتاحية الناقصة من السيرة: {$missingList}

        أرجع JSON فقط بهذه الحقول:
        {
            "overall_score": (0-100),
            "skills_match": (0-100),
            "experience_match": (0-100),
            "education_match": (0-100),
            "strengths": ["..."],
            "weaknesses": ["..."],
            "missing_skills": ["..."],
            "recommendation": "...",
            "hire_recommendation": true/false
        }
        PROMPT;
    }

    /**
     * تحليل استجابة OpenAI
     */
    private function parseAIResponse(string $content): array
    {
        try {
            if (preg_match('/\{[\s\S]*\}/u', $content, $matches)) {
                $data = json_decode($matches[0], true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    return ['success' => true, ...$data];
                }
            }

            return ['success' => false, 'error' => 'فشل تحليل JSON'];
        } catch (\Exception $e) {
            Log::error('خطأ في parseAIResponse: ' . $e->getMessage());
            return ['success' => false, 'error' => $e->getMessage()];
        }
    }

    /**
     * ✅ Fallback — لو فشل AI نرجع نتيجة الكلمات المفتاحية
     */
    private function fallbackToKeywordResult(array $keywordAnalysis): array
    {
        $score = $keywordAnalysis['match_score'];
        return [
            'success'          => true,
            'overall_score'    => $score,
            'keyword_score'    => $score,
            'ai_score'         => 0,
            'matched_skills'   => $keywordAnalysis['matched_skills'],
            'missing_skills'   => $keywordAnalysis['missing_skills'],
            'strengths'        => $keywordAnalysis['matched_skills'],
            'weaknesses'       => $keywordAnalysis['missing_skills'],
            'recommendation'   => $this->generateRecommendation($score),
            'hire_recommendation' => $score >= 60,
        ];
    }

    /**
     * توليد توصية بناءً على النقاط
     */
    private function generateRecommendation(float $score): string
    {
        return match(true) {
            $score >= 80 => 'مرشح ممتاز - يستحق المقابلة بقوة',
            $score >= 60 => 'مرشح جيد - يستحق المقابلة',
            $score >= 40 => 'مرشح متوسط - يحتاج مراجعة بشرية',
            default      => 'مرشح ضعيف التطابق - يحتاج مراجعة بشرية',
            // ✅ ما في رفض تلقائي — HR يقرر دايماً
        };
    }

    /**
     * تقييم سريع بدون AI
     */
    public function quickEvaluate(
        array $resumeKeywords,
        array $jobKeywords,
        float $keywordMatchScore
    ): array {
        return [
            'overall_score'       => round($keywordMatchScore, 2),
            'skills_match'        => round($keywordMatchScore, 2),
            'experience_match'    => 0,
            'education_match'     => 0,
            'strengths'           => array_slice($resumeKeywords, 0, 5),
            'weaknesses'          => [],
            'missing_skills'      => array_diff($jobKeywords, $resumeKeywords),
            'recommendation'      => $this->generateRecommendation($keywordMatchScore),
            'hire_recommendation' => $keywordMatchScore >= 60,
        ];
    }
}
