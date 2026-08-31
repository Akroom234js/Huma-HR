<?php
namespace App\Services;

use Illuminate\Support\Facades\Log;

/**
 * AIPerformanceCoachingService — مبني على Google Gemini
 * نفس نمط AIResumeEvaluationService (نفس أسلوب الـ API، والـ Prompt، والـ parsing)
 *
 * الغرض: تحليل نقاط ضعف الموظف بعد إغلاق دورة تقييم، واقتراح دورات تدريبية نصية.
 */
class AIPerformanceCoachingService
{
    private string $apiKey;
    private string $apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent';

    /* العتبة: أي component تحتها يُعتبر نقطة ضعف */
    private const GAP_THRESHOLD = 70.0;

    public function __construct()
    {
        $this->apiKey = config('services.gemini.api_key');
    }

    /**
     * نقطة الدخول الرئيسية — تُستدعى من ProcessPerformanceJob لكل موظف
     * بعد ما يتحسب $components، وقبل فتح أي DB transaction.
     *
     * @param array $scoreMap ['tasks' => 85.0, 'manager' => 60.0, ...]
     * @param array $componentLabels ['tasks' => 'Task Completion', 'manager' => 'Manager Evaluation', ...] (أسماء واضحة للعرض بالـ prompt)
     * @param string $employeeName اسم الموظف (بالـ prompt للسياق، بلا بيانات حساسة زيادة)
     * @param string $jobTitle
     * @return array ['analysis' => [...], 'recommendations' => [...]]
     */
    public function analyzeAndRecommend(
        array $scoreMap,
        array $componentLabels,
        string $jobTitle
    ): array {
        $gaps = $this->identifyGaps($scoreMap, $componentLabels);

        // ── لا داعي لاستدعاء Gemini إطلاقًا (توفير تكلفة/وقت) → لا فجوات ── //
        if (empty($gaps)) {
            return $this->buildPositiveResult($scoreMap);
        }

        try {
            $prompt = $this->buildCoachingPrompt($jobTitle, $gaps, $scoreMap);
            $aiResult = $this->callGeminiAPI($prompt);

            if (!($aiResult['success'] ?? false)) {
                Log::warning('AIPerformanceCoachingService: Gemini failed, using fallback for gaps: ' . implode(', ', array_keys($gaps)));
                return $this->buildFallbackResult($gaps);
            }

            return [
                'analysis' => [
                    'has_gaps' => true,
                    'weak_areas' => array_keys($gaps),
                    'summary' => $aiResult['summary'] ?? $this->defaultSummary($gaps),
                    'overall_rating' => $this->overallRating($scoreMap),
                ],
                'recommendations' => $aiResult['recommendations'] ?? [],
            ];
        } catch (\Exception $e) {
            Log::error('AIPerformanceCoachingService: ' . $e->getMessage());
            return $this->buildFallbackResult($gaps);
        }
    }

    /**
     * يرجع بس الـ components يلي تحت العتبة، بصيغة ['component_key' => score]
     */
    private function identifyGaps(array $scoreMap, array $componentLabels): array
    {
        $gaps = [];
        foreach ($scoreMap as $key => $score) {
            if ($score === null) continue; // component غير مفعّل بالـ template
            if ((float)$score < self::GAP_THRESHOLD) {
                $gaps[$key] = [
                    'label' => $componentLabels[$key] ?? ucfirst($key),
                    'score' => (float)$score,
                ];
            }
        }
        return $gaps;
    }

