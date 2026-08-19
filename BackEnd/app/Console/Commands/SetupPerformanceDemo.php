<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\EmployeeProfile;
use App\Models\PerformanceTemplate;
use App\Models\PerformanceCycle;
use App\Models\Task;
use App\Models\ManagerEvaluation;
use App\Models\PeerEvaluation;
use App\Models\AttendanceRecord;
use App\Services\PeerEvaluationService;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;

/**
 * ─────────────────────────────────────────────────────────────────────
 *  أمر: performance:demo
 *  يهيّئ بيئة اختبار كاملة لدورة الأداء بزمن مضغوط
 *  بدلاً من أشهر حقيقية → يستخدم أيام ماضية وأيام قادمة قريبة
 * ─────────────────────────────────────────────────────────────────────
 */
class SetupPerformanceDemo extends Command
{
    protected $signature   = 'performance:demo {--reset : احذف بيانات الأداء الموجودة أولاً} {--info : عرض بيانات الدخول فقط}';
    protected $description = 'إعداد بيئة اختبار كاملة لنظام الأداء بزمن مضغوط (دقائق بدلاً من أشهر)';

    public function handle(): int
    {
        if ($this->option('info')) {
            return $this->showLoginInfo();
        }

        $this->info('');
        $this->info('════════════════════════════════════════════════');
        $this->info('   🚀  Huma HR — إعداد بيئة اختبار الأداء');
        $this->info('════════════════════════════════════════════════');

        if ($this->option('reset')) {
            $this->resetPerformanceData();
        }

        // 1. التحقق من وجود المستخدمين الأساسيين وتحديد الحسابات الدقيقة
        $hr       = User::where('email', 'hr@company.com')->first() ?: User::role('hr', 'api')->first();
        $manager  = User::where('email', 'dept.manager@company.com')->first() ?: User::role('department_manager', 'api')->first();
        $employee = User::where('email', 'employee@company.com')->first() ?: User::role('employee', 'api')->first();

        if (! $hr || ! $manager || ! $employee) {
            $this->error('❌ لم يتم العثور على المستخدمين المطلوبين. تأكد من تشغيل: php artisan db:seed');
            return self::FAILURE;
        }

        // تعيين كلمة مرور سهلة وموحدة لتسهيل تجربة تسجيل الدخول
        $hr->update(['password' => bcrypt('password')]);
        $manager->update(['password' => bcrypt('password')]);
        $employee->update(['password' => bcrypt('password')]);

        DB::beginTransaction();
        try {
            // 2. إنشاء/تحديث قالب الأداء النموذجي
            $template = $this->ensureTemplate();

            // 3. إنشاء دورة أداء بتواريخ مضغوطة
            $cycle = $this->createDemoCycle($template, $hr);

            // 4. إنشاء زملاء وسجلات حضور وعمل إضافي للموظف
            $this->ensureDepartmentColleagues($employee);
            $this->createDemoAttendance($employee);
            $this->createDemoAttendance($manager);

            // 5. إنشاء مهام للموظف (بعضها مكتمل ومقيّم)
            $this->createDemoTasks($employee, $manager, $cycle);

            // 6. إنشاء تقييم المدير
            $this->createManagerEvaluation($cycle, $employee, $manager);

            // 7. إنشاء تقييمات الزملاء
            $this->createPeerEvaluations($cycle, $employee, $manager);

            DB::commit();

            $this->showSummary($hr, $manager, $employee, $cycle, $template);

        } catch (\Throwable $e) {
            DB::rollBack();
            $this->error('❌ خطأ: ' . $e->getMessage());
            $this->error($e->getTraceAsString());
            return self::FAILURE;
        }

        return self::SUCCESS;
    }

    // ─── Steps ────────────────────────────────────────────────────

    private function ensureTemplate(): PerformanceTemplate
    {
        $components = [
            'tasks'      => ['weight' => 40, 'is_active' => true, 'sub_weights' => ['completion' => 60, 'quality' => 40]],
            'manager'    => ['weight' => 25, 'is_active' => true, 'sub_weights' => ['professionalism' => 34, 'responsibility' => 33, 'problem_solving' => 33]],
            'peer'       => ['weight' => 15, 'is_active' => true, 'sub_weights' => ['teamwork' => 50, 'cooperation' => 50]],
            'attendance' => ['weight' => 10, 'is_active' => true, 'sub_weights' => ['points_full_attendance' => 10, 'points_minor_late' => 7, 'points_repeated_late' => 4, 'points_absent' => 0]],
            'overtime'   => ['weight' => 10, 'is_active' => true, 'sub_weights' => ['multiplier' => 2, 'max_score_cap' => 100]],
        ];

        // تعيين جميع القوالب الأخرى كغير نشطة
        PerformanceTemplate::where('is_active', true)->update(['is_active' => false]);

        $template = PerformanceTemplate::create([
            'name'       => 'قالب التقييم الشامل (40% مهام + 25% مدير + 15% زملاء + 10% حضور + 10% إضافي)',
            'is_active'  => true,
            'components' => $components,
        ]);

        $this->line("  ✅ تم تجهيز القالب القياسي: <fg=cyan>{$template->name}</>");
        return $template;
    }

