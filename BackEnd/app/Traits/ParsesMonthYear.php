<?php

namespace App\Traits;

trait ParsesMonthYear
{
    private const MONTH_MAP = [
        'January' => 1, 'February' => 2, 'March'  => 3, 'April'    => 4,
        'May'     => 5, 'June'     => 6, 'July'   => 7, 'August'   => 8,
        'September' => 9, 'October' => 10, 'November' => 11, 'December' => 12,
    ];

    /**
     * يحول "April 2026" أو رقم شهر مباشر لصيغة [month_int, year_int]
     * يرجع [null, year] لو ما قدر يفهم اسم الشهر
     */
    protected function parseMonthYear(?string $input, ?int $fallbackYear = null): array
    {
        $fallbackYear = $fallbackYear ?? now()->year;

        if (!$input) {
            return [null, $fallbackYear];
        }

        // لو رقم مباشر (?month=8 مثلاً)
        if (is_numeric(trim($input))) {
            return [(int)$input, $fallbackYear];
        }

        $parts     = explode(' ', trim($input));
        $monthName = $parts[0] ?? null;
        $year      = isset($parts[1]) ? (int)$parts[1] : $fallbackYear;
        $month     = self::MONTH_MAP[$monthName] ?? null;

        return [$month, $year];
    }
}
