<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\PerformanceCycle;
use App\Jobs\ProcessPerformanceJob;
use App\Services\TaskPerformanceService;
use App\Services\PeerEvaluationService;
use App\Services\ManagerEvaluationService;

/**
 * أمر سريع لإغلاق دورة أداء وتشغيل حساب النتائج فوراً (synchronously)
 * بدلاً من الانتظار لانتهاء التاريخ الحقيقي
 *
 * الاستخدام:
 *   php artisan performance:close-cycle {id}       ← تحديد ID الدورة
 *   php artisan performance:close-cycle --demo      ← إغلاق دورة الـ Demo تلقائياً
 */
class CloseCycleNow extends Command
{
    protected $signature   = 'performance:close-cycle {id? : ID الدورة} {--demo : أغلق دورة Demo تلقائياً}';
    protected $description = 'أغلق دورة أداء وشغّل حساب النتائج فوراً (للاختبار السريع)';

    public function handle(): int
    {
        // تحديد الدورة
        if ($this->option('demo')) {
            $cycle = PerformanceCycle::where('title', 'دورة اختبار سريع — Demo')
                ->whereIn('status', ['active', 'draft'])
                ->latest()
                ->first();

            if (! $cycle) {
                $this->error('❌ لم يتم العثور على دورة Demo. شغّل أولاً: php artisan performance:demo');
                return self::FAILURE;
            }
        } else {
            $id = $this->argument('id');
            if (! $id) {
                $this->error('❌ يجب تحديد ID الدورة أو استخدام --demo');
                $this->line('   مثال: php artisan performance:close-cycle 1');
                return self::FAILURE;
            }
            $cycle = PerformanceCycle::find($id);
            if (! $cycle) {
                $this->error("❌ لم يتم العثور على دورة بـ ID: {$id}");
                return self::FAILURE;
            }
        }

        // التحقق من الحالة
        if (! in_array($cycle->status, ['active', 'draft'])) {
            $this->warn("⚠️  الدورة حالتها: {$cycle->status} — لا يمكن إغلاقها مرة أخرى");
            $this->showResults($cycle);
            return self::SUCCESS;
        }

        $this->info('');
        $this->info("🔄 إغلاق الدورة: {$cycle->title} (ID: {$cycle->id})");
        $this->info('');

        // تغيير الحالة إلى processing
        $cycle->update(['status' => 'processing']);
        $this->line('  ✅ الحالة → processing');

        // تشغيل الحساب فوراً (synchronously في QUEUE_CONNECTION=sync)
        $this->line('  ⚙️  جاري حساب نتائج الأداء...');

        try {
            $taskService    = app(TaskPerformanceService::class);
            $peerService    = app(PeerEvaluationService::class);
            $managerService = app(ManagerEvaluationService::class);

            ProcessPerformanceJob::dispatchSync($cycle);
            $this->line('  ✅ تم حساب النتائج بنجاح!');
        } catch (\Throwable $e) {
            $this->error('❌ خطأ أثناء الحساب: ' . $e->getMessage());
            $cycle->update(['status' => 'active']);
            return self::FAILURE;
        }

        // إعادة تحميل الدورة
        $cycle->refresh();
        $this->info('');
        $this->showResults($cycle);

        return self::SUCCESS;
    }

    private function showResults(PerformanceCycle $cycle): void
    {
        $evaluations = $cycle->evaluations()->with('employee')->get();

        $this->info("════════════════════════════════════════════════");
        $this->info("  📊 نتائج الدورة: {$cycle->title}");
        $this->info("  📈 الحالة: {$cycle->status}");
        $this->info("════════════════════════════════════════════════");

        if ($evaluations->isEmpty()) {
            $this->warn('  ⚠️  لا توجد تقييمات بعد');
            return;
        }

        $rows = $evaluations->map(fn($e) => [
            $e->employee?->full_name ?? "#{$e->employee_profile_id}",
            $e->tasks_score    ?? '—',
            $e->manager_score  ?? '—',
            $e->peer_score     ?? '—',
            $e->final_score    ?? '—',
            $this->decisionLabel($e->final_score),
            $e->status,
        ])->toArray();

        $this->table(
            ['الموظف', 'مهام', 'مدير', 'زملاء', 'النهائية', 'القرار', 'الحالة'],
            $rows
        );

        $this->info('');
        $this->line("  🔗 لمشاهدة النتائج في الواجهة:");
        $this->line("     http://localhost:5173/hr-performance/reports");
        $this->info('════════════════════════════════════════════════');
    }

    private function decisionLabel(?float $score): string
    {
        if (is_null($score)) return '—';
        return match (true) {
            $score >= 90 => '🏆 ترقية',
            $score >= 75 => '💰 مكافأة',
            $score >= 60 => '📚 تدريب',
            default      => '⚠️  إنذار',
        };
    }
}