    private function createDemoCycle(PerformanceTemplate $template, User $hrUser): PerformanceCycle
    {
        $hrProfile = $hrUser->employeeProfile;

        // الدورة: بدأت قبل 5 أيام وتنتهي غداً → Active الآن
        $startDate = Carbon::now()->subDays(5)->toDateString();
        $endDate   = Carbon::now()->addDay()->toDateString();

        $existing = PerformanceCycle::where('title', 'دورة اختبار سريع — Demo')
            ->whereIn('status', ['draft', 'active'])
            ->first();

        if ($existing) {
            $existing->update([
                'status'                  => 'active',
                'performance_template_id' => $template->id,
                'start_date'              => $startDate,
                'end_date'                => $endDate,
            ]);
            $this->line("  ✅ دورة موجودة ومحدثة (ID: {$existing->id}) — الحالة: <fg=green>active</>");
            return $existing;
        }

        $cycle = PerformanceCycle::create([
            'title'                   => 'دورة اختبار سريع — Demo',
            'performance_template_id' => $template->id,
            'start_date'              => $startDate,
            'end_date'                => $endDate,
            'status'                  => 'active',   // مفعّلة مباشرةً
            'created_by'              => $hrProfile->id,
            'approved_by'             => $hrProfile->id,
            'approved_at'             => now(),
        ]);

        $this->line("  ✅ تم إنشاء الدورة ID: <fg=green>{$cycle->id}</> ({$startDate} → {$endDate})");
        return $cycle;
    }

    private function ensureDepartmentColleagues(User $employeeUser): void
    {
        $employee = $employeeUser->employeeProfile;
        if (! $employee || ! $employee->department_id) return;

        $colleagues = [
            [
                'email'     => 'sarah.connor@company.com',
                'full_name' => 'Sarah Connor',
                'job_title' => 'Frontend Developer',
                'emp_id'    => 'EMP-0010',
            ],
            [
                'email'     => 'alex.smith@company.com',
                'full_name' => 'Alex Smith',
                'job_title' => 'QA Automation Engineer',
                'emp_id'    => 'EMP-0011',
            ]
        ];

        foreach ($colleagues as $c) {
            $user = User::firstOrCreate(
                ['email' => $c['email']],
                ['password' => bcrypt('password'), 'account_status' => 'active']
            );
            $user->assignRole(\Spatie\Permission\Models\Role::findByName('employee', 'api'));

            EmployeeProfile::firstOrCreate(
                ['user_id' => $user->id],
                [
                    'employee_id'       => $c['emp_id'],
                    'full_name'         => $c['full_name'],
                    'job_title'         => $c['job_title'],
                    'department_id'     => $employee->department_id,
                    'employment_status' => 'active',
                    'start_date'        => '2025-06-01',
                    'salary'            => 5000,
                ]
            );
        }

        $this->line("  ✅ تم التأكد من وجود زملاء في القسم للتقييم (Sarah Connor, Alex Smith)");
    }

    private function createDemoAttendance(User $employeeUser): void
    {
        $employee = $employeeUser->employeeProfile;
        if (! $employee) return;

        for ($i = 5; $i >= 1; $i--) {
            $date = Carbon::now()->subDays($i)->toDateString();
            AttendanceRecord::updateOrCreate(
                [
                    'employee_profile_id' => $employee->id,
                    'date'                => $date,
                ],
                [
                    'status'        => 'present',
                    'check_in'      => '08:55:00',
                    'check_out'     => '18:00:00',
                    'hours_worked'  => 9.0, // 1 hour overtime each day
                ]
            );
        }

        $this->line("  ✅ تم تسجيل حضور وانضباط وإضافي مثالي للموظف: {$employee->full_name}");
    }

