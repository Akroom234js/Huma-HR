<?php

use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;

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

});
