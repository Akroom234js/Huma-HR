<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\EmployeeProfile;
use App\Models\Department;
use App\Models\PerformanceTemplate;
use App\Models\PerformanceCycle;
use App\Models\PerformanceEvaluation;
use Laravel\Sanctum\Sanctum;
use Illuminate\Foundation\Testing\RefreshDatabase;

class PerformanceEvaluationTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_get_their_own_evaluation(): void
    {
        $user = User::forceCreate([
            'email' => 'employee@company.com',
            'password' => bcrypt('password'),
            'account_status' => 'active',
        ]);
        $dept = Department::create(['name' => 'Engineering']);
        $profile = EmployeeProfile::create([
            'user_id' => $user->id,
            'full_name' => 'John Doe',
            'department_id' => $dept->id,
            'employment_status' => 'active',
        ]);

        $template = PerformanceTemplate::create([
            'name' => 'Test Template',
            'is_active' => true,
            'components' => [
                'tasks' => 40,
                'manager' => 25,
                'peer' => 15,
                'attendance' => 10,
                'overtime' => 10,
            ],
        ]);

        $cycle = PerformanceCycle::create([
            'title' => 'Test Cycle',
            'start_date' => now()->subDays(5),
            'end_date' => now()->addDay(),
            'status' => 'completed',
            'performance_template_id' => $template->id,
            'created_by' => $profile->id,
        ]);

        $eval = PerformanceEvaluation::create([
            'performance_cycle_id' => $cycle->id,
            'employee_profile_id' => $profile->id,
            'department_id' => $dept->id,
            'employment_status' => 'active',
            'tasks_score' => 88.50,
            'manager_score' => 85.00,
            'peer_score' => 90.00,
            'attendance_score' => 100.00,
            'overtime_score' => 10.00,
            'final_score' => 81.30,
            'status' => 'evaluated',
            'ai_analysis' => ['summary' => 'Good performance'],
            'ai_recommendations' => [['course_name' => 'Agile Mastery', 'matching_score' => 95]],
            'evaluated_at' => now(),
        ]);

        Sanctum::actingAs($user, ['*']);

        $response = $this->getJson('/api/performance/my-evaluation');

        $response->assertStatus(200);
        $response->assertJsonPath('data.final_score', '81.30');
        $response->assertJsonPath('data.scores.tasks', '88.50');
    }
}