    private function createDemoTasks(User $employeeUser, User $managerUser, PerformanceCycle $cycle): void
    {
        $employee = $employeeUser->employeeProfile;
        $manager  = $managerUser->employeeProfile;

        $tasks = [
            [
                'title'                => '📋 تقرير أسبوعي للمشروع',
                'difficulty'           => 'medium',
                'priority'             => 'high',
                'status'               => 'scored',
                'completion_score'     => 90,
                'quality_score'        => 92,
                'days_late'            => 0,
                'late_penalty_per_day' => 5,
                'due_date'             => Carbon::now()->subDays(3)->toDateString(),
                'completed_at'         => Carbon::now()->subDays(3),
                'scored_at'            => Carbon::now()->subDays(2),
            ],
            [
                'title'                => '🔧 إصلاح خطأ عاجل في النظام',
                'difficulty'           => 'hard',
                'priority'             => 'urgent',
                'status'               => 'scored',
                'completion_score'     => 95,
                'quality_score'        => 90,
                'days_late'            => 0,
                'late_penalty_per_day' => 5,
                'due_date'             => Carbon::now()->subDays(4)->toDateString(),
                'completed_at'         => Carbon::now()->subDays(3),
                'scored_at'            => Carbon::now()->subDays(2),
            ],
            [
                'title'                => '📊 تحليل بيانات المبيعات',
                'difficulty'           => 'easy',
                'priority'             => 'low',
                'status'               => 'scored',
                'completion_score'     => 88,
                'quality_score'        => 85,
                'days_late'            => 0,
                'late_penalty_per_day' => 5,
                'due_date'             => Carbon::now()->subDays(2)->toDateString(),
                'completed_at'         => Carbon::now()->subDays(2),
                'scored_at'            => Carbon::now()->subDays(1),
            ],
            [
                'title'                => '📝 توثيق API الجديد',
                'difficulty'           => 'medium',
                'priority'             => 'medium',
                'status'               => 'pending_review',  // في انتظار مراجعة المدير
                'completion_score'     => null,
                'quality_score'        => null,
                'days_late'            => 0,
                'late_penalty_per_day' => 5,
                'due_date'             => Carbon::now()->addDay()->toDateString(),
            ],
        ];

        $created = 0;
        foreach ($tasks as $taskData) {
            $exists = Task::where('employee_profile_id', $employee->id)
                ->where('title', $taskData['title'])
                ->exists();
            if ($exists) continue;

            Task::create(array_merge($taskData, [
                'employee_profile_id' => $employee->id,
                'assigned_by'         => $manager->id,
                'description'         => 'مهمة تجريبية لاختبار نظام الأداء',
            ]));
            $created++;
        }

        $this->line("  ✅ تم إنشاء {$created} مهام للموظف (3 مقيّمة + 1 قيد المراجعة)");
    }

    private function createManagerEvaluation(PerformanceCycle $cycle, User $employeeUser, User $managerUser): void
    {
        $employee = $employeeUser->employeeProfile;

        $exists = ManagerEvaluation::where('performance_cycle_id', $cycle->id)
            ->where('employee_profile_id', $employee->id)
            ->exists();

        if ($exists) {
            $this->line("  ✅ تقييم المدير موجود مسبقاً");
            return;
        }

        ManagerEvaluation::create([
            'performance_cycle_id' => $cycle->id,
            'employee_profile_id'  => $employee->id,
            'manager_user_id'      => $managerUser->id,
            'professionalism'      => 9,
            'responsibility'       => 9,
            'problem_solving'      => 8,
        ]);

        $this->line("  ✅ تم إنشاء تقييم المدير (احترافية:9 مسؤولية:9 حل مشكلات:8)");
    }

    private function createPeerEvaluations(PerformanceCycle $cycle, User $employeeUser, User $managerUser): void
    {
        $employee = $employeeUser->employeeProfile;

        $exists = PeerEvaluation::where('performance_cycle_id', $cycle->id)
            ->where('employee_profile_id', $employee->id)
            ->exists();

        if ($exists) {
            $this->line("  ✅ تقييم الزملاء موجود مسبقاً");
            return;
        }

        // استخدم Service لضمان صحة الـ token_hash والتشفير
        $peerService = app(PeerEvaluationService::class);
        $peerService->storeEvaluation(
            cycleId:            $cycle->id,
            employeeProfileId:  $employee->id,
            evaluatorUserId:    $managerUser->id,
            collaborationScore: 9,
            teamworkScore:      9,
            comment:            'موظف متعاون ومبدع — تقييم تجريبي ممتاز'
        );

        $this->line("  ✅ تم إنشاء تقييم الزملاء (تعاون:9 عمل جماعي:9)");
    }

    // ─── Helpers ─────────────────────────────────────────────────

