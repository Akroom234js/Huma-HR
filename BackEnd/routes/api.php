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
use App\Http\Controllers\OrgChartController;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\JobPostingController;
use App\Http\Controllers\InterviewController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Artisan;

// ══════════════════════════════════════════════════════════════════════════════
// Public Routes — بدون مصادقة
// ══════════════════════════════════════════════════════════════════════════════

// ⚠️ مسار إصلاح قاعدة البيانات - يستخدم لمرة واحدة فقط لإعادة البناء في بيئة الإنتاج
Route::get('/system-repair-db', function () {
    try {
        echo "Starting Database Sync...<br>";
        
        echo "Disabling foreign key checks...<br>";
        DB::statement('SET FOREIGN_KEY_CHECKS = 0;');

        echo "Dropping all tables manually...<br>";
        $tables = DB::select('SHOW TABLES');
        $dbName = 'test'; // Ensure this matches their DB
        $tableKey = "Tables_in_{$dbName}";

        foreach ($tables as $table) {
            if (isset($table->$tableKey)) {
                $tableName = $table->$tableKey;
                echo "Dropping table: {$tableName}...<br>";
                DB::statement("DROP TABLE IF EXISTS `{$tableName}`");
            }
        }

        DB::statement('SET FOREIGN_KEY_CHECKS = 1;');

        echo "Running migrations and seeders...<br>";
        \Illuminate\Support\Facades\Artisan::call('migrate', ['--force' => true]);
        \Illuminate\Support\Facades\Artisan::call('db:seed', ['--force' => true]);
        echo "<pre>" . \Illuminate\Support\Facades\Artisan::output() . "</pre>";
        echo "<pre>" . \Illuminate\Support\Facades\Artisan::output() . "</pre>";

        return "<h2 style='color:green'>Database Synced Successfully!</h2>";
    } catch (\Exception $e) {
        return "<h2 style='color:red'>Sync Failed!</h2><p>Error: " . $e->getMessage() . "</p>";
    }
});

Route::prefix('auth')->group(function () {
    Route::post('/sessions',        [AuthController::class, 'login']);
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
    Route::put('/password/reset',   [AuthController::class, 'resetPassword']);
});

// ✅ ATS Public Routes — المتقدمون الخارجيون
// بدون Auth — أي شخص يقدر يشوف الوظائف ويتقدم
Route::get('/job-postings',         [JobPostingController::class, 'index']);   // قائمة الوظائف المفتوحة
Route::get('/job-postings/{jobPosting}',    [JobPostingController::class, 'show']);    // تفاصيل وظيفة
Route::post('/job-postings/{id}/apply', [ApplicationController::class, 'store']); // تقديم طلب

