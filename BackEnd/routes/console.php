<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;
use App\Models\PerformanceCycle;
use App\Jobs\ProcessPerformanceJob;
use Illuminate\Support\Facades\Log;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     * يشتغل تلقائياً كل يوم منتصف الليل
     *
     * لتفعيله على السيرفر:
     * أضيفي هذا السطر في Crontab:
     * * * * * * php /path/to/artisan schedule:run >> /dev/null 2>&1
     */
    protected function schedule(Schedule $schedule): void
    {
        // ── تفعيل وإغلاق دورات الأداء تلقائياً كل يوم ──────────
        $schedule->call(function () {
            Log::info('Scheduler: Checking performance cycles...');

            // draft → active لما يوصل start_date
            $activated = PerformanceCycle::where('status', 'draft')
                ->whereDate('start_date', '<=', now()->toDateString())
                ->update(['status' => 'active']);

            if ($activated > 0) {
                Log::info("Scheduler: {$activated} cycle(s) activated.");
            }

            // active → processing لما يتجاوز end_date
            $expired = PerformanceCycle::where('status', 'active')
                ->whereDate('end_date', '<', now()->toDateString())
                ->get();

            foreach ($expired as $cycle) {
                $cycle->update(['status' => 'processing']);
                ProcessPerformanceJob::dispatch($cycle);
                Log::info("Scheduler: Cycle #{$cycle->id} closed. Job dispatched.");
            }

        })
        ->daily()                          // كل يوم الساعة 12 منتصف الليل
        ->name('process-performance-cycles')
        ->withoutOverlapping()             // لا يشتغل مرتين بنفس الوقت
        ->runInBackground();               // في الخلفية
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__ . '/Commands');
        require base_path('routes/console.php');
    }
}
