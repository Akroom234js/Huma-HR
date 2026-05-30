<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory;

/**
 * =====================================================================
 * ResumeParsingService — خدمة استخراج نص السيرة الذاتية
 * =====================================================================
 *
 * مسؤوليتها الوحيدة:
 * ──────────────────
 * 1. استخراج النص من ملف السيرة (PDF أو Word)
 * 2. تنظيف النص من الأحرف الزائدة
 * 3. استخراج الكلمات المفتاحية من النص
 * 4. مقارنة كلمات السيرة مع كلمات الوظيفة وحساب نسبة التطابق
 *
 * ليش Service منفصلة وما حطيناها في ApplicationService؟
 * ──────────────────────────────────────────────────────
 * Single Responsibility Principle — كل كلاس مسؤول عن شي واحد
 * لو بدنا نغير طريقة الـ parsing لاحقاً (مثلاً إضافة OCR)
 * بنعدل هون بس بدون ما نلمس ApplicationService
 */
class ResumeParsingService
{
    // =========================================================
    // ✅ STOP_WORDS كـ const مش private array
    // =========================================================
    // ليش const وما استخدمنا private array $stopWords؟
    // private array بيتحمل في الذاكرة مع كل instance جديد من الكلاس
    // const بيُحمّل مرة واحدة على مستوى الكلاس — أكفأ للذاكرة
    // خصوصاً إن هاد الكلاس ممكن يتنشأ مرات كثيرة في Queue
    private const STOP_WORDS = [
        // English
        'the', 'and', 'for', 'with', 'that', 'this', 'will', 'are',
        'have', 'has', 'was', 'been', 'from', 'they', 'them', 'their',
        'what', 'which', 'who', 'when', 'where', 'how', 'all', 'each',
        'both', 'few', 'more', 'most', 'other', 'some', 'such', 'than',
        'too', 'very', 'can', 'just', 'should', 'would', 'also', 'about',
        'after', 'before', 'between', 'through', 'during', 'including',
        'without', 'within', 'along', 'following', 'across', 'not',
        'but', 'its', 'our', 'your', 'their', 'his', 'her', 'you',
        // Arabic
        'من', 'في', 'على', 'مع', 'أو', 'هو', 'هي', 'هم', 'إلى',
        'عن', 'عند', 'كل', 'بعد', 'قبل', 'حتى', 'لكن', 'يجب',
        'يتم', 'يكون', 'تكون', 'كان', 'كانت', 'ذلك', 'هذا', 'التي',
        'الذي', 'هذه', 'أنه', 'أنها', 'بشكل', 'خلال', 'حول', 'بين',
    ];

    // الحد الأدنى لطول الكلمة لتُعتبر keyword
    private const MIN_WORD_LENGTH = 3;

    // =========================================================
    // استخراج النص من ملف السيرة
    // =========================================================

    /**
     * نقطة الدخول الرئيسية — تحدد نوع الملف وتستدعي الدالة المناسبة
     *
     * ليش نستخدم Storage::disk('local') هنا؟
     * ─────────────────────────────────────
     * في filesystems.php عندك، الـ 'local' disk مساره:
     * storage/app/private — وهاد آمن ومش متاح للعموم
     * بعكس 'public' disk اللي أي شخص يوصله بـ URL مباشرة
     * السير الذاتية بيانات حساسة — ما نخليها public
     */
    public function extractTextFromResume(string $resumePath): string
    {
        // نحدد مسار الملف الكامل
        $fullPath  = Storage::disk('local')->path($resumePath);
        $extension = strtolower(pathinfo($resumePath, PATHINFO_EXTENSION));

        return match ($extension) {
            'pdf'         => $this->extractFromPdf($fullPath),
            'doc', 'docx' => $this->extractFromWord($fullPath),
            default       => '', // نوع ملف غير مدعوم
        };
    }

