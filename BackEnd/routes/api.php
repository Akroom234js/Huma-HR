<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DepartmentController;
use App\Http\Controllers\EmployeeMovementController;
use App\Http\Controllers\SalaryAdjustmentController;
use App\Http\Controllers\PositionController;
use Illuminate\Support\Facades\Route;

// ══════════════════════════════════════════════════════════════════════════════
// Public Routes — بدون مصادقة
// ══════════════════════════════════════════════════════════════════════════════
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
    });

    // ── HR + Boss — عرض فقط ──────────────────────────────────────────────
    Route::middleware('role:hr|manager')->group(function () {

        // ⚠️ Static routes لازم قبل {id}
        Route::get('/employees/positions',           [EmployeeController::class,         'positions']);
        Route::get('/employees/statuses',            [EmployeeController::class,         'statuses']);
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

        // Positions
        Route::get('/positions',      [PositionController::class, 'index']);
        Route::get('/positions/{id}', [PositionController::class, 'show']);

        // Requests
        Route::get('/requests',               [EmployeeRequestController::class, 'index']);
        Route::patch('/requests/{id}/status', [EmployeeRequestController::class, 'updateStatus']);

        // Payroll
        Route::get('/payroll',          [PayrollController::class, 'index']);
        Route::patch('/payroll/{id}/pay', [PayrollController::class, 'pay']);
        Route::post('/payroll/pay-all',  [PayrollController::class, 'payAll']);
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