// ══════════════════════════════════════════════════════════════════════════════
// Protected Routes — تحتاج توكن
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware('auth:sanctum')->group(function () {

    // ── أي مستخدم مسجّل دخول ─────────────────────────────────────────────
    Route::delete('/auth/sessions', [AuthController::class, 'logout']);

    // ── HR فقط — كل العمليات ─────────────────────────────────────────────
    Route::middleware('role:hr')->group(function () {

        // Employees
        Route::post('/auth/employees',   [AuthController::class,    'register']);
        Route::put('/employees/{id}',    [EmployeeController::class, 'update']);
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);

        // Departments
        Route::post('/departments',        [DepartmentController::class, 'store']);
        Route::put('/departments/{id}',    [DepartmentController::class, 'update']);
        Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);

        // Employee Movements
        Route::post('/employee-movements',        [EmployeeMovementController::class, 'store']);
        Route::delete('/employee-movements/{id}', [EmployeeMovementController::class, 'destroy']);

        // Positions CRUD
        Route::post('/positions',        [PositionController::class, 'store']);
        Route::put('/positions/{id}',    [PositionController::class, 'update']);
        Route::delete('/positions/{id}', [PositionController::class, 'destroy']);

        // Salary Structures CRUD
        Route::post('/salary-structures',        [SalaryStructureController::class, 'store']);
        Route::put('/salary-structures/{id}',    [SalaryStructureController::class, 'update']);
        Route::delete('/salary-structures/{id}', [SalaryStructureController::class, 'destroy']);

        // Salary Adjustments
        Route::post('/salary-adjustments', [SalaryAdjustmentController::class, 'store']);

        // ✅ ATS — HR فقط: إدارة الوظائف والطلبات
        Route::post('/job-postings',              [JobPostingController::class,   'store']);
        Route::put('/job-postings/{jobPosting}',          [JobPostingController::class,   'update']);
        Route::patch('/job-postings/{jobPosting}/publish',[JobPostingController::class,   'publish']);
        Route::patch('/job-postings/{jobPosting}/close',  [JobPostingController::class,   'close']);
        Route::delete('/job-postings/{jobPosting}',       [JobPostingController::class,   'destroy']);

        // ✅ ATS — تغيير حالة الطلبات (Pipeline Actions)
        Route::patch('/applications/{id}/status',    [ApplicationController::class, 'updateStatus']);
        Route::patch('/applications/{id}/review',    [ApplicationController::class, 'review']);
        Route::patch('/applications/{id}/shortlist', [ApplicationController::class, 'shortlist']);
        Route::patch('/applications/{id}/interview', [ApplicationController::class, 'interview']);
        Route::patch('/applications/{id}/offer',     [ApplicationController::class, 'offer']);
        Route::patch('/applications/{id}/hire',      [ApplicationController::class, 'hire']);
        Route::patch('/applications/{id}/reject',    [ApplicationController::class, 'reject']);
        Route::patch('/applications/{id}/withdraw',  [ApplicationController::class, 'withdraw']);
        Route::delete('/applications/{id}',          [ApplicationController::class, 'destroy']);
        Route::get('/applications/{id}/resume',      [ApplicationController::class, 'downloadResume']);

        // ✅ ATS — إدارة المقابلات (Interviews Management)
        Route::post('/applications/{application}/interviews', [InterviewController::class, 'store']);
        Route::put('/interviews/{interview}', [InterviewController::class, 'update']);
        Route::patch('/interviews/{interview}/feedback', [InterviewController::class, 'recordFeedback']);
        Route::patch('/interviews/{interview}/cancel', [InterviewController::class, 'cancel']);
        Route::patch('/interviews/{interview}/reschedule', [InterviewController::class, 'reschedule']);
        Route::delete('/interviews/{interview}', [InterviewController::class, 'destroy']);
    });

    // ── Employee Portal ──────────────────────────────────────────────
    Route::get('/employee/payroll', [PayrollController::class, 'employeeHistory']);

    // ── HR + Boss — عرض فقط ──────────────────────────────────────────────
    Route::middleware('role:hr|manager')->group(function () {

        // ⚠️ Static routes لازم قبل {id}
        Route::get('/employees/positions',           [EmployeeController::class,         'positions']);
        Route::get('/employees/statuses',            [EmployeeController::class,         'statuses']);
        Route::get('/employees/managers',            [EmployeeController::class,         'managers']);
        Route::get('/employee-movements/types',      [EmployeeMovementController::class, 'types']);
        Route::get('/salary-adjustments/types',      [SalaryAdjustmentController::class, 'types']);
        Route::get('/departments/stats',             [DepartmentController::class,       'stats']);
        Route::get('/departments',                   [DepartmentController::class,       'index']);
        Route::get('/departments/{id}',              [DepartmentController::class,       'show']);

        // Employees
        Route::get('/employees',      [EmployeeController::class, 'index']);
        Route::get('/employees/{id}', [EmployeeController::class, 'show']);

        // Employee Movements
        Route::get('/employee-movements',      [EmployeeMovementController::class, 'index']);
        Route::get('/employee-movements/{id}', [EmployeeMovementController::class, 'show']);

        // Salary Adjustments
        Route::get('/salary-adjustments',      [SalaryAdjustmentController::class, 'index']);
        Route::get('/salary-adjustments/{id}', [SalaryAdjustmentController::class, 'show']);

        // Salary Structures
        Route::get('/salary-structures/employees', [SalaryStructureController::class, 'employees']);
        Route::patch('/salary-structures/employees/{id}', [SalaryStructureController::class, 'updateEmployeeSalary']);
        Route::get('/salary-structures', [SalaryStructureController::class, 'index']);

        // Positions
        Route::get('/positions',      [PositionController::class, 'index']);
        Route::get('/positions/{id}', [PositionController::class, 'show']);

        // ── Org Chart ─────────────────────────────────────────────────────
        Route::get('/org-chart', [OrgChartController::class, 'index']);
        Route::get('/org-chart/department/{id}', [OrgChartController::class, 'byDepartment']);
        Route::post('/positions/org', [OrgChartController::class, 'store']);
        Route::put('/positions/{position}/org', [OrgChartController::class, 'update']);
        Route::patch('/positions/{position}/move', [OrgChartController::class, 'move']);
        Route::patch('/positions/{position}/assign', [OrgChartController::class, 'assign']);
        Route::patch('/positions/{position}/unassign', [OrgChartController::class, 'unassign']);

        // Requests
        Route::get('/requests',               [EmployeeRequestController::class, 'index']);
        Route::patch('/requests/{id}/status', [EmployeeRequestController::class, 'updateStatus']);

        // Payroll
        Route::get('/payroll/overview',      [PayrollController::class, 'overview']);
        Route::post('/payroll/initialize',   [PayrollController::class, 'initialize']);
        Route::get('/payroll',               [PayrollController::class, 'index']);
        Route::patch('/payroll/{id}',        [PayrollController::class, 'update']);
        Route::delete('/payroll/{id}',       [PayrollController::class, 'destroy']);
        Route::patch('/payroll/{id}/pay',    [PayrollController::class, 'pay']);
        Route::patch('/payroll/{id}/revert', [PayrollController::class, 'revert']);
        Route::post('/payroll/pay-all',      [PayrollController::class, 'payAll']);

        // Deductions
        Route::get('/deductions',            [App\Http\Controllers\DeductionController::class, 'index']);
        Route::post('/deductions',           [App\Http\Controllers\DeductionController::class, 'store']);
        Route::patch('/deductions/{id}',     [App\Http\Controllers\DeductionController::class, 'update']);
        Route::delete('/deductions/{id}',    [App\Http\Controllers\DeductionController::class, 'destroy']);

        // Bonus Rules
        Route::get('/bonus-rules',           [App\Http\Controllers\BonusRuleController::class, 'index']);
        Route::post('/bonus-rules',          [App\Http\Controllers\BonusRuleController::class, 'store']);
        Route::patch('/bonus-rules/{id}',    [App\Http\Controllers\BonusRuleController::class, 'update']);
        Route::delete('/bonus-rules/{id}',   [App\Http\Controllers\BonusRuleController::class, 'destroy']);
        Route::post('/bonus-rules/apply',    [App\Http\Controllers\BonusRuleController::class, 'apply']);

        // ✅ ATS — HR + Manager: عرض فقط
        // ⚠️ Static routes أولاً قبل {id}
        Route::get('/applications/stats',                    [ApplicationController::class, 'stats']); // ← static
        Route::get('/applications',                          [ApplicationController::class, 'index']);
        Route::get('/applications/{id}',                     [ApplicationController::class, 'show']);
        Route::get('/applications/{id}/allowed-transitions', [ApplicationController::class, 'allowedTransitions']);
        Route::get('/job-postings/{id}/stats',               [ApplicationController::class, 'stats']);

        // Interviews Read
        Route::get('/interviews', [InterviewController::class, 'index']);
        Route::get('/interviews/{interview}', [InterviewController::class, 'show']);
    });

    // ── Department Manager — قسمه وفريقه فقط ────────────────────────────
    Route::middleware('role:department_manager')->group(function () {
        Route::get('/my-department',           [DepartmentController::class, 'myDepartment']);
        Route::get('/my-department/employees', [EmployeeController::class,   'myTeam']);
    });

    // ── Employee — بياناته الشخصية فقط ──────────────────────────────────
    Route::middleware('role:employee')->group(function () {
        Route::get('/my-profile', [EmployeeController::class, 'myProfile']);
    });

});
