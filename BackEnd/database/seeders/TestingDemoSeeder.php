<?php

namespace Database\Seeders;

use App\Models\Application;
use App\Models\AttendanceRecord;
use App\Models\Department;
use App\Models\EmployeeProfile;
use App\Models\JobPosting;
use App\Models\ManagerEvaluation;
use App\Models\OfficeLocation;
use App\Models\PeerEvaluation;
use App\Models\PerformanceCycle;
use App\Models\PerformanceTemplate;
use App\Models\Position;
use App\Models\Task;
use App\Models\User;
use App\Services\PeerEvaluationService;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;

class TestingDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->command->info('🚀 Starting TestingDemoSeeder for ATS and Performance Review testing...');

        // ─────────────────────────────────────────────────────────────────
        // 1. Ensure basic roles and users exist
        // ─────────────────────────────────────────────────────────────────
        $hrProfile = EmployeeProfile::whereHas('user', function ($q) {
            $q->whereHas('roles', fn($r) => $r->where('name', 'hr')->where('guard_name', 'api'));
        })->first();

        $deptManagerProfile = EmployeeProfile::whereHas('user', function ($q) {
            $q->whereHas('roles', fn($r) => $r->where('name', 'department_manager')->where('guard_name', 'api'));
        })->first();

        $employeeProfile = EmployeeProfile::where('job_title', 'like', '%Developer%')->first()
            ?? EmployeeProfile::where('id', '!=', $hrProfile?->id)->first();

        $engDept = Department::where('name', 'Engineering')->first() ?? Department::first();
        $devPos = Position::where('title', 'like', '%Developer%')->first() ?? Position::first();
        $office = OfficeLocation::first();

        // ─────────────────────────────────────────────────────────────────
        // 2. ATS (Recruitment) Module Seeding
        // ─────────────────────────────────────────────────────────────────
        $this->command->info('📄 Seeding ATS: Job Postings and Applications...');

        // Job 1: Senior Laravel Developer (Open)
        $job1 = JobPosting::updateOrCreate(
            ['title' => 'Senior Laravel & Backend Developer'],
            [
                'department_id'        => $engDept?->id,
                'position_id'          => $devPos?->id,
                'description'          => "We are looking for a Senior Laravel Developer with 4+ years of experience in PHP, Laravel Framework, REST APIs, MySQL, Queue workers, Docker, and Redis caching.",
                'salary_min'           => 4500,
                'salary_max'           => 7000,
                'salary_currency'      => 'USD',
                'status'               => JobPosting::STATUS_OPEN,
                'posted_at'            => now()->subDays(10),
                'application_deadline' => now()->addDays(20),
                'location'             => 'Remote / Damascus Office',
                'employment_type'      => 'full-time',
                'experience_level'     => 'mid-senior',
                'created_by'           => $hrProfile?->user_id ?? 1,
            ]
        );

        // Job 2: Frontend React Engineer (Open)
        $job2 = JobPosting::updateOrCreate(
            ['title' => 'Frontend React Engineer'],
            [
                'department_id'        => $engDept?->id,
                'position_id'          => $devPos?->id,
                'description'          => "Looking for a skilled Frontend Engineer proficient in React 19, Redux Toolkit, Vite, JavaScript, CSS3/Tailwind, and modern API integrations.",
                'salary_min'           => 3500,
                'salary_max'           => 5500,
                'salary_currency'      => 'USD',
                'status'               => JobPosting::STATUS_OPEN,
                'posted_at'            => now()->subDays(5),
                'application_deadline' => now()->addDays(25),
                'location'             => 'On-site / Hybrid',
                'employment_type'      => 'full-time',
                'experience_level'     => 'associate',
                'created_by'           => $hrProfile?->user_id ?? 1,
            ]
        );

        // Application 1: Strong Candidate (Evaluated with AI Results)
        Application::updateOrCreate(
            ['email' => 'samer.developer@example.com'],
            [
                'job_posting_id'     => $job1->id,
                'full_name'          => 'Samer Al-Khatib',
                'phone'              => '+963 944 112 233',
                'date_of_birth'      => '1995-06-15',
                'address'            => 'Damascus, Syria',
                'status'             => Application::STATUS_SHORTLISTED,
                'current_stage'      => 'shortlisted',
                'submitted_at'       => now()->subDays(3),
                'reviewed_at'        => now()->subDays(2),
                'match_score'        => 88.0,
                'evaluated_at'       => now()->subDays(2),
                'ai_analysis'        => [
                    'overall_score'       => 88,
                    'keyword_score'       => 85,
                    'ai_score'            => 90,
                    'skills_match'        => 92,
                    'experience_match'    => 88,
                    'education_match'     => 85,
                    'matched_skills'      => ['PHP', 'Laravel', 'MySQL', 'REST API', 'Docker', 'Git'],
                    'missing_skills'      => ['Redis'],
                    'strengths'           => ['Extensive 5-year experience building Laravel REST APIs', 'Good knowledge of database optimization and Queues'],
                    'weaknesses'          => ['Limited Redis clustering experience'],
                    'recommendation'      => 'Excellent match. Highly recommended for technical interview.',
                    'fit_level'           => 'High',
                    'hire_recommendation' => true,
                ],
            ]
        );

        // Application 2: Fresh Candidate waiting for AI Evaluation (Pending)
        Application::updateOrCreate(
            ['email' => 'hassan.candidate@example.com'],
            [
                'job_posting_id'     => $job1->id,
                'full_name'          => 'Hassan Nader',
                'phone'              => '+963 933 554 433',
                'date_of_birth'      => '1998-11-20',
                'address'            => 'Homs, Syria',
                'status'             => Application::STATUS_PENDING,
                'current_stage'      => 'applied',
                'submitted_at'       => now()->subHours(5),
                'match_score'        => null,
                'evaluated_at'       => null,
                'ai_analysis'        => null,
            ]
        );

        // ─────────────────────────────────────────────────────────────────
        // 3. Performance Review & AI Coaching Seeding
        // ─────────────────────────────────────────────────────────────────
        $this->command->info('🎯 Seeding Performance Evaluation: Template, Cycle, Tasks, and Gaps for AI Testing...');

        // 3.1 Ensure Active Template
        $template = PerformanceTemplate::updateOrCreate(
            ['name' => 'Default Company Template'],
            [
                'is_active'  => true,
                'components' => [
                    'tasks' => [
                        'weight'      => 40,
                        'is_active'   => true,
                        'sub_weights' => ['completion' => 60, 'quality' => 40],
                    ],
                    'manager' => [
                        'weight'      => 25,
                        'is_active'   => true,
                        'sub_weights' => ['professionalism' => 34, 'responsibility' => 33, 'problem_solving' => 33],
                    ],
                    'peer' => [
                        'weight'      => 15,
                        'is_active'   => true,
                        'sub_weights' => ['collaboration' => 50, 'teamwork' => 50],
                    ],
                    'attendance' => [
                        'weight'      => 10,
                        'is_active'   => true,
                        'sub_weights' => [],
                    ],
                    'overtime' => [
                        'weight'      => 10,
                        'is_active'   => true,
                        'sub_weights' => [],
                    ],
                ],
            ]
        );

        // 3.2 Performance Cycle (Active and ready to be closed for testing)
        $startDate = now()->subDays(30);
        $endDate   = now()->subDays(1); // Cycle date ended, ready to close!

        $cycle = PerformanceCycle::updateOrCreate(
            ['title' => 'Q1 2026 Technical & Performance Review'],
            [
                'performance_template_id' => $template->id,
                'start_date'              => $startDate->toDateString(),
                'end_date'                => $endDate->toDateString(),
                'status'                  => 'active', // Active so user can click "Close" to test!
                'created_by'              => $hrProfile?->id ?? 1,
                'approved_by'             => $hrProfile?->id ?? 1,
                'approved_at'             => $startDate,
            ]
        );

        if ($employeeProfile) {
            // 3.3 Tasks with intentional gap (< 70%) to trigger AI coaching on Task Completion
            Task::updateOrCreate(
                ['title' => 'Implement Payment Gateway Integration', 'employee_profile_id' => $employeeProfile->id],
                [
                    'assigned_by'          => $deptManagerProfile?->id ?? 1,
                    'description'          => 'Integrate Stripe and PayPal APIs with webhook verification.',
                    'due_date'             => $startDate->copy()->addDays(10),
                    'difficulty'           => 'hard',
                    'priority'             => 'high',
                    'status'               => 'completed',
                    'completion_score'     => 55.0, // Low score!
                    'quality_score'        => 60.0, // Low score!
                    'completed_at'         => $startDate->copy()->addDays(15),
                    'scored_at'            => $startDate->copy()->addDays(16),
                ]
            );

            Task::updateOrCreate(
                ['title' => 'Optimize Database Indexing & Caching', 'employee_profile_id' => $employeeProfile->id],
                [
                    'assigned_by'          => $deptManagerProfile?->id ?? 1,
                    'description'          => 'Add composite indexes and cache query responses in Redis.',
                    'due_date'             => $startDate->copy()->addDays(20),
                    'difficulty'           => 'medium',
                    'priority'             => 'medium',
                    'status'               => 'completed',
                    'completion_score'     => 58.0,
                    'quality_score'        => 62.0,
                    'completed_at'         => $startDate->copy()->addDays(22),
                    'scored_at'            => $startDate->copy()->addDays(23),
                ]
            );

            // 3.4 Manager Evaluation with deliberate weak score on problem solving (score < 70)
            if ($deptManagerProfile && $deptManagerProfile->user_id) {
                ManagerEvaluation::updateOrCreate(
                    [
                        'performance_cycle_id' => $cycle->id,
                        'employee_profile_id'  => $employeeProfile->id,
                    ],
                    [
                        'manager_user_id' => $deptManagerProfile->user_id,
                        'professionalism' => 6, // 6/10
                        'responsibility'  => 6, // 6/10
                        'problem_solving' => 5, // 5/10 (Gap!)
                        'average_score'   => 5.67,
                        'final_score'     => 56.70,
                    ]
                );
            }

            // 3.5 Peer Evaluations with Encrypted Comments
            $peerService = app(PeerEvaluationService::class);
            if ($hrProfile && $hrProfile->user_id) {
                $token = $peerService->generateAnonymousToken($hrProfile->user_id, $cycle->id);
                $enc = $peerService->encryptComment("Good technical contributor, but needs to improve cross-functional communication and proactive updates during sprint blockers.");

                PeerEvaluation::updateOrCreate(
                    [
                        'performance_cycle_id' => $cycle->id,
                        'employee_profile_id'  => $employeeProfile->id,
                        'token_hash'           => $token,
                    ],
                    [
                        'collaboration_score' => 6, // 6/10
                        'teamwork_score'      => 6, // 6/10
                        'encrypted_comment'   => $enc['encrypted'],
                        'iv'                  => base64_decode($enc['iv']),
                    ]
                );
            }

            // 3.6 Attendance records
            AttendanceRecord::updateOrCreate(
                [
                    'employee_profile_id' => $employeeProfile->id,
                    'date'                => $startDate->copy()->addDays(2)->toDateString(),
                ],
                [
                    'check_in'           => '09:15:00',
                    'check_out'          => '17:00:00',
                    'hours_worked'       => 7.75,
                    'status'             => 'late',
                    'office_location_id' => $office?->id,
                ]
            );

            AttendanceRecord::updateOrCreate(
                [
                    'employee_profile_id' => $employeeProfile->id,
                    'date'                => $startDate->copy()->addDays(3)->toDateString(),
                ],
                [
                    'check_in'           => '09:00:00',
                    'check_out'          => '18:30:00',
                    'hours_worked'       => 9.5,
                    'status'             => 'present',
                    'office_location_id' => $office?->id,
                ]
            );
        }

        $this->command->info('✅ TestingDemoSeeder completed successfully!');
        $this->command->info("ℹ️ Performance Cycle '{$cycle->title}' is ACTIVE and ready to be closed to test AI Coaching.");
        $this->command->info("ℹ️ Test with Employee: " . ($employeeProfile?->full_name ?? 'John Doe'));
    }
}
