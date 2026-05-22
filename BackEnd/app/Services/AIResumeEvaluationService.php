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

        // التحقق من وجود مفتاح OpenAI API — إن لم يتوفر، ننتقل فوراً للتقييم المحلي المتقدم
        $openAiKey = config('openai.api_key') ?? env('OPENAI_API_KEY');
        if (empty($openAiKey)) {
            Log::info('AIResumeEvaluationService: No OpenAI API key configured. Using Advanced Local Evaluator.');
            return $this->evaluateLocally($resumeText, $jobDescription, $keywordAnalysis);
        }

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

    /**
     * تقييم السيرة الذاتية محلياً بالكامل (بدون حاجة للاتصال بالإنترنت)
     * Advanced Local / Offline Resume Evaluator
     */
    public function evaluateLocally(
        string $resumeText,
        string $jobDescription,
        array $keywordAnalysis
    ): array {
        $resumeTextLower = mb_strtolower($resumeText, 'UTF-8');
        $isArabic = preg_match('/[\x{0600}-\x{06FF}]/u', $jobDescription);

        // 1. حساب نسبة مطابقة المهارات (Skills Match Score)
        $skillsMatchScore = $keywordAnalysis['match_score'];

        // 2. مطابقة الخبرة (Experience Match Score)
        $experienceScore = 50.0; // القيمة الافتراضية
        $yearsOfExperience = 0;
        
        // English pattern: e.g. 5+ years, 5 years
        if (preg_match_all('/(\d+)\s*(?:\+|plus)?\s*(?:years?|yrs?)\b/u', $resumeTextLower, $matches)) {
            $yearsOfExperience = max($matches[1]);
        }
        
        // Arabic pattern: e.g. خبرة 5 سنوات، 3 أعوام، سنة واحدة
        if (preg_match_all('/(?:خبرة)?\s*(\d+)\s*(?:سنوات|سنة|عام|أعوام|سنه)/u', $resumeTextLower, $arMatches)) {
            $yearsOfExperience = max($yearsOfExperience, max($arMatches[1]));
        }

        // لو وجدنا كلمات تدل على الخبرة بدون رقم
        if ($yearsOfExperience == 0) {
            if (preg_match('/(?:senior|expert|lead|سينيور|خبير|رئيسي)/u', $resumeTextLower)) {
                $yearsOfExperience = 7;
            } elseif (preg_match('/(?:mid|experienced|ذو خبرة|مطور)/u', $resumeTextLower)) {
                $yearsOfExperience = 4;
            } elseif (preg_match('/(?:junior|entry|fresh|مبتدئ|حديث التخرج)/u', $resumeTextLower)) {
                $yearsOfExperience = 1;
            }
        }

        // حساب درجة الخبرة بناءً على عدد السنوات
        if ($yearsOfExperience >= 8) {
            $experienceScore = 95.0;
        } elseif ($yearsOfExperience >= 5) {
            $experienceScore = 90.0;
        } elseif ($yearsOfExperience >= 3) {
            $experienceScore = 80.0;
        } elseif ($yearsOfExperience >= 1) {
            $experienceScore = 65.0;
        } else {
            $experienceScore = 45.0;
        }

        // 3. مطابقة التعليم (Education Match Score)
        $educationScore = 50.0;
        
        $phdTerms = ['phd', 'doctorate', 'دكتوراه'];
        $masterTerms = ['master', 'msc', 'mba', 'ma', 'ماجستير'];
        $bachelorTerms = ['bachelor', 'bsc', 'ba', 'b.a', 'b.s', 'university', 'college', 'بكالوريوس', 'جامعة', 'كلية'];
        $diplomaTerms = ['diploma', 'دبلوم', 'معهد'];

        $hasPhd = false;
        $hasMaster = false;
        $hasBachelor = false;
        $hasDiploma = false;

        foreach ($phdTerms as $term) {
            if (str_contains($resumeTextLower, $term)) { $hasPhd = true; break; }
        }
        foreach ($masterTerms as $term) {
            if (str_contains($resumeTextLower, $term)) { $hasMaster = true; break; }
        }
        foreach ($bachelorTerms as $term) {
            if (str_contains($resumeTextLower, $term)) { $hasBachelor = true; break; }
        }
        foreach ($diplomaTerms as $term) {
            if (str_contains($resumeTextLower, $term)) { $hasDiploma = true; break; }
        }

        if ($hasPhd) {
            $educationScore = 98.0;
        } elseif ($hasMaster) {
            $educationScore = 92.0;
        } elseif ($hasBachelor) {
            $educationScore = 85.0;
        } elseif ($hasDiploma) {
            $educationScore = 70.0;
        } else {
            $educationScore = 50.0;
        }

        // 4. حساب الدرجة الكلية بالمعادلة
        // Skills (40%), Experience (30%), Education (30%)
        $finalScore = round(
            ($skillsMatchScore * 0.4) +
            ($experienceScore  * 0.3) +
            ($educationScore   * 0.3)
        );

        // 5. توليد نقاط القوة والضعف باللغة المناسبة للوظيفة
        $matchedSkills = $keywordAnalysis['matched_skills'];
        $missingSkills = $keywordAnalysis['missing_skills'];

        $strengths = [];
        $weaknesses = [];

        if ($isArabic) {
            if (!empty($matchedSkills)) {
                $strengths[] = 'امتلاك المهارات الأساسية المطلوبة: ' . implode(', ', array_slice($matchedSkills, 0, 4));
            }
            if ($experienceScore >= 80) {
                $strengths[] = "يمتلك المرشح خبرة عملية جيدة جداً في هذا مجال العمل (تقديراً: {$yearsOfExperience} سنوات).";
            }
            if ($educationScore >= 85) {
                $strengths[] = 'المؤهل الأكاديمي مناسب ومتوافق مع متطلبات الوظيفة.';
            }
            if (empty($strengths)) {
                $strengths[] = 'تتوفر لدى المرشح بعض الكفاءات الأساسية العامة.';
            }

            if (!empty($missingSkills)) {
                $weaknesses[] = 'يفتقر إلى بعض المهارات المطلوبة: ' . implode(', ', array_slice($missingSkills, 0, 4));
            }
            if ($experienceScore < 65) {
                $weaknesses[] = 'سنوات الخبرة العملية قد تكون أقل من المستوى المطلوب.';
            }
            if (empty($weaknesses)) {
                $weaknesses[] = 'لا توجد فجوات مهارية واضحة مقارنة بالمتطلبات المباشرة.';
            }

            // التوصية
            $recommendation = $this->generateRecommendationArabic($finalScore);
        } else {
            if (!empty($matchedSkills)) {
                $strengths[] = 'Possesses key required skills: ' . implode(', ', array_slice($matchedSkills, 0, 4));
            }
            if ($experienceScore >= 80) {
                $strengths[] = "Candidate has solid hands-on experience (estimated: {$yearsOfExperience} years).";
            }
            if ($educationScore >= 85) {
                $strengths[] = 'Educational background is aligned with the job requirements.';
            }
            if (empty($strengths)) {
                $strengths[] = 'Possesses general core competencies.';
            }

            if (!empty($missingSkills)) {
                $weaknesses[] = 'Lacks some of the required key skills: ' . implode(', ', array_slice($missingSkills, 0, 4));
            }
            if ($experienceScore < 65) {
                $weaknesses[] = 'Practical experience might be slightly below the preferred level.';
            }
            if (empty($weaknesses)) {
                $weaknesses[] = 'No major skill gaps identified based on direct keywords match.';
            }

            // Recommendation
            $recommendation = $this->generateRecommendation($finalScore);
        }

        return [
            'success'             => true,
            'overall_score'       => $finalScore,
            'keyword_score'       => $skillsMatchScore,
            'ai_score'            => $finalScore,
            'skills_match'        => $skillsMatchScore,
            'experience_match'    => $experienceScore,
            'education_match'     => $educationScore,
            'matched_skills'      => $matchedSkills,
            'missing_skills'      => $missingSkills,
            'strengths'           => $strengths,
            'weaknesses'          => $weaknesses,
            'recommendation'      => $recommendation,
            'hire_recommendation' => $finalScore >= 60,
        ];
    }

    /**
     * توليد توصية نصية باللغة العربية بناءً على الـ Score
     */
    private function generateRecommendationArabic(float $score): string
    {
        return match (true) {
            $score >= 80 => 'توافق ممتاز جداً. نوصي بشدة بجدولة مقابلة مباشرة ودفع المرشح للمراحل المتقدمة.',
            $score >= 60 => 'توافق جيد. يمتلك المهارات الكافية لأداء الدور. نوصي بجدولة مقابلة أولية.',
            $score >= 40 => 'توافق متوسط. توجد فجوات مهارية أو خبرة محدودة، يحتاج لمراجعة يدوية دقيقة من مسؤولي التوظيف.',
            default      => 'توافق ضعيف. لا يلبي معظم المهارات والمتطلبات الأساسية للوظيفة.',
        };
    }
}
