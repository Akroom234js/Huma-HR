<?php

namespace App\Http\Controllers;

use App\Models\Task;
use App\Models\EmployeeProfile;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Http\Requests\ScoreTaskRequest;
use App\Traits\ApiResponse;
use Illuminate\Http\JsonResponse;
use Carbon\Carbon;

class TaskController extends Controller
{
    use ApiResponse;

    // ─────────────────────────────────────────────────────────────
    // المدير يشوف مهام قسمه | HR والأدمن يشوفون مهام كل الشركة
    // GET /tasks
    // ─────────────────────────────────────────────────────────────
    public function index(): JsonResponse
    {
        $user = auth()->user();
        $managerProfile = $user->employeeProfile;

        if (! $managerProfile) {
            return $this->errorResponse('Manager profile not found.', null, 404);
        }

        $query = Task::with(['employee.department', 'assignedBy'])
            ->latest();

        // إذا لم يكن HR أو Boss أو Admin، يرى فقط مهام قسمه
        if (! $user->hasAnyRole(['hr', 'boss', 'admin'], 'api')) {
            $query->whereHas('employee', function ($q) use ($managerProfile) {
                $q->where('department_id', $managerProfile->department_id);
            });
        }

        $tasks = $query->get()->map(fn($task) => $this->formatTask($task));

        return $this->successResponse($tasks, 'Tasks retrieved successfully.');
    }

    // ─────────────────────────────────────────────────────────────
    // الموظف يشوف مهامه هو بس
    // GET /tasks/my-tasks
    // ─────────────────────────────────────────────────────────────
    public function myTasks(): JsonResponse
    {
        $employeeProfile = auth()->user()->employeeProfile;

        if (! $employeeProfile) {
            return $this->errorResponse('Employee profile not found.', null, 404);
        }

        $tasks = Task::with(['assignedBy'])
            ->forEmployee($employeeProfile->id)
            ->latest()
            ->get()
            ->map(fn($task) => $this->formatTask($task));

        return $this->successResponse($tasks, 'Your tasks retrieved successfully.');
    }

    // ─────────────────────────────────────────────────────────────
    // تفاصيل مهمة واحدة
    // GET /tasks/{task}
    // ─────────────────────────────────────────────────────────────
    public function show(Task $task): JsonResponse
    {
        $user            = auth()->user();
        $employeeProfile = $user->employeeProfile;

        if (! $employeeProfile) {
            return $this->errorResponse('Profile not found.', null, 404);
        }

        // الموظف يشوف مهامه بس — المدير يشوف مهام قسمه بس
        $isOwner   = $task->employee_profile_id === $employeeProfile->id;
        $isManager = $task->employee->department_id === $employeeProfile->department_id
                     && $user->hasAnyRole(['manager', 'department_manager', 'boss', 'hr']);

        if (! $isOwner && ! $isManager) {
            return $this->errorResponse('You are not authorized to view this task.', null, 403);
        }

        return $this->successResponse($this->formatTask($task), 'Task retrieved successfully.');
    }

    // ─────────────────────────────────────────────────────────────
    // المدير ينشئ مهمة جديدة
    // POST /tasks
    // ─────────────────────────────────────────────────────────────
    public function store(StoreTaskRequest $request): JsonResponse
    {
        $managerProfile = auth()->user()->employeeProfile;

        $task = Task::create([
            'employee_profile_id'  => $request->employee_profile_id,
            'assigned_by'          => $managerProfile->id,
            'title'                => $request->title,
            'description'          => $request->description,
            'due_date'             => $request->due_date,
            'difficulty'           => $request->difficulty,
            'priority'             => $request->priority,
            'late_penalty_per_day' => $request->late_penalty_per_day ?? 0,
            'status'               => 'pending',
        ]);

        return $this->successResponse(
            $this->formatTask($task->load(['employee', 'assignedBy'])),
            'Task created successfully.',
            201
        );
    }

    // ─────────────────────────────────────────────────────────────
    // المدير يعدل مهمة
    // PUT /tasks/{task}
    // ─────────────────────────────────────────────────────────────
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $managerProfile = auth()->user()->employeeProfile;

        // فقط المدير الذي أنشأ المهمة يقدر يعدلها
        if ($task->assigned_by !== $managerProfile->id) {
            return $this->errorResponse('You are not authorized to update this task.', null, 403);
        }

        $task->update($request->only([
            'title',
            'description',
            'due_date',
            'difficulty',
            'priority',
            'late_penalty_per_day',
        ]));

