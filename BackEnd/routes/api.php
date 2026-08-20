<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeMovementController;
use App\Http\Controllers\SalaryAdjustmentController;
use App\Http\Controllers\EmployeeRequestController;
use App\Http\Controllers\PayrollController;
use App\Http\Controllers\PositionController;
use App\Http\Controllers\SalaryStructureController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\JobPostingController;
use App\Http\Controllers\InterviewController;
use App\Http\Controllers\OfferController;
use App\Http\Controllers\OrgChartController;
use App\Http\Controllers\OfficeLocationController;
use App\Http\Controllers\AttendanceController;
use App\Http\Controllers\DepartmentHourController;
use App\Http\Controllers\TaskController;
use App\Http\Controllers\PerformanceCycleController;
use App\Http\Controllers\ManagerEvaluationController;
use App\Http\Controllers\PeerEvaluationController;
use App\Http\Controllers\PerformanceActionController;
use App\Http\Controllers\PerformanceEvaluationController;
use App\Http\Controllers\PerformanceStatsController;
use App\Http\Controllers\PerformanceTemplateController;
use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

// ══════════════════════════════════════════════════════════════════════════════
// Public Routes — بدون مصادقة
// ══════════════════════════════════════════════════════════════════════════════

Route::get('/system-repair-db', function () {
     if (request()->query('secret') !== env('DB_REPAIR_SECRET')) {
        abort(404);
    }
    try {
        echo "Starting Database Sync...<br>";
        $driver = DB::getDriverName();
        echo "Database Driver: {$driver}<br>";
        if ($driver === 'mysql') DB::statement('SET FOREIGN_KEY_CHECKS = 0;');
        \Illuminate\Support\Facades\Schema::dropAllTables();
        if ($driver === 'mysql') DB::statement('SET FOREIGN_KEY_CHECKS = 1;');
        Artisan::call('migrate', ['--force' => true]);
        echo "<pre>" . Artisan::output() . "</pre>";
        Artisan::call('db:seed', ['--force' => true]);
        echo "<pre>" . Artisan::output() . "</pre>";
        return "<h2 style='color:green'>Database Synced & Seeded Successfully!</h2>";
    } catch (\Exception $e) {
        return "<h2 style='color:red'>Sync Failed!</h2><p>Error: " . $e->getMessage() . "</p>";
    }
});

Route::prefix('auth')->group(function () {
    Route::post('/sessions',        [AuthController::class, 'login']);
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
    Route::put('/password/reset',   [AuthController::class, 'resetPassword']);
});

// ✅ ATS Public Routes
Route::get('/job-postings',              [JobPostingController::class,  'index']);
Route::get('/job-postings/{jobPosting}', [JobPostingController::class,  'show']);
Route::post('/job-postings/{id}/apply',  [ApplicationController::class, 'store']);

