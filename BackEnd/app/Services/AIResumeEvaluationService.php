<?php

namespace App\Services;

use OpenAI\Client;
use Illuminate\Support\Facades\Log;

class AIResumeEvaluationService
{
    private Client $openai;

    /**
     * Constructor
     */
    public function __construct()
    {
        $this->openai = \OpenAI::client(env('OPENAI_API_KEY'));
    }

    /**
     * تقييم السيرة الذاتية باستخدام OpenAI
     */
    public function evaluateResume(
        string $resumeText,
        string $jobDescription,
        array $requiredSkills = []
    ): array {
        try {
            // إنشاء Prompt محترف للـ AI
            $prompt = $this->buildEvaluationPrompt($resumeText, $jobDescription, $requiredSkills);

            // استدعاء OpenAI API
            $response = $this->openai->chat()->create([
                'model' => 'gpt-4.1-mini',
                'messages' => [
                    [
                        'role' => 'system',
                        'content' => 'أنت خبير في الموارد البشرية وتقييم السير الذاتية. قم بتحليل السيرة الذاتية وتقييمها بناءً على الوصف الوظيفي المعطى. أرجع النتيجة بصيغة JSON.',
                    ],
                    [
                        'role' => 'user',
                        'content' => $prompt,
                    ],
                ],
                'temperature' => 0.7,
                'max_tokens' => 1500,
            ]);

            // استخراج النص من الاستجابة
            $content = $response->choices[0]->message->content;

            // محاولة تحليل JSON من الاستجابة
            return $this->parseAIResponse($content);
        } catch (\Exception $e) {
            Log::error('خطأ في تقييم السيرة الذاتية باستخدام OpenAI: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => 'فشل تقييم السيرة الذاتية',
                'overall_score' => 0,
            ];
        }
    }

    /**
     * بناء Prompt احترافي للـ AI
     */
    private function buildEvaluationPrompt(
        string $resumeText,
        string $jobDescription,
        array $requiredSkills
    ): string {
        $skillsList = !empty($requiredSkills) ? implode(', ', $requiredSkills) : 'لم يتم تحديد مهارات معينة';

        return <<<PROMPT
        قم بتقييم السيرة الذاتية التالية بناءً على الوصف الوظيفي المعطى.

        **السيرة الذاتية:**
        {$resumeText}

        **الوصف الوظيفي:**
        {$jobDescription}

        **المهارات المطلوبة:**
        {$skillsList}

        قم بتحليل شامل وأرجع النتيجة بصيغة JSON بالعربية مع الحقول التالية:
        {
            "overall_score": (رقم من 0 إلى 100),
            "skills_match": (رقم من 0 إلى 100 - مدى توافق المهارات),
            "experience_match": (رقم من 0 إلى 100 - مدى توافق الخبرة),
            "education_match": (رقم من 0 إلى 100 - مدى توافق التعليم),
            "strengths": ["نقطة قوة 1", "نقطة قوة 2", ...],
            "weaknesses": ["نقطة ضعف 1", "نقطة ضعف 2", ...],
            "missing_skills": ["مهارة مفقودة 1", "مهارة مفقودة 2", ...],
            "recommendation": "توصية عامة عن المرشح",
            "hire_recommendation": true/false
        }

        تأكد من أن النتيجة JSON صحيحة وقابلة للتحليل.
        PROMPT;
    }

    /**
     * تحليل استجابة OpenAI
     */
    private function parseAIResponse(string $content): array
    {
        try {
            // محاولة استخراج JSON من النص
            if (preg_match('/\{[\s\S]*\}/', $content, $matches)) {
                $jsonString = $matches[0];
                $data = json_decode($jsonString, true);

                if (json_last_error() === JSON_ERROR_NONE) {
                    return [
                        'success' => true,
                        'overall_score' => $data['overall_score'] ?? 0,
                        'skills_match' => $data['skills_match'] ?? 0,
                        'experience_match' => $data['experience_match'] ?? 0,
                        'education_match' => $data['education_match'] ?? 0,
                        'strengths' => $data['strengths'] ?? [],
                        'weaknesses' => $data['weaknesses'] ?? [],
                        'missing_skills' => $data['missing_skills'] ?? [],
                        'recommendation' => $data['recommendation'] ?? '',
                        'hire_recommendation' => $data['hire_recommendation'] ?? false,
                        'raw_response' => $content,
                    ];
                }
            }

            // إذا فشل التحليل، أرجع استجابة افتراضية
            return [
                'success' => false,
                'error' => 'فشل تحليل استجابة OpenAI',
                'raw_response' => $content,
            ];
        } catch (\Exception $e) {
            Log::error('خطأ في تحليل استجابة OpenAI: ' . $e->getMessage());

            return [
                'success' => false,
                'error' => 'خطأ في معالجة النتيجة',
            ];
        }
    }

    /**
     * تقييم سريع للسيرة الذاتية (بدون OpenAI)
     */
    public function quickEvaluate(
        array $resumeKeywords,
        array $jobKeywords,
        float $keywordMatchScore
    ): array {
        $skillsMatch = $keywordMatchScore;

        // تقدير بسيط للتقييم الشامل بناءً على المطابقة
        $overallScore = $skillsMatch;

        return [
            'overall_score' => round($overallScore, 2),
            'skills_match' => round($skillsMatch, 2),
            'experience_match' => 0,
            'education_match' => 0,
            'strengths' => array_keys(array_slice($resumeKeywords, 0, 5)),
            'weaknesses' => [],
            'missing_skills' => array_diff($jobKeywords, array_keys($resumeKeywords)),
            'recommendation' => $this->generateRecommendation($overallScore),
            'hire_recommendation' => $overallScore >= 60,
        ];
    }

    /**
     * توليد توصية بناءً على النقاط
     */
    private function generateRecommendation(float $score): string
    {
        if ($score >= 80) {
            return 'مرشح ممتاز - يستحق المقابلة بقوة';
        } elseif ($score >= 60) {
            return 'مرشح جيد - يستحق المقابلة';
        } elseif ($score >= 40) {
            return 'مرشح متوسط - قد يستحق المقابلة';
        } else {
            return 'مرشح ضعيف - لا يستحق المقابلة';
        }
    }
}
