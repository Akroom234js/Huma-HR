<?php

namespace App\Http\Controllers;

use Spatie\Permission\Models\Role;
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
    public function register(RegisterEmployeeRequest $request): JsonResponse
{
    // ── 1. رفع صورة البروفايل إن وُجدت ──────────────────────────────────
    $profilePicPath = null;
    if ($request->hasFile('profile_pic')) {
        $profilePicPath = $request->file('profile_pic')
            ->store('profile_pictures', 'public');
        // الصورة رح تُحفظ في: storage/app/public/profile_pictures/
    }

    // ── 2. إنشاء المستخدم في جدول users ─────────────────────────────────
    $user = User::create([
        'email'    => $request->email,
        'password' => Hash::make($request->password),
    ]);

    // ── 3. إنشاء البروفايل بكل المعلومات ─────────────────────────────────
    EmployeeProfile::create([
        'user_id'                => $user->id,
        'full_name'              => $request->full_name,
        'employee_id'            => $request->employee_id,
        'date_of_birth'          => $request->date_of_birth,
        'marital_status'         => $request->marital_status,
        'phone_number'           => $request->phone_number,
        'address'                => $request->address,
        'emergency_contacts'     => $request->emergency_contacts,
        'profile_picture'        => $profilePicPath,
        'manager_id'             => $request->manager_id,
        'branch'                 => $request->branch,
        'city'                   => $request->city,
        'grade'                  => $request->grade,
        'start_date'             => $request->start_date,
        'internal_transfer_date' => $request->internal_transfer_date,
        'resignation_date'       => $request->resignation_date,
    ]);

    // ── 4. تعيين الدور ────────────────────────────────────────────────────
    $user->assignRole(Role::findByName('employee', 'api'));

    $this->logChange($user, 'employee_account_created');

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
    public function login(LoginEmployeeRequest $request): JsonResponse
    {
        if (!Auth::attempt(['email' => $request->email, 'password' => $request->password])) {
            return $this->errorResponse(
                message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
                statusCode: 401
            );
        }

        $user = Auth::user();

        if ($user->account_status !== 'active') {
            Auth::logout();
            return $this->errorResponse(
                message: 'الحساب غير مفعّل، تواصل مع الـ HR',
                statusCode: 403
            );
        }

        // تحديث تاريخ آخر دخول
        $user->update(['last_login_at' => now()]);
        // إنشاء التوكن — إذا remember_me صح، التوكن ما ينتهي
        $tokenName    = 'auth_token';
        $expiration   = $request->remember_me ? null : now()->addHours(24);


        $tokenResult  = $user->createToken($tokenName);
        $token        = $tokenResult->plainTextToken;

        if ($expiration) {
            $tokenResult->accessToken->update(['expires_at' => $expiration]);
        }

        return $this->successResponse(
            data: [
                'token'      => $token,
                'token_type' => 'Bearer',
                'expires_at' => $expiration?->toDateTimeString() ?? 'لا ينتهي',
                'user'       => [
                    'id'    => $user->id,
                    'email' => $user->email,
                    'role'  => $user->roles->pluck('name')->first(),
                ],
            ],
            message: 'تم تسجيل الدخول بنجاح'
        );
    }

    // ─── تسجيل الخروج ──────────────────────────────────────────────────────
    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return $this->successResponse(message: 'تم تسجيل الخروج بنجاح');
    }

    // ─── نسيان كلمة المرور (إرسال رمز) ────────────────────────────────────
    public function forgotPassword(ForgotPasswordRequest $request): JsonResponse
    {
        // حذف الرموز القديمة لنفس الإيميل
        PasswordResetCode::where('email', $request->email)->delete();

        $code = Str::upper(Str::random(6)); // رمز من 6 أحرف

        PasswordResetCode::create([
            'email'      => $request->email,
            'code'       => Hash::make($code),
            'expires_at' => now()->addMinutes(15), // صالح 15 دقيقة
        ]);

        // إرسال الرمز بالإيميل
        Mail::raw(
            "رمز إعادة تعيين كلمة المرور: {$code}\nصالح لمدة 15 دقيقة فقط.",
            fn($msg) => $msg->to($request->email)->subject('إعادة تعيين كلمة المرور')
        );

        return $this->successResponse(message: 'تم إرسال رمز التحقق إلى بريدك الإلكتروني');
    }

    // ─── إعادة تعيين كلمة المرور ───────────────────────────────────────────
    public function resetPassword(ResetPasswordRequest $request): JsonResponse
    {
        $record = PasswordResetCode::where('email', $request->email)
            ->latest()
            ->first();

        if (!$record || !Hash::check($request->code, $record->code)) {
            return $this->errorResponse(
                message: 'الرمز غير صحيح',
                statusCode: 422
            );
        }

        if ($record->isExpired()) {
            $record->delete();
            return $this->errorResponse(
                message: 'انتهت صلاحية الرمز، اطلب رمزاً جديداً',
                statusCode: 422
            );
        }

        User::where('email', $request->email)
            ->update(['password' => Hash::make($request->password)]);

        $record->delete(); // حذف الرمز بعد الاستخدام

        return $this->successResponse(message: 'تم تغيير كلمة المرور بنجاح');
    }

    // ─── مساعد: تسجيل العمليات ─────────────────────────────────────────────
    private function logChange(User $user, string $action): void
    {
        Log::info("HR Action: {$action}", [
            'user_id'    => $user->id,
            'email'      => $user->email,
            'performed_by' => Auth::id() ?? 'system',
            'timestamp'  => now(),
        ]);
    }
}
