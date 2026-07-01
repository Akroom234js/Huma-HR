<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use App\Models\PerformanceCycle;
use App\Jobs\ProcessPerformanceJob;
use Illuminate\Support\Facades\Log;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// ══════════════════════════════════════════════════════════════════════════
// ✅ Performance Module — تفعيل وإغلاق الدورات تلقائياً
// ══════════════════════════════════════════════════════════════════════════
Schedule::call(function () {
    Log::info('Scheduler: Checking performance cycles...');

    $activated = PerformanceCycle::where('status', 'draft')
        ->whereDate('start_date', '<=', now()->toDateString())
        ->update(['status' => 'active']);

    if ($activated > 0) {
        Log::info("Scheduler: {$activated} cycle(s) activated.");
    }

    $expired = PerformanceCycle::where('status', 'active')
        ->whereDate('end_date', '<', now()->toDateString())
        ->get();

    foreach ($expired as $cycle) {
        $cycle->update(['status' => 'processing']);
        ProcessPerformanceJob::dispatch($cycle);
        Log::info("Scheduler: Cycle #{$cycle->id} closed. Job dispatched.");
    }

})->daily()
  ->name('process-performance-cycles')
  ->withoutOverlapping();
