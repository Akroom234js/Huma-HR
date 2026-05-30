<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\DB;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

// --- SMART FEATURES: Yearly Reset Cron Job for Leave Balances ---
Artisan::command('leaves:reset-balances', function () {
    $this->info('Starting yearly reset of leave balances...');
    
    // Reset leave balances: set used = 0, remaining = allocated
    \App\Models\LeaveBalance::query()->update([
        'used' => 0,
        'remaining' => DB::raw('allocated')
    ]);
    
    $this->info('Leave balances reset successfully.');
})->purpose('Yearly reset of all employee leave balances.');

// Schedule the cron job to run quietly at midnight on New Year's Eve
Schedule::command('leaves:reset-balances')->yearly();
