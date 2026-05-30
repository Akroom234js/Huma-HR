<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\PerformanceCycle;
use App\Models\PerformanceCycleComponent;
use App\Models\PerformanceEvaluation;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PerformanceTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        \Illuminate\Support\Facades\Schema::disableForeignKeyConstraints();
    }

    /**
     * مساعد لإنشاء ملف تعريف موظف HR صالح يتجنب مشاكل القيود الأجنبية
     */
    protected function createHRProfile(): int
    {
        $user = \App\Models\User::forceCreate([
            'email' => 'hr@huma.com',
            'password' => bcrypt('password'),
        ]);

        $employee = \App\Models\EmployeeProfile::forceCreate([
            'user_id' => $user->id,
            'full_name' => 'HR Manager',
        ]);

        return $employee->id;
    }

    /**
     * اختبار التحقق من المدد المقبولة لدورات الأداء (بين 3 شهور وسنة)
     */
    public function test_performance_cycle_duration_validation(): void
    {
        $cycle = new PerformanceCycle();

        // حالة 1: مدة مقبولة (3 أشهر كاملة)
        $cycle->start_date = Carbon::parse('2026-01-01');
        $cycle->end_date = Carbon::parse('2026-03-31');
        $this->assertTrue($cycle->isValidDuration());

        // حالة 2: مدة مقبولة (سنة كاملة)
        $cycle->start_date = Carbon::parse('2026-01-01');
        $cycle->end_date = Carbon::parse('2026-12-31');
        $this->assertTrue($cycle->isValidDuration());

        // حالة 3: مدة غير مقبولة (أقل من 3 أشهر)
        $cycle->start_date = Carbon::parse('2026-01-01');
        $cycle->end_date = Carbon::parse('2026-02-15');
        $this->assertFalse($cycle->isValidDuration());

        // حالة 4: مدة غير مقبولة (أكثر من سنة)
        $cycle->start_date = Carbon::parse('2026-01-01');
        $cycle->end_date = Carbon::parse('2027-02-01');
        $this->assertFalse($cycle->isValidDuration());
    }

    /**
     * اختبار التحقق من الأوزان الإجمالية للمكونات الديناميكية المفعلة
     */
    public function test_performance_cycle_dynamic_weights_validation(): void
    {
        $hrId = $this->createHRProfile();

        $cycle = PerformanceCycle::forceCreate([
            'title' => 'Q1 2026 Test',
            'start_date' => '2026-01-01',
            'end_date' => '2026-03-31',
            'created_by' => $hrId,
        ]);

        // حالة 1: إعداد مكونات صحيحة (المجموع 100)
        PerformanceCycleComponent::forceCreate([
            'performance_cycle_id' => $cycle->id,
            'component_key' => 'tasks',
            'weight' => 40.00,
            'is_active' => true,
        ]);
        PerformanceCycleComponent::forceCreate([
            'performance_cycle_id' => $cycle->id,
            'component_key' => 'manager',
            'weight' => 30.00,
            'is_active' => true,
        ]);
        PerformanceCycleComponent::forceCreate([
            'performance_cycle_id' => $cycle->id,
            'component_key' => 'peer',
            'weight' => 10.00,
            'is_active' => true,
        ]);
        PerformanceCycleComponent::forceCreate([
            'performance_cycle_id' => $cycle->id,
            'component_key' => 'attendance',
            'weight' => 20.00,
            'is_active' => true,
        ]);

        $this->assertTrue($cycle->areWeightsValid());

        // حالة 2: تعطيل مكون وجعل المجموع غير صحيح (المجموع 90)
        $peerComponent = PerformanceCycleComponent::where('component_key', 'peer')->first();
        $peerComponent->update(['is_active' => false]);
        
        $this->assertFalse($cycle->areWeightsValid());
    }

    /**
     * اختبار حساب الدرجة النهائية بناءً على الأوزان الديناميكية
     */
    public function test_dynamic_final_performance_score_calculation(): void
    {
        $hrId = $this->createHRProfile();

        $cycle = PerformanceCycle::forceCreate([
            'title' => 'Q1 2026 Calculation Test',
            'start_date' => '2026-01-01',
            'end_date' => '2026-03-31',
            'created_by' => $hrId,
        ]);

        // إضافة أوزان ديناميكية
        PerformanceCycleComponent::forceCreate([
            'performance_cycle_id' => $cycle->id,
            'component_key' => 'tasks',
            'weight' => 40.00,
            'is_active' => true,
        ]);
        PerformanceCycleComponent::forceCreate([
            'performance_cycle_id' => $cycle->id,
            'component_key' => 'manager',
            'weight' => 30.00,
            'is_active' => true,
        ]);
        PerformanceCycleComponent::forceCreate([
            'performance_cycle_id' => $cycle->id,
            'component_key' => 'peer',
            'weight' => 10.00,
            'is_active' => true,
        ]);
        PerformanceCycleComponent::forceCreate([
            'performance_cycle_id' => $cycle->id,
            'component_key' => 'attendance',
            'weight' => 20.00,
            'is_active' => true,
        ]);

        // إنشاء التقييم
        $evaluation = new PerformanceEvaluation([
            'performance_cycle_id' => $cycle->id,
            'tasks_score' => 90.00,       // 90 * 0.4 = 36
            'manager_score' => 80.00,     // 80 * 0.3 = 24
            'peer_score' => 100.00,       // 100 * 0.1 = 10
            'attendance_score' => 95.00,  // 95 * 0.2 = 19
        ]);

        // ربط العلاقة يدوياً لتفادي استعلام إضافي
        $evaluation->setRelation('performanceCycle', $cycle);

        // الدرجة المتوقعة: 36 + 24 + 10 + 19 = 89
        $finalScore = $evaluation->calculateFinalScore();
        
        $this->assertEquals(89.00, $finalScore);
        $this->assertEquals(89.00, floatval($evaluation->final_score));
    }
}
