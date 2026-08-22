<?php

namespace App\Console\Commands;

use App\Models\EmployeeRequest;
use Carbon\Carbon;
use Illuminate\Console\Command;

class BackfillRequestDates extends Command
{
    protected $signature = 'requests:backfill-dates';
    protected $description = 'Backfill start_date/end_date columns from details JSON for existing employee_requests';

    public function handle(): int
    {
        $count = 0;
        EmployeeRequest::whereNotNull('details')
            ->whereNull('start_date')
            ->chunkById(100, function ($requests) use (&$count) {
                foreach ($requests as $req) {
                    $startDate = $req->details['start_date'] ?? null;
                    if (!$startDate) continue;
                    $duration = (int)($req->details['duration'] ?? 1);
                    $req->start_date = $startDate;
                    $req->end_date = Carbon::parse($startDate)->addDays($duration - 1)->format('Y-m-d');
                    $req->saveQuietly();
                    $count++;
                }
            });

        $this->info("Backfilled {$count} employee_requests records.");
        return self::SUCCESS;
    }
}