    /**
     * استخراج النص من PDF
     *
     * ليش Smalot\PdfParser؟
     * ──────────────────────
     * أفضل مكتبة PHP لاستخراج نص من PDF
     * بتتعامل مع معظم أنواع PDF النصية
     * المشكلة الوحيدة: PDF مصوّر (Scanned) بيطلع فاضي
     * الحل لاحقاً: إضافة OCR (Tesseract) لهاي الحالة
     */
    private function extractFromPdf(string $filePath): string
    {
        try {
            if (!file_exists($filePath)) {
                Log::warning("ResumeParsingService: PDF not found: {$filePath}");
                return '';
            }

            $parser = new PdfParser();
            $pdf    = $parser->parseFile($filePath);
            $text   = $pdf->getText();

            if (empty(trim($text))) {
                Log::warning("ResumeParsingService: Empty text extracted — PDF may be image-based: {$filePath}");
            }

            return $this->cleanText($text);

        } catch (\Exception $e) {
            Log::error('ResumeParsingService: PDF extraction failed: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * استخراج النص من Word (doc/docx)
     *
     * ليش PhpOffice\PhpWord؟
     * ──────────────────────
     * المكتبة الرسمية لقراءة ملفات Word في PHP
     * بتتعامل مع paragraphs وتوابعها
     * المشكلة: الجداول داخل السيرة ممكن ينحرف ترتيب نصها
     * الحل: نستخرج النص recursively من كل العناصر
     */
    private function extractFromWord(string $filePath): string
    {
        try {
            if (!file_exists($filePath)) {
                Log::warning("ResumeParsingService: Word file not found: {$filePath}");
                return '';
            }

            $phpWord = IOFactory::load($filePath);
            $text    = '';

            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    $text .= $this->extractTextFromElement($element);
                }
            }

            return $this->cleanText($text);

        } catch (\Exception $e) {
            Log::error('ResumeParsingService: Word extraction failed: ' . $e->getMessage());
            return '';
        }
    }

    /**
     * استخراج النص من عنصر Word بشكل Recursive
     *
     * ليش Recursive؟
     * ──────────────
     * سيرة ذاتية بـ Word ممكن تحتوي:
     *   Section → Table → Row → Cell → Paragraph → TextRun → Text
     * كل مستوى داخل التاني
     * الـ Recursive بيضمن إننا نوصل لأعمق مستوى ونستخرج النص
     */
    private function extractTextFromElement($element): string
{
    $text = '';

    // ✅ إضافة: تجاهل Title مباشرة والنزول لعناصره
    if (method_exists($element, 'getElements')) {
        foreach ($element->getElements() as $child) {
            $text .= $this->extractTextFromElement($child);
        }
        return $text;
    }

    // ✅ استخراج النص فقط من العناصر البسيطة
    if (method_exists($element, 'getText')) {
        $value = $element->getText();
        if (is_string($value)) {
            $text .= $value . ' ';
        }
    }

    return $text;
}

    /**
     * تنظيف النص المستخرج
     *
     * ليش التنظيف مهم؟
     * ─────────────────
     * النص الخام من PDF/Word بيحتوي:
     * - مسافات ومسافات بيضاء زائدة
     * - أحرف control غير مرئية (\x00-\x1F)
     * - أسطر فارغة متعددة
     * كل هاد بيخرب استخراج الكلمات المفتاحية
     */
    private function cleanText(string $text): string
    {
        // إزالة الأحرف غير القابلة للطباعة
        $text = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', ' ', $text);
        // دمج كل المسافات والأسطر في مسافة واحدة
        $text = preg_replace('/\s+/u', ' ', $text);
        return trim($text);
    }

    // =========================================================
    // استخراج الكلمات المفتاحية
    // =========================================================

    /**
     * استخراج الكلمات المفتاحية من أي نص
     *
     * ✅ مهم جداً: بترجع indexed array
     * ['php', 'laravel', 'mysql', 'docker', ...]
     * مش associative array
     *
     * ليش هاد مهم؟
     * ─────────────
     * لو استخدمت array_keys() عليها بتحصل [0, 1, 2, ...]
     * مش الكلمات — هاد كان الخطأ في الكود القديم
     * الـ calculateMatchScore تأخذها مباشرة بدون array_keys()
     */
    public function extractKeywordsFromText(string $text): array
    {
        $text = mb_strtolower($text, 'UTF-8');

        // استخراج الكلمات — يدعم العربي والإنجليزي
        preg_match_all('/[\w\x{0600}-\x{06FF}]+/u', $text, $matches);
        $words = $matches[0] ?? [];

        $keywords = array_filter($words, function (string $word): bool {
            return mb_strlen($word, 'UTF-8') > self::MIN_WORD_LENGTH
                && !in_array($word, self::STOP_WORDS, true);
        });

        // array_values لضمان indexed array نظيف بدون فجوات
        return array_values(array_unique($keywords));
    }

    // =========================================================
    // مقارنة السيرة مع الوظيفة
    // =========================================================

    /**
     * مقارنة كاملة بين السيرة والوصف الوظيفي
     * بترجع تفاصيل كاملة: نسبة التطابق، المهارات الموجودة، الناقصة
     */
    public function compareWithJobDescription(
        string $resumeText,
        string $jobDescription
    ): array {
        $jobKeywords    = $this->extractKeywordsFromText($jobDescription);
        $resumeKeywords = $this->extractKeywordsFromText($resumeText);

        $matched = [];
        $missing = [];

        foreach ($jobKeywords as $keyword) {
            if (in_array($keyword, $resumeKeywords, true)) {
                $matched[] = $keyword;
            } else {
                $missing[] = $keyword;
            }
        }

        $total      = count($jobKeywords);
        $matchScore = $total > 0
            ? round((count($matched) / $total) * 100, 2)
            : 0.0;

        return [
            'match_score'    => $matchScore,
            'matched_skills' => $matched,
            'missing_skills' => $missing,
            'total_required' => $total,
            'total_matched'  => count($matched),
        ];
    }

    /**
     * حساب نسبة التطابق بين كلمتين indexed arrays
     *
     * ✅ FIX المهم: تأخذ $jobKeywords مباشرة
     * بدون array_keys() — لأن extractKeywordsFromText
     * بترجع indexed array أصلاً
     *
     * الاستخدام الصح:
     *   $resumeKeywords = $this->extractKeywordsFromText($resumeText);
     *   $jobKeywords    = $this->extractKeywordsFromText($jobDescription);
     *   $score = $this->calculateMatchScore($resumeKeywords, $jobKeywords);
     *                                                       ↑
     *                                              مش array_keys($jobKeywords)
     */
    public function calculateMatchScore(
        array $resumeKeywords,
        array $jobKeywords
    ): float {
        if (empty($jobKeywords)) {
            return 0.0;
        }

        $matched = count(array_intersect($jobKeywords, $resumeKeywords));
        return round(($matched / count($jobKeywords)) * 100, 2);
    }
}
