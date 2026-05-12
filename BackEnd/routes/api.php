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

// ══════════════════════════════════════════════════════════════════════════════
// Protected Routes — تحتاج توكن
// ══════════════════════════════════════════════════════════════════════════════
Route::middleware('auth:sanctum')->group(function () {

    // ── أي مستخدم مسجّل دخول ─────────────────────────────────────────────
    Route::delete('/auth/sessions', [AuthController::class, 'logout']);

    // ── HR فقط — كل العمليات ─────────────────────────────────────────────
    Route::middleware('role:hr')->group(function () {

        // Employees
        Route::post('/auth/employees',   [AuthController::class,   'register']);
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
        Route::get('/departments/stats',             [DepartmentController::class,        'stats']);
        Route::get('/departments',                   [DepartmentController::class,        'index']);
        Route::get('/departments/{id}',              [DepartmentController::class,        'show']);

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
        Route::get('/salary-structures',      [SalaryStructureController::class, 'index']);

        // Positions
        Route::get('/positions',      [PositionController::class, 'index']);
        Route::get('/positions/{id}', [PositionController::class, 'show']);

        // Requests
        Route::get('/requests',               [EmployeeRequestController::class, 'index']);
        Route::patch('/requests/{id}/status', [EmployeeRequestController::class, 'updateStatus']);

        // Payroll
        Route::get('/payroll/overview', [PayrollController::class, 'overview']);
        Route::post('/payroll/initialize', [PayrollController::class, 'initialize']);
        Route::get('/payroll',          [PayrollController::class, 'index']);
        Route::patch('/payroll/{id}',   [PayrollController::class, 'update']);
        Route::delete('/payroll/{id}',  [PayrollController::class, 'destroy']);
        Route::patch('/payroll/{id}/pay', [PayrollController::class, 'pay']);
        Route::patch('/payroll/{id}/revert', [PayrollController::class, 'revert']);
        Route::post('/payroll/pay-all',  [PayrollController::class, 'payAll']);

        // Deductions
        Route::get('/deductions', [App\Http\Controllers\DeductionController::class, 'index']);
        Route::post('/deductions', [App\Http\Controllers\DeductionController::class, 'store']);
        Route::patch('/deductions/{id}', [App\Http\Controllers\DeductionController::class, 'update']);
        Route::delete('/deductions/{id}', [App\Http\Controllers\DeductionController::class, 'destroy']);

        // Bonus Rules
        Route::get('/bonus-rules', [App\Http\Controllers\BonusRuleController::class, 'index']);
        Route::post('/bonus-rules', [App\Http\Controllers\BonusRuleController::class, 'store']);
        Route::patch('/bonus-rules/{id}', [App\Http\Controllers\BonusRuleController::class, 'update']);
        Route::delete('/bonus-rules/{id}', [App\Http\Controllers\BonusRuleController::class, 'destroy']);
        Route::post('/bonus-rules/apply', [App\Http\Controllers\BonusRuleController::class, 'apply']);
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