        return $this->successResponse(
            $this->formatTask($task->fresh(['employee', 'assignedBy'])),
            'Task updated successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // المدير يحذف مهمة
    // DELETE /tasks/{task}
    // ─────────────────────────────────────────────────────────────
    public function destroy(Task $task): JsonResponse
    {
        $managerProfile = auth()->user()->employeeProfile;

        if ($task->assigned_by !== $managerProfile->id) {
            return $this->errorResponse('You are not authorized to delete this task.', null, 403);
        }

        if ($task->status === 'scored') {
            return $this->errorResponse('Cannot delete a scored task.', null, 422);
        }

        $task->delete();

        return $this->successResponse(null, 'Task deleted successfully.');
    }

    // ─────────────────────────────────────────────────────────────
    // الموظف يبدأ المهمة
    // PUT /tasks/{task}/start
    // ─────────────────────────────────────────────────────────────
    public function start(Task $task): JsonResponse
    {
        $employeeProfile = auth()->user()->employeeProfile;

        if ($task->employee_profile_id !== $employeeProfile->id) {
            return $this->errorResponse('You are not authorized to update this task.', null, 403);
        }

        if ($task->status !== 'pending') {
            return $this->errorResponse('Only pending tasks can be started.', null, 422);
        }

        $task->update(['status' => 'in_progress']);

        return $this->successResponse(
            $this->formatTask($task->fresh()),
            'Task started successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // الموظف ينجز المهمة
    // PUT /tasks/{task}/complete
    // ─────────────────────────────────────────────────────────────
    public function complete(Task $task): JsonResponse
    {
        $employeeProfile = auth()->user()->employeeProfile;

        if ($task->employee_profile_id !== $employeeProfile->id) {
            return $this->errorResponse('You are not authorized to complete this task.', null, 403);
        }

        if (! in_array($task->status, ['in_progress', 'needs_revision'])) {
            return $this->errorResponse(
                'Only in_progress or needs_revision tasks can be completed.',
                null,
                422
            );
        }

        // حساب أيام التأخير تلقائياً
        $today    = Carbon::today();
        $dueDate  = Carbon::parse($task->due_date);
        $daysLate = $today->greaterThan($dueDate)
            ? $today->diffInDays($dueDate)
            : 0;

        $task->update([
            'status'       => 'pending_review',
            'days_late'    => $daysLate,
            'completed_at' => now(),
        ]);

        return $this->successResponse(
            $this->formatTask($task->fresh()),
            'Task marked as completed and is now pending review.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // المدير يقيّم المهمة
    // PUT /tasks/{task}/score
    // ─────────────────────────────────────────────────────────────
    public function score(ScoreTaskRequest $request, Task $task): JsonResponse
    {
        $managerProfile = auth()->user()->employeeProfile;

        if ($task->assigned_by !== $managerProfile->id) {
            return $this->errorResponse('You are not authorized to score this task.', null, 403);
        }

        $task->update([
            'completion_score' => $request->completion_score,
            'quality_score'    => $request->quality_score,
            'manager_note'     => $request->manager_note,
            'status'           => 'scored',
            'scored_at'        => now(),
        ]);

        return $this->successResponse(
            $this->formatTask($task->fresh()),
            'Task scored successfully.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // المدير يرجع المهمة للموظف
    // PUT /tasks/{task}/revision
    // ─────────────────────────────────────────────────────────────
    public function revision(Task $task): JsonResponse
    {
        $managerProfile = auth()->user()->employeeProfile;

        if ($task->assigned_by !== $managerProfile->id) {
            return $this->errorResponse('You are not authorized to request revision for this task.', null, 403);
        }

        if ($task->status !== 'pending_review') {
            return $this->errorResponse('Only pending_review tasks can be sent for revision.', null, 422);
        }

        $managerNote = request('manager_note');

        if (! $managerNote) {
            return $this->errorResponse('Manager note is required when requesting revision.', null, 422);
        }

        $task->update([
            'status'       => 'needs_revision',
            'manager_note' => $managerNote,
        ]);

        return $this->successResponse(
            $this->formatTask($task->fresh()),
            'Task sent back for revision.'
        );
    }

    // ─────────────────────────────────────────────────────────────
    // Helper — تنسيق بيانات المهمة للـ response
    // ─────────────────────────────────────────────────────────────
    private function formatTask(Task $task): array
    {
        $taskScore = $task->task_score;

        return [
            'id'                   => $task->id,
            'title'                => $task->title,
            'description'          => $task->description,
            'due_date'             => $task->due_date?->format('Y-m-d'),
            'difficulty'           => $task->difficulty,
            'priority'             => $task->priority,
            'status'               => $task->status,
            'manager_note'         => $task->manager_note,
            'late_penalty_per_day' => $task->late_penalty_per_day,
            'days_late'            => $task->days_late,
            'completion_score'     => $task->completion_score,
            'quality_score'        => $task->quality_score,
            'task_score'           => $taskScore,
            'final_score'          => $taskScore, // Alias for frontend tables
            'completed_at'         => $task->completed_at?->format('Y-m-d H:i:s'),
            'scored_at'            => $task->scored_at?->format('Y-m-d H:i:s'),
            'employee'             => $task->employee ? [
                'id'         => $task->employee->id,
                'name'       => $task->employee->full_name,
                'full_name'  => $task->employee->full_name,
                'department' => $task->employee->department ? [
                    'id'   => $task->employee->department->id,
                    'name' => $task->employee->department->name,
                ] : null,
            ] : null,
            'assigned_by'          => $task->assignedBy ? [
                'id'   => $task->assignedBy->id,
                'name' => $task->assignedBy->full_name,
            ] : null,
        ];
    }
}
