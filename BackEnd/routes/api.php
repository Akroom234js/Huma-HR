<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\EmployeeController;

// ── Public Routes ─────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::post('/sessions',        [AuthController::class, 'login']);
    Route::post('/password/forgot', [AuthController::class, 'forgotPassword']);
    Route::put('/password/reset',   [AuthController::class, 'resetPassword']);
});

// ── Protected Routes ──────────────────────────────────────────────────────
Route::middleware('auth:sanctum')->group(function () {

    // أي مستخدم مسجّل دخول
    Route::delete('/auth/sessions', [AuthController::class, 'logout']);

    // HR فقط
    Route::middleware('role:hr')->group(function () {
        Route::post('/auth/employees', [AuthController::class, 'register']);
    });

        // HR أو Manager
    Route::middleware('role:hr,manager')->group(function () {
        Route::get('/employees',         [EmployeeController::class, 'index']);
        Route::get('/employees/{id}',    [EmployeeController::class, 'show']);
        Route::put('/employees/{id}',    [EmployeeController::class, 'update']);
        Route::delete('/employees/{id}', [EmployeeController::class, 'destroy']);
    });


});
