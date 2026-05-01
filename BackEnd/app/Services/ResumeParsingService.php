<?php

namespace App\Services;

use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;

class ResumeParsingService
{
    // ✅ Stop Words عربي وإنجليزي — كلمات بلا معنى نحذفها
    private array $stopWords = [
        // إنجليزي
        'the', 'and', 'for', 'with', 'that', 'this', 'will', 'are',
        'have', 'has', 'was', 'been', 'from', 'they', 'them', 'their',
        'what', 'which', 'who', 'whom', 'when', 'where', 'why', 'how',
        'all', 'each', 'both', 'few', 'more', 'most', 'other', 'some',
        'such', 'than', 'too', 'very', 'can', 'just', 'should', 'would',
        // عربي
        'من', 'في', 'على', 'مع', 'أو', 'و', 'هو', 'هي', 'هم',
        'إلى', 'عن', 'عند', 'كل', 'بعد', 'قبل', 'حتى', 'لكن',
        'يجب', 'يتم', 'يكون', 'تكون', 'كان', 'كانت', 'ذلك', 'هذا',
    ];

    /**
     * استخراج النص من ملف السيرة الذاتية
     */
    public function extractTextFromResume(string $resumePath): string
    {
        $fullPath  = Storage::disk('public')->path($resumePath);
        $extension = pathinfo($resumePath, PATHINFO_EXTENSION);

        if ($extension === 'pdf') {
            return $this->extractFromPdf($fullPath);
        } elseif (in_array($extension, ['doc', 'docx'])) {
            return $this->extractFromWord($fullPath);
        }

        return '';
    }

    /**
     * استخراج النص من PDF
     */
    private function extractFromPdf(string $filePath): string
    {
        try {
            $parser = new PdfParser();
            $pdf    = $parser->parseFile($filePath);
            return $this->cleanText($pdf->getText());
        } catch (\Exception $e) {
            Log::error('فشل استخراج PDF: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * استخراج النص من Word
     */
    private function extractFromWord(string $filePath): string
    {
        try {
            $phpWord = IOFactory::load($filePath);
            $text    = '';

            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    if (method_exists($element, 'getText')) {
                        $text .= $element->getText() . ' ';
                    }
                }
            }

            return $this->cleanText($text);
        } catch (\Exception $e) {
            Log::error('فشل استخراج Word: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * تنظيف النص
     */
    private function cleanText(string $text): string
    {
        $text = preg_replace('/\s+/', ' ', $text);
        return trim($text);
    }

    // =========================================================
    // ✅ الدوال الجديدة — ديناميكية لأي مجال
    // =========================================================

    /**
     * ❌ احذفنا extractKeywords() القديمة (قائمة ثابتة للبرمجة)
     * ✅ استبدلناها بـ extractKeywordsFromText() ديناميكية
     *
     * تستخرج الكلمات المهمة من أي نص (وصف وظيفي أو سيرة ذاتية)
     */
    public function extractKeywordsFromText(string $text): array
    {
        $text  = strtolower($text);
        // تقسيم النص لكلمات مع دعم العربية والإنجليزية
        preg_match_all('/[\w\x{0600}-\x{06FF}]+/u', $text, $matches);
        $words = $matches[0];

        // فلترة الكلمات القصيرة والـ Stop Words
        $keywords = array_filter($words, function ($word) {
            return mb_strlen($word) > 3
                && !in_array($word, $this->stopWords);
        });

        // إرجاع كلمات فريدة
        return array_values(array_unique($keywords));
    }

    /**
     * ✅ مقارنة السيرة الذاتية مع وصف الوظيفة
     * تعمل لأي مجال — طب، قانون، هندسة، برمجة...
     */
    public function compareWithJobDescription(
        string $resumeText,
        string $jobDescription
    ): array {
        // استخرج كلمات الوظيفة
        $jobKeywords    = $this->extractKeywordsFromText($jobDescription);

        // استخرج كلمات السيرة
        $resumeKeywords = $this->extractKeywordsFromText($resumeText);
        $resumeLower    = strtolower($resumeText);

        $matched = [];
        $missing = [];

        foreach ($jobKeywords as $keyword) {
            if (in_array($keyword, $resumeKeywords)) {
                $matched[] = $keyword; // ✅ موجودة
            } else {
                $missing[] = $keyword; // ❌ ناقصة
            }
        }

        $total      = count($jobKeywords);
        $matchScore = $total > 0
            ? round((count($matched) / $total) * 100)
            : 0;

        return [
            'match_score'    => $matchScore,
            'matched_skills' => $matched,
            'missing_skills' => $missing,
            'total_required' => $total,
            'total_matched'  => count($matched),
        ];
    }

    /**
     * ✅ احتُفظ بـ calculateMatchScore للتوافق مع الكود القديم
     */
    public function calculateMatchScore(
        array $resumeKeywords,
        array $jobKeywords
    ): float {
        if (empty($jobKeywords)) return 0;

        $matched = count(array_intersect($jobKeywords, $resumeKeywords));
        return round(($matched / count($jobKeywords)) * 100, 2);
    }
}
