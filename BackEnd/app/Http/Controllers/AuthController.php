<?php

namespace App\Http\Controllers;

use Spatie\Permission\Models\Role;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Http\Requests\LoginEmployeeRequest;
use App\Http\Requests\RegisterEmployeeRequest;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\PasswordResetCode;
use App\Models\User;
use App\Models\EmployeeProfile;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    use ApiResponse;

    // ─── إنشاء حساب موظف من قبل HR ────────────────────────────────────────
    // POST /api/auth/employees
    public function register(RegisterEmployeeRequest $request): JsonResponse
    {
        // DB::transaction تضمن إنو إذا أي خطوة فشلت
        // رح يتراجع كل شي — ما يبقى user بدون profile
        $user = DB::transaction(function () use ($request) {

            // ── 1. رفع صورة البروفايل إن وُجدت ──────────────────────────
            $profilePicPath = null;
            if ($request->hasFile('profile_pic')) {
                $profilePicPath = $request->file('profile_pic')
                    ->store('profile_pictures', 'public');
            }

            // ── 2. إنشاء المستخدم في جدول users ─────────────────────────
            $user = User::create([
                'email'    => $request->email,
                'password' => Hash::make($request->password),
            ]);

            // ── 3. إنشاء البروفايل بكل المعلومات ─────────────────────────
            EmployeeProfile::create([
                'user_id'                => $user->id,
                'full_name'              => $request->full_name,
                'employee_id'            => $request->employee_id,
                'date_of_birth'          => $request->date_of_birth,
                'marital_status'         => $request->marital_status,
                'phone_number'           => $request->phone_number,
                'address'                => $request->address,
                'emergency_contacts'     => $request->emergency_contacts,
                'profile_pic'            => $profilePicPath,
                'job_title'              => $request->job_title,
                'employment_status'      => $request->employment_status ?? 'active',
                'department_id'          => $request->department_id,
                'manager_id'             => $request->manager_id,
                'branch'                 => $request->branch,
                'city'                   => $request->city,
                'grade'                  => $request->grade,
                'start_date'             => $request->start_date,
                'salary'                 => $request->salary,
                'internal_transfer_date' => $request->internal_transfer_date,
                'resignation_date'       => $request->resignation_date,
            ]);

            // ── 4. تعيين الدور ────────────────────────────────────────────
            $user->assignRole(Role::findByName('employee', 'api'));

            $this->logChange($user, 'employee_account_created');

            return $user;
        });

        return $this->successResponse(
            data: [
                'user_id' => $user->id,
                'email'   => $user->email,
            ],
            message: 'Employee account created successfully.',
            statusCode: 201
        );
    }

    // ─── تسجيل الدخول ──────────────────────────────────────────────────────
    // POST /api/auth/sessions
    public function login(LoginEmployeeRequest $request): JsonResponse
    {
        if (! Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return $this->errorResponse(
                message: 'Incorrect email or password.',
                statusCode: 401
            );
        }

        $user = Auth::user();

        if ($user->account_status !== 'active') {
            Auth::logout();
            return $this->errorResponse(
                message: 'Account is not active, please contact HR.',
                statusCode: 403
            );
        }

        // تحديث تاريخ آخر دخول
        $user->update(['last_login_at' => now()]);

        // إذا remember_me = true → التوكن لا ينتهي
        $expiration  = $request->boolean('remember_me') ? null : now()->addHours(24);
        $tokenResult = $user->createToken('auth_token');
        $token       = $tokenResult->plainTextToken;

        if ($expiration) {
            $tokenResult->accessToken->update(['expires_at' => $expiration]);
        }

        return $this->successResponse(
            data: [
                'token'      => $token,
                'token_type' => 'Bearer',
                'expires_at' => $expiration?->toDateTimeString() ?? 'Never',
                'user'       => [
                    'id'    => $user->id,
                    'email' => $user->email,
                    'role'  => $user->roles->pluck('name')->first(),
                ],
            ],
            message: 'Login successful.'
        );
    }

    // ─── تسجيل الخروج ──────────────────────────────────────────────────────
    // DELETE /api/auth/sessions
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(message: 'Logout successful.');
    }

    // ─── إرسال رمز نسيان كلمة المرور ──────────────────────────────────────
    // POST /api/auth/password/forgot
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        PasswordResetCode::where('email', $request->email)->delete();

        $code = Str::upper(Str::random(6));

        PasswordResetCode::create([
            'email'      => $request->email,
            'code'       => Hash::make($code),
            'expires_at' => now()->addMinutes(15),
        ]);

        Mail::raw(
            "Password reset code: {$code}\nThis code will expire in 15 minutes.",
            fn($msg) => $msg->to($request->email)->subject('Password Reset')
        );

        return $this->successResponse(message: 'Password reset code sent to your email.');
    }

    // ─── إعادة تعيين كلمة المرور ───────────────────────────────────────────
    // PUT /api/auth/password/reset
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $record = PasswordResetCode::where('email', $request->email)
            ->latest()
            ->first();

        if (! $record || ! Hash::check($request->code, $record->code)) {
            return $this->errorResponse(
                message: 'Invalid code.',
                statusCode: 422
            );
        }

        if ($record->isExpired()) {
            $record->delete();
            return $this->errorResponse(
                message: 'The code has expired, please request a new one.',
                statusCode: 422
            );
        }

        User::where('email', $request->email)
            ->update(['password' => Hash::make($request->password)]);

        $record->delete();

        return $this->successResponse(message: 'Password changed successfully.');
    }

    // ─── مساعد: تسجيل العمليات ─────────────────────────────────────────────
    private function logChange(User $user, string $action): void
    {
        Log::info("HR Action: {$action}", [
            'target_user_id'  => $user->id,
            'target_email'    => $user->email,
            'performed_by_id' => Auth::id() ?? 'system',
            'timestamp'       => now()->toDateTimeString(),
        ]);
    }
}