    private function resetPerformanceData(): void
    {
        $this->warn('  🗑️  حذف بيانات الأداء السابقة...');
        DB::statement('SET FOREIGN_KEY_CHECKS=0');
        \App\Models\PerformanceEvaluation::truncate();
        ManagerEvaluation::truncate();
        PeerEvaluation::truncate();
        Task::whereIn('title', [
            '📋 تقرير أسبوعي للمشروع',
            '🔧 إصلاح خطأ عاجل في النظام',
            '📊 تحليل بيانات المبيعات',
            '📝 توثيق API الجديد',
        ])->delete();
        PerformanceCycle::where('title', 'دورة اختبار سريع — Demo')->delete();
        DB::statement('SET FOREIGN_KEY_CHECKS=1');
        $this->line('  ✅ تم الحذف');
    }

    private function showSummary(User $hr, User $manager, User $employee, PerformanceCycle $cycle, PerformanceTemplate $template): void
    {
        $this->info('');
        $this->info('════════════════════════════════════════════════');
        $this->info('   ✅  البيئة جاهزة — ابدأ الاختبار الآن!');
        $this->info('════════════════════════════════════════════════');
        $this->info('');

        $this->table(
            ['الدور', 'الاسم', 'الإيميل', 'كلمة المرور'],
            [
                ['🏢 HR (مسؤول الموارد البشرية)', $hr->employeeProfile?->full_name ?? 'HR Admin',        $hr->email,       'password'],
                ['👔 Manager (مدير القسم)',      $manager->employeeProfile?->full_name ?? 'Manager',      $manager->email,  'password'],
                ['👤 Employee (الموظف)',         $employee->employeeProfile?->full_name ?? 'Employee',   $employee->email, 'password'],
            ]
        );

        $this->info('');
        $this->line("  🔗 الواجهة:  <fg=cyan>http://localhost:5173</>");
        $this->line("  🔗 API:       <fg=cyan>http://localhost:8000/api</>");
        $this->info('');
        $this->line("  📁 القالب:    <fg=yellow>{$template->name}</> (ID: {$template->id})");
        $this->line("  📅 الدورة:    <fg=yellow>{$cycle->title}</> (ID: {$cycle->id}) — الحالة: <fg=green>{$cycle->status}</>");
        $this->line("  📆 الفترة:    {$cycle->start_date->format('Y-m-d')} → {$cycle->end_date->format('Y-m-d')}");
        $this->info('');
        $this->info('  ─── خطوات الاختبار السريع ───────────────────');
        $this->line('  1. سجّل دخول بحساب HR → شاهد لوحة الأداء');
        $this->line("  2. اذهب لـ Performance → ستجد الدورة ID:{$cycle->id} نشطة");
        $this->line('  3. سجّل دخول Manager → قيّم المهمة المعلّقة');
        $this->line("  4. سجّل دخول HR → أغلق الدورة لتحسب النتائج");
        $this->line('  5. شاهد نتيجة الموظف في صفحة التقارير');
        $this->info('');
        $this->line("  ⚡ لإغلاق الدورة وحساب النتائج فوراً:");
        $this->line("     <fg=cyan>php artisan performance:close-cycle {$cycle->id}</>");
        $this->info('════════════════════════════════════════════════');
    }

    private function showLoginInfo(): int
    {
        $hr       = User::where('email', 'hr@company.com')->first() ?: User::role('hr', 'api')->first();
        $manager  = User::where('email', 'dept.manager@company.com')->first() ?: User::role('department_manager', 'api')->first();
        $employee = User::where('email', 'employee@company.com')->first() ?: User::role('employee', 'api')->first();

        $this->info('');
        $this->table(
            ['الدور', 'الاسم', 'الإيميل', 'كلمة المرور'],
            [
                ['HR',       $hr->employeeProfile?->full_name ?? 'HR',       $hr?->email       ?? 'غير موجود', 'password'],
                ['Manager',  $manager->employeeProfile?->full_name ?? 'Mgr',  $manager?->email  ?? 'غير موجود', 'password'],
                ['Employee', $employee->employeeProfile?->full_name ?? 'Emp', $employee?->email ?? 'غير موجود', 'password'],
            ]
        );

        $cycle = PerformanceCycle::where('title', 'دورة اختبار سريع — Demo')
            ->whereIn('status', ['active', 'draft', 'processing', 'completed'])
            ->latest()
            ->first();

        if ($cycle) {
            $this->line("  📅 الدورة الحالية: <fg=yellow>{$cycle->title}</> — <fg=green>{$cycle->status}</> (ID: {$cycle->id})");
        } else {
            $this->warn('  ⚠️  لا توجد دورة demo. شغّل: php artisan performance:demo');
        }

        return self::SUCCESS;
    }
}
