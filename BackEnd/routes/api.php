<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\DepartmentController;
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

    // ── أي مستخدم مسجّل دخول ──────────────────────────────────────────────
    Route::delete('/auth/sessions', [AuthController::class, 'logout']);

    // ── HR فقط — إنشاء + تعديل + حذف ─────────────────────────────────────
    Route::middleware('role:hr')->group(function () {

        // إنشاء موظف
        Route::post('/auth/employees',   [AuthController::class, 'register']);

        // تعديل وحذف الموظفين
        Route::put('/employees/{id}',    [EmployeeController::class, 'update']);
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);

        // تعديل وحذف الأقسام
        Route::post('/departments',        [DepartmentController::class, 'store']);
        Route::put('/departments/{id}',    [DepartmentController::class, 'update']);
        Route::delete('/departments/{id}', [DepartmentController::class, 'destroy']);
    });

    // ── HR + Boss — عرض فقط ───────────────────────────────────────────────
    // ⚠️ positions و statuses لازم يكونوا قبل {id}
    Route::middleware('role:hr,manager')->group(function () {

        // Dropdown data
        Route::get('/employees/positions', [EmployeeController::class, 'positions']);
        Route::get('/employees/statuses',  [EmployeeController::class, 'statuses']);
        Route::get('/departments',         [DepartmentController::class, 'index']);
        Route::get('/departments/{id}',    [DepartmentController::class, 'show']);

        // عرض الموظفين
        Route::get('/employees',           [EmployeeController::class, 'index']);
        Route::get('/employees/{id}',      [EmployeeController::class, 'show']);
    });

    // ── Department Manager — قسمه وفريقه فقط ─────────────────────────────
    Route::middleware('role:department_manager')->group(function () {
        Route::get('/my-department',           [DepartmentController::class, 'myDepartment']);
        Route::get('/my-department/employees', [EmployeeController::class, 'myTeam']);
    });

    // ── Employee — بياناته الشخصية فقط ───────────────────────────────────
    Route::middleware('role:employee')->group(function () {
        Route::get('/my-profile', [EmployeeController::class, 'myProfile']);
    });

});