// ══════════════════════════════════════════════════════════════════════════════
// Protected Routes — تحتاج توكن
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware('auth:sanctum')->group(function () {

    // ── أي مستخدم مسجّل دخول ─────────────────────────────────────────────
    Route::delete('/auth/sessions', [AuthController::class, 'logout']);
    Route::get('/my-profile',       [EmployeeController::class, 'myProfile']);
    Route::put('/my-profile',       [EmployeeController::class, 'updateMyProfile']);
    Route::post('/my-profile',      [EmployeeController::class, 'updateMyProfile']);

    Route::get('/auth/verify-role-access', function () {
        $user = auth()->user();
        $role = 'employee';
        if ($user->hasRole('hr', 'api')) $role = 'hr';
        elseif ($user->hasAnyRole(['department_manager', 'manager', 'boss'], 'api')) $role = 'department supervisor';
        else $role = $user->roles->pluck('name')->first() ?? 'employee';
        return response()->json(['id' => $user->id, 'role' => $role, 'status' => 'authorized']);
    });

    // ── Attendance ────────────────────────────────────────────────────────
    Route::get('/employee/attendance/today',     [AttendanceController::class, 'today']);
    Route::post('/employee/attendance/checkin',  [AttendanceController::class, 'checkIn']);
    Route::post('/employee/attendance/checkout', [AttendanceController::class, 'checkOut']);
    Route::get('/employee/attendance/history',   [AttendanceController::class, 'history']);
    Route::get('/employee/attendance/trends',    [AttendanceController::class, 'trends']);

    // ── Office Locations Read ─────────────────────────────────────────────
    Route::get('/office-locations',      [OfficeLocationController::class, 'index']);
    Route::get('/office-locations/{id}', [OfficeLocationController::class, 'show']);

    // ── Department Hours Read ─────────────────────────────────────────────
    Route::get('/department-hours', [DepartmentHourController::class, 'index']);

    // ── Employee Requests / Leaves ────────────────────────────────────────
    Route::get('/leave-types',       [EmployeeRequestController::class, 'getLeaveTypes']);
    Route::get('/my-leave-balances', [EmployeeRequestController::class, 'myLeaveBalances']);
    Route::get('/my-requests',       [EmployeeRequestController::class, 'myRequests']);
    Route::post('/requests',         [EmployeeRequestController::class, 'store']);

    // ── Employee Portal ───────────────────────────────────────────────────
    Route::get('/employee/payroll', [PayrollController::class, 'employeeHistory']);
    Route::get('/employee/rewards', [PayrollController::class, 'employeeRewards']);

    Route::get('/employee/recognitions',         [App\Http\Controllers\RecognitionController::class, 'index']);
    Route::post('/employee/recognitions',        [App\Http\Controllers\RecognitionController::class, 'store']);
    Route::put('/employee/recognitions/{id}',    [App\Http\Controllers\RecognitionController::class, 'update']);
    Route::delete('/employee/recognitions/{id}', [App\Http\Controllers\RecognitionController::class, 'destroy']);

    Route::get('/employee/chats',               [App\Http\Controllers\ChatController::class, 'getConversations']);
    Route::get('/employee/chats/contacts',      [App\Http\Controllers\ChatController::class, 'getContacts']);
    Route::get('/employee/chats/{id}/messages', [App\Http\Controllers\ChatController::class, 'getMessages']);
    Route::post('/employee/chats/send',         [App\Http\Controllers\ChatController::class, 'sendMessage']);

    Route::get('/employee/notifications',                [App\Http\Controllers\NotificationController::class, 'index']);
    Route::get('/employee/notifications/unread-count',   [App\Http\Controllers\NotificationController::class, 'unreadCount']);
    Route::post('/employee/notifications/{id}/read',     [App\Http\Controllers\NotificationController::class, 'markRead']);
    Route::post('/employee/notifications/read-all',      [App\Http\Controllers\NotificationController::class, 'markAllRead']);

    // ══════════════════════════════════════════════════════════════════════
    // ✅ Tasks — Performance Module
    // ⚠️ my-tasks لازم قبل /{task}
    // ══════════════════════════════════════════════════════════════════════
    Route::get('/tasks/my-tasks', [TaskController::class, 'myTasks']);

    Route::middleware('role:manager|department_manager|boss|hr')->group(function () {
        Route::get('/tasks',                 [TaskController::class, 'index']);
        Route::post('/tasks',                [TaskController::class, 'store']);
        Route::put('/tasks/{task}',          [TaskController::class, 'update']);
        Route::delete('/tasks/{task}',       [TaskController::class, 'destroy']);
        Route::put('/tasks/{task}/score',    [TaskController::class, 'score']);
        Route::put('/tasks/{task}/revision', [TaskController::class, 'revision']);
    });

    Route::get('/tasks/{task}',          [TaskController::class, 'show']);
    Route::put('/tasks/{task}/start',    [TaskController::class, 'start']);
    Route::put('/tasks/{task}/complete', [TaskController::class, 'complete']);

    // ══════════════════════════════════════════════════════════════════════
    // ✅ Performance Module
    // ══════════════════════════════════════════════════════════════════════
    Route::prefix('performance')->group(function () {

        // ── أي موظف — نتيجته هو بس ───────────────────────────────────────
        // ⚠️ my-evaluation لازم قبل أي route فيه {id} لتجنب التعارض
        Route::get('/my-evaluation', [PerformanceEvaluationController::class, 'myEvaluation']);

        // ── HR + Manager — عرض الدورات ────────────────────────────────────
        Route::get('/cycles',         [PerformanceCycleController::class, 'index']);
        Route::get('/cycles/{cycle}', [PerformanceCycleController::class, 'show']);

        // ── أي موظف — تقييم زميل ─────────────────────────────────────────
        Route::post('/peer-evaluations', [PeerEvaluationController::class, 'store']);

        // ── Manager + boss — تقييم الفريق ────────────────────────────────
        // ⚠️ my-team لازم قبل {managerEvaluation}
        Route::middleware('role:manager|department_manager|boss|hr')->group(function () {
            Route::get('/manager-evaluations/my-team/{cycleId}',  [ManagerEvaluationController::class, 'myTeam']);
            Route::post('/manager-evaluations',                    [ManagerEvaluationController::class, 'store']);
            Route::put('/manager-evaluations/{managerEvaluation}', [ManagerEvaluationController::class, 'update']);
        });

        // ── HR فقط ────────────────────────────────────────────────────────
        Route::middleware('role:hr')->group(function () {

            // Stats
            Route::get('/stats', [PerformanceStatsController::class, 'index']);

            // Templates
            Route::get('/templates',             [PerformanceTemplateController::class, 'index']);
            Route::post('/templates',            [PerformanceTemplateController::class, 'store']);
            Route::put('/templates/{template}',  [PerformanceTemplateController::class, 'update']);
            Route::delete('/templates/{template}',[PerformanceTemplateController::class, 'destroy']);

            // Cycles CRUD
            // ⚠️ process-expired لازم قبل {cycle}
            Route::post('/cycles/process-expired', [PerformanceCycleController::class, 'processExpired']);
            Route::post('/cycles',                 [PerformanceCycleController::class, 'store']);
            Route::put('/cycles/{cycle}',          [PerformanceCycleController::class, 'update']);
            Route::post('/cycles/{cycle}/activate',[PerformanceCycleController::class, 'activate']);


            // Evaluations — HR يشوف النتائج
            Route::get('/evaluations/{cycleId}',              [PerformanceEvaluationController::class, 'byCycle']);
            Route::get('/evaluations/{cycleId}/{employeeId}', [PerformanceEvaluationController::class, 'show']);

            // ══════════════════════════════════════════════════════════════════════════════
            // ✅ Dashboard General Stats
            // ══════════════════════════════════════════════════════════════════════════════
            Route::get('/dashboard/general-stats', [DashboardController::class, 'generalStats']);



            // Actions
            Route::get('/actions',                  [PerformanceActionController::class, 'index']);
            Route::put('/actions/{action}/approve', [PerformanceActionController::class, 'approve']);
            Route::put('/actions/{action}/reject',  [PerformanceActionController::class, 'reject']);

            // Manager Evaluation — HR يشوف
            Route::get('/manager-evaluations/{cycleId}/{employeeId}', [ManagerEvaluationController::class, 'show']);

            // Peer Evaluation — HR يشوف + تعليقات
            Route::get('/peer-evaluations/{cycleId}/{employeeId}', [PeerEvaluationController::class, 'show']);
        });
    });

    // ── HR + Manager — عرض فقط ──────────────────────────────────────────
    Route::middleware('role:hr|manager')->group(function () {

        Route::get('/employees/positions',      [EmployeeController::class,         'positions']);
        Route::get('/employees/statuses',       [EmployeeController::class,         'statuses']);
        Route::get('/employees/managers',       [EmployeeController::class,         'managers']);
        Route::get('/employee-movements/types', [EmployeeMovementController::class, 'types']);
        Route::get('/salary-adjustments/types', [SalaryAdjustmentController::class, 'types']);
        Route::get('/departments/stats',        [DepartmentController::class,       'stats']);
        Route::get('/departments',              [DepartmentController::class,       'index']);
        Route::get('/departments/{id}',         [DepartmentController::class,       'show']);
        Route::get('/employees',                [EmployeeController::class,         'index']);
        Route::get('/employees/{id}',           [EmployeeController::class,         'show']);
        Route::get('/employee-movements',       [EmployeeMovementController::class, 'index']);
        Route::get('/employee-movements/{id}',  [EmployeeMovementController::class, 'show']);
        Route::get('/salary-adjustments',       [SalaryAdjustmentController::class, 'index']);
        Route::get('/salary-adjustments/{id}',  [SalaryAdjustmentController::class, 'show']);
        Route::get('/salary-structures/employees',        [SalaryStructureController::class, 'employees']);
        Route::patch('/salary-structures/employees/{id}', [SalaryStructureController::class, 'updateEmployeeSalary']);
        Route::get('/salary-structures',                  [SalaryStructureController::class, 'index']);
        Route::get('/positions',      [PositionController::class, 'index']);
        Route::get('/positions/{id}', [PositionController::class, 'show']);

        Route::get('/org-chart',                      [OrgChartController::class, 'index']);
        Route::get('/org-chart/department/{id}',      [OrgChartController::class, 'byDepartment']);
        Route::post('/positions/org',                 [OrgChartController::class, 'store']);
        Route::put('/positions/{position}/org',       [OrgChartController::class, 'update']);
        Route::patch('/positions/{position}/move',    [OrgChartController::class, 'move']);
        Route::patch('/positions/{position}/assign',  [OrgChartController::class, 'assign']);
        Route::patch('/positions/{position}/unassign',[OrgChartController::class, 'unassign']);

        Route::get('/requests',               [EmployeeRequestController::class, 'index']);
        Route::patch('/requests/{id}/status', [EmployeeRequestController::class, 'updateStatus']);
        Route::get('/leaves/dashboard-analytics', [EmployeeRequestController::class, 'dashboardAnalytics']);

        Route::get('/payroll/overview',      [PayrollController::class, 'overview']);
        Route::post('/payroll/initialize',   [PayrollController::class, 'initialize']);
        Route::get('/payroll',               [PayrollController::class, 'index']);
        Route::patch('/payroll/{id}',        [PayrollController::class, 'update']);
        Route::delete('/payroll/{id}',       [PayrollController::class, 'destroy']);
        Route::patch('/payroll/{id}/pay',    [PayrollController::class, 'pay']);
        Route::patch('/payroll/{id}/revert', [PayrollController::class, 'revert']);
        Route::post('/payroll/pay-all',      [PayrollController::class, 'payAll']);

        Route::get('/deductions',         [App\Http\Controllers\DeductionController::class, 'index']);
        Route::post('/deductions',        [App\Http\Controllers\DeductionController::class, 'store']);
        Route::patch('/deductions/{id}',  [App\Http\Controllers\DeductionController::class, 'update']);
        Route::delete('/deductions/{id}', [App\Http\Controllers\DeductionController::class, 'destroy']);

        Route::get('/bonus-rules',          [App\Http\Controllers\BonusRuleController::class, 'index']);
        Route::post('/bonus-rules',         [App\Http\Controllers\BonusRuleController::class, 'store']);
        Route::patch('/bonus-rules/{id}',   [App\Http\Controllers\BonusRuleController::class, 'update']);
        Route::delete('/bonus-rules/{id}',  [App\Http\Controllers\BonusRuleController::class, 'destroy']);
        Route::post('/bonus-rules/apply',   [App\Http\Controllers\BonusRuleController::class, 'apply']);

        Route::get('/applications/stats',                    [ApplicationController::class, 'stats']);
        Route::get('/applications',                          [ApplicationController::class, 'index']);
        Route::get('/applications/{id}',                     [ApplicationController::class, 'show']);
        Route::get('/applications/{id}/allowed-transitions', [ApplicationController::class, 'allowedTransitions']);
        Route::get('/job-postings/{id}/stats',               [ApplicationController::class, 'stats']);
        Route::get('/interviews',             [InterviewController::class, 'index']);
        Route::get('/interviews/{interview}', [InterviewController::class, 'show']);
    });

    // ── HR فقط ───────────────────────────────────────────────────────────
    Route::middleware('role:hr')->group(function () {
        Route::post('/auth/employees',   [AuthController::class,    'register']);
        Route::put('/employees/{id}',    [EmployeeController::class, 'update']);
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
        Route::post('/office-locations',        [OfficeLocationController::class, 'store']);
        Route::put('/office-locations/{id}',    [OfficeLocationController::class, 'update']);
        Route::delete('/office-locations/{id}', [OfficeLocationController::class, 'destroy']);
        Route::put('/department-hours/{deptName}', [DepartmentHourController::class, 'update']);
        Route::post('/departments',        [DepartmentController::class, 'store']);
        Route::put('/departments/{id}',    [DepartmentController::class, 'update']);
        Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);
        Route::post('/employee-movements',        [EmployeeMovementController::class, 'store']);
        Route::delete('/employee-movements/{id}', [EmployeeMovementController::class, 'destroy']);
        Route::post('/positions',        [PositionController::class, 'store']);
        Route::put('/positions/{id}',    [PositionController::class, 'update']);
        Route::delete('/positions/{id}', [PositionController::class, 'destroy']);
        Route::post('/salary-structures',        [SalaryStructureController::class, 'store']);
        Route::put('/salary-structures/{id}',    [SalaryStructureController::class, 'update']);
        Route::delete('/salary-structures/{id}', [SalaryStructureController::class, 'destroy']);
        Route::post('/salary-adjustments', [SalaryAdjustmentController::class, 'store']);
        Route::post('/leave-types', [EmployeeRequestController::class, 'storeLeaveType']);

        // ATS
        Route::post('/job-postings',                       [JobPostingController::class,  'store']);
        Route::put('/job-postings/{jobPosting}',           [JobPostingController::class,  'update']);
        Route::patch('/job-postings/{jobPosting}/publish', [JobPostingController::class,  'publish']);
        Route::patch('/job-postings/{jobPosting}/close',   [JobPostingController::class,  'close']);
        Route::delete('/job-postings/{jobPosting}',        [JobPostingController::class,  'destroy']);
        Route::patch('/applications/{id}/status',    [ApplicationController::class, 'updateStatus']);
        Route::patch('/applications/{id}/review',    [ApplicationController::class, 'review']);
        Route::patch('/applications/{id}/shortlist', [ApplicationController::class, 'shortlist']);
        Route::patch('/applications/{id}/interview', [ApplicationController::class, 'interview']);
        Route::patch('/applications/{id}/offer',     [ApplicationController::class, 'offer']);
        Route::patch('/applications/{id}/hire',      [ApplicationController::class, 'hire']);
        Route::patch('/applications/{id}/reject',    [ApplicationController::class, 'reject']);
        Route::patch('/applications/{id}/withdraw',  [ApplicationController::class, 'withdraw']);
        Route::delete('/applications/{id}',          [ApplicationController::class, 'destroy']);
        Route::post('/applications/{application}/offers', [OfferController::class, 'store']);
        Route::post('/offers/{offer}/accept',             [OfferController::class, 'accept']);
        Route::get('/applications/{id}/resume',           [ApplicationController::class, 'downloadResume']);
        Route::get('/attachments/{id}/download',          [ApplicationController::class, 'downloadAttachment']);
        Route::post('/applications/{application}/interviews', [InterviewController::class, 'store']);
        Route::put('/interviews/{interview}',                 [InterviewController::class, 'update']);
        Route::patch('/interviews/{interview}/feedback',      [InterviewController::class, 'recordFeedback']);
        Route::patch('/interviews/{interview}/cancel',        [InterviewController::class, 'cancel']);
        Route::patch('/interviews/{interview}/reschedule',    [InterviewController::class, 'reschedule']);
        Route::delete('/interviews/{interview}',              [InterviewController::class, 'destroy']);
    });

    // ── Department Manager ────────────────────────────────────────────────
    Route::middleware('role:department_manager')->group(function () {
        Route::get('/my-department',           [DepartmentController::class, 'myDepartment']);
        Route::get('/my-department/employees', [EmployeeController::class,   'myTeam']);
    });

});