    private function callGeminiAPI(string $prompt): array
    {
        $url = $this->apiUrl . '?key=' . $this->apiKey;
        $body = json_encode([
            'contents' => [
                ['parts' => [['text' => $prompt]]]
            ],
            'generationConfig' => [
                'temperature'     => 0.4,
                'maxOutputTokens' => 2048,
            ]
        ]);

        $ch = curl_init($url);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => $body,
            CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
            CURLOPT_TIMEOUT        => 20, 
            CURLOPT_SSL_VERIFYPEER => false,
        ]);

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode !== 200 || !$response) {
            Log::error("AIPerformanceCoachingService: Gemini API error: HTTP {$httpCode}");
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
     * Prompt — نفس فلسفة AIResumeEvaluationService (Role Prompting + JSON صارم)
     * ⚠️ عمدًا بدون اسم الموظف — بس مسمى وظيفي عام + درجات الفجوات، لتقليل البيانات الشخصية المرسلة لخدمة خارجية
     */
    private function buildCoachingPrompt(string $jobTitle, array $gaps, array $scoreMap): string
    {
        $gapsList = implode("\n", array_map(
            fn($g, $key) => "- {$g['label']}: {$g['score']}/100",
            $gaps,
            array_keys($gaps)
        ));

        return <<<PROMPT
Act as an expert HR Learning & Development coach with 15 years of experience designing employee growth plans.

### EMPLOYEE CONTEXT:
Job Title: {$jobTitle}

### PERFORMANCE GAPS IDENTIFIED (score out of 100, below the 70 threshold):
{$gapsList}

### INSTRUCTIONS:
- For each weak area listed above, suggest ONE realistic, specific training course (a real-world course type/topic, not a generic phrase).
- Keep suggestions practical and directly tied to the weak area.
- Write a short, constructive one-paragraph summary (professional, encouraging tone, no negativity).
- Do NOT invent scores or mention numbers not provided above.
- Do NOT add markdown code blocks or any text outside the JSON.

### OUTPUT FORMAT (Strict JSON only):
{
  "summary": "<one constructive paragraph>",
  "recommendations": [
    {
      "weak_area": "<matching one of the gap labels above>",
      "course_name": "<specific realistic course title>",
      "reason": "<one sentence on why this course fits this gap>"
    }
  ]
}
PROMPT;
    }

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
                
                if (!isset($data['recommendations']) || !is_array($data['recommendations'])) {
                    return ['success' => false];
                }

                return [
                    'success' => true,
                    'summary' => $data['summary'] ?? '',
                    'recommendations' => $data['recommendations'],
                ];
            }
            return ['success' => false];
        } catch (\Exception $e) {
            Log::error('AIPerformanceCoachingService::parseAIResponse: ' . $e->getMessage());
            return ['success' => false];
        }
    }

    /**
     * ما استدعينا Gemini، حالة: مافي فجوات — كل النتائج >= 70%. نبني نتيجة إيجابية مباشرة.
     */
    private function buildPositiveResult(array $scoreMap): array
    {
        return [
            'analysis' => [
                'has_gaps' => false,
                'weak_areas' => [],
                'summary' => 'No significant performance gaps identified this cycle. Employee is meeting or exceeding expectations across all evaluated areas.',
                'overall_rating' => $this->overallRating($scoreMap),
            ],
            'recommendations' => [],
        ];
    }

    /**
     * Fallback — لو فشل استدعاء Gemini (منعطي نص عام بدل ما نضيع الميزة بالكامل) بس في فجوات فعلية
     */
    private function buildFallbackResult(array $gaps): array
    {
        $recommendations = [];
        foreach ($gaps as $key => $gap) {
            $recommendations[] = [
                'weak_area' => $gap['label'],
                'course_name' => "Professional Development: {$gap['label']}",
                'reason' => 'Automatically suggested based on score below target threshold.',
            ];
        }

        return [
            'analysis' => [
                'has_gaps' => true,
                'weak_areas' => array_keys($gaps),
                'summary' => 'Performance analysis identified areas for improvement. Detailed AI coaching is temporarily unavailable; general recommendations are provided.',
                'overall_rating' => 'Needs Improvement',
            ],
            'recommendations' => $recommendations,
        ];
    }

    private function defaultSummary(array $gaps): string
    {
        $areas = implode(', ', array_column($gaps, 'label'));
        return "Performance review identified opportunities for growth in: {$areas}.";
    }

    private function overallRating(array $scoreMap): string
    {
        $values = array_filter($scoreMap, fn($v) => $v !== null);
        if (empty($values)) return 'N/A';
        $avg = array_sum($values) / count($values);
        
        return match (true) {
            $avg >= 90 => 'Excellent',
            $avg >= 80 => 'Strong',
            $avg >= 70 => 'Good',
            $avg >= 60 => 'Needs Improvement',
            default    => 'Underperforming',
        };
    }
}
