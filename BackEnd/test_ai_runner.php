<?php

require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

echo "🚀 Starting AI Performance Coaching Test...\n";

$cycle = App\Models\PerformanceCycle::where('status', 'active')->latest()->first();

if (!$cycle) {
    echo "❌ No active cycle found.\n";
    exit(1);
}

echo "📋 Found active cycle #{$cycle->id}: '{$cycle->title}'\n";
echo "⏳ Closing cycle and running ProcessPerformanceJob with Gemini 2.5 Flash...\n";

$job = new App\Jobs\ProcessPerformanceJob($cycle);
$job->handle(
    app(App\Services\TaskPerformanceService::class),
    app(App\Services\PeerEvaluationService::class),
    app(App\Services\ManagerEvaluationService::class),
    app(App\Services\AIPerformanceCoachingService::class)
);

echo "\n✅ Cycle processing completed!\n";
echo "───────────────────────────────────────────────────────\n";
echo "📊 Results in Database for Evaluated Employees:\n";
echo "───────────────────────────────────────────────────────\n";

$evaluations = App\Models\PerformanceEvaluation::with(['employee', 'performanceCycle'])
    ->where('performance_cycle_id', $cycle->id)
    ->get();

foreach ($evaluations as $eval) {
    echo "\n👤 Employee: " . ($eval->employee->full_name ?? 'N/A') . " (" . ($eval->employee->job_title ?? '') . ")\n";
    echo "📈 Final Score: {$eval->final_score}/100\n";
    echo "📊 Scores Breakdown:\n";
    echo "   - Tasks: " . ($eval->tasks_score ?? 'N/A') . "%\n";
    echo "   - Manager: " . ($eval->manager_score ?? 'N/A') . "%\n";
    echo "   - Peer: " . ($eval->peer_score ?? 'N/A') . "%\n";
    echo "   - Attendance: " . ($eval->attendance_score ?? 'N/A') . "%\n";
    echo "   - Overtime: " . ($eval->overtime_score ?? 'N/A') . "%\n";
    
    echo "\n🤖 AI Analysis (Gemini 2.5 Flash):\n";
    if ($eval->ai_analysis) {
        echo "   - Overall Rating: " . ($eval->ai_analysis['overall_rating'] ?? 'N/A') . "\n";
        echo "   - Summary: " . ($eval->ai_analysis['summary'] ?? 'N/A') . "\n";
        echo "   - Weak Areas: " . implode(', ', $eval->ai_analysis['weak_areas'] ?? []) . "\n";
    }

    echo "\n🎓 AI Recommended Training Courses (Coaching):\n";
    if (!empty($eval->ai_recommendations)) {
        foreach ($eval->ai_recommendations as $i => $rec) {
            $num = $i + 1;
            echo "   [Course #{$num}]: " . ($rec['course_name'] ?? $rec['title'] ?? 'N/A') . "\n";
            echo "     • Target Gap: " . ($rec['weak_area'] ?? 'General') . "\n";
            echo "     • Reason: " . ($rec['reason'] ?? $rec['description'] ?? 'N/A') . "\n";
        }
    } else {
        echo "   (No recommendations needed - All scores >= 70%)\n";
    }
    echo "───────────────────────────────────────────────────────\n";
}
