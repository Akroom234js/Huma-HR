<?php

namespace App\Services;

use Smalot\PdfParser\Parser as PdfParser;
use PhpOffice\PhpWord\IOFactory;
use Illuminate\Support\Facades\Storage;

class ResumeParsingService
{
    /**
     * استخراج النص من ملف السيرة الذاتية
     */
    public function extractTextFromResume(string $resumePath): string
    {
        $fullPath = Storage::disk('public')->path($resumePath);
        $extension = pathinfo($resumePath, PATHINFO_EXTENSION);

        if ($extension === 'pdf') {
            return $this->extractFromPdf($fullPath);
        } elseif (in_array($extension, ['doc', 'docx'])) {
            return $this->extractFromWord($fullPath);
        }

        return '';
    }

    /**
     * استخراج النص من ملف PDF
     */
    private function extractFromPdf(string $filePath): string
    {
        try {
            $parser = new PdfParser();
            $pdf = $parser->parseFile($filePath);
            $text = $pdf->getText();
            return $this->cleanText($text);
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * استخراج النص من ملف Word
     */
    private function extractFromWord(string $filePath): string
    {
        try {
            $phpWord = IOFactory::load($filePath);
            $text = '';

            foreach ($phpWord->getSections() as $section) {
                foreach ($section->getElements() as $element) {
                    if (method_exists($element, 'getText')) {
                        $text .= $element->getText() . ' ';
                    }
                }
            }

            return $this->cleanText($text);
        } catch (\Exception $e) {
            return '';
        }
    }

    /**
     * تنظيف النص
     */
    private function cleanText(string $text): string
    {
        // إزالة المسافات الزائدة والأسطر الفارغة
        $text = preg_replace('/\s+/', ' ', $text);
        $text = trim($text);
        return $text;
    }

    /**
     * استخراج الكلمات المفتاحية من النص
     */
    public function extractKeywords(string $text): array
    {
        // قائمة المهارات والتقنيات الشائعة
        $keywords = [
            // لغات البرمجة
            'php', 'python', 'javascript', 'java', 'c++', 'c#', 'ruby', 'go', 'rust', 'kotlin',
            'swift', 'typescript', 'scala', 'perl', 'r', 'matlab',

            // إطارات العمل
            'laravel', 'symfony', 'codeigniter', 'yii', 'zend',
            'react', 'vue', 'angular', 'next.js', 'nuxt', 'svelte',
            'django', 'flask', 'fastapi', 'spring', 'spring boot',
            'express', 'nest.js', 'fastify',

            // قواعد البيانات
            'mysql', 'postgresql', 'mongodb', 'redis', 'elasticsearch', 'cassandra',
            'oracle', 'sql server', 'mariadb', 'sqlite', 'dynamodb',

            // أدوات وتقنيات
            'git', 'docker', 'kubernetes', 'jenkins', 'gitlab', 'github', 'bitbucket',
            'aws', 'azure', 'gcp', 'heroku', 'digitalocean',
            'rest', 'graphql', 'soap', 'websocket',
            'microservices', 'devops', 'ci/cd',

            // أخرى
            'html', 'css', 'sass', 'bootstrap', 'tailwind',
            'api', 'restful', 'json', 'xml', 'yaml',
            'agile', 'scrum', 'kanban',
            'linux', 'windows', 'macos', 'ubuntu',
            'sql', 'nosql', 'orm', 'eloquent',
            'testing', 'unit test', 'integration test', 'jest', 'phpunit',
            'design patterns', 'solid', 'clean code',
        ];

        $textLower = strtolower($text);
        $foundKeywords = [];

        foreach ($keywords as $keyword) {
            // حساب عدد مرات ظهور الكلمة المفتاحية
            $count = substr_count($textLower, $keyword);
            if ($count > 0) {
                $foundKeywords[$keyword] = $count;
            }
        }

        // ترتيب حسب التكرار (الأكثر تكراراً أولاً)
        arsort($foundKeywords);

        return $foundKeywords;
    }

    /**
     * حساب نسبة المطابقة بناءً على الكلمات المفتاحية
     */
    public function calculateMatchScore(array $resumeKeywords, array $jobKeywords): float
    {
        if (empty($jobKeywords)) {
            return 0;
        }

        $matchedKeywords = 0;

        foreach ($jobKeywords as $keyword) {
            if (isset($resumeKeywords[$keyword])) {
                $matchedKeywords++;
            }
        }

        // حساب النسبة المئوية
        $score = ($matchedKeywords / count($jobKeywords)) * 100;

        return round($score, 2);
    }
}
