<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;

class RoleController extends Controller
{
    /**
     * ─── Boss: List all roles with their permissions ───────────────────────────
     *
     * GET /api/roles
     * Returns: 200
     */
    public function index(): JsonResponse
    {
        $roles = Role::with('permissions')->get();

        return response()->json([
            'status'  => true,
            'message' => 'Roles retrieved successfully.',
            'data'    => $roles->map(fn($role) => [
                'id'          => $role->id,
                'name'        => $role->name,
                'permissions' => $role->permissions->pluck('name'),
            ]),
        ], 200);
    }

    /**
     * ─── Boss: List all permissions ───────────────────────────────────────────
     *
     * GET /api/permissions
     * Returns: 200
     */
    public function permissions(): JsonResponse
    {
        return response()->json([
            'status'  => true,
            'message' => 'Permissions retrieved successfully.',
            'data'    => Permission::all()->pluck('name'),
        ], 200);
    }

    /**
     * ─── Boss: List all users with their roles ─────────────────────────────────
     *
     * GET /api/users
     * Query params: ?per_page=15
     * Returns: 200
     */
    public function users(Request $request): JsonResponse
    {
        $users = User::with('roles')
            ->paginate(min((int) ($request->per_page ?? 15), 100));

        return response()->json([
            'status'  => true,
            'message' => 'Users retrieved successfully.',
            'data'    => collect($users->items())->map(fn($user) => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'roles' => $user->getRoleNames(),
            ]),
            'meta'    => [
                'current_page' => $users->currentPage(),
                'per_page'     => $users->perPage(),
                'total'        => $users->total(),
                'last_page'    => $users->lastPage(),
            ],
        ], 200);
    }

    /**
     * ─── Boss: Assign a role to a user ────────────────────────────────────────
     *
     * POST /api/users/{user}/roles
     * Body: { role: "hr" }
     * Returns: 200
     */
    public function assignRole(Request $request, User $user): JsonResponse
    {
        $request->validate([
            'role' => ['required', 'string', 'exists:roles,name'],
        ]);

        $user->syncRoles([$request->role]);

        return response()->json([
            'status'  => true,
            'message' => "Role '{$request->role}' assigned to {$user->name} successfully.",
            'data'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'roles' => $user->fresh()->getRoleNames(),
            ],
        ], 200);
    }

    /**
     * ─── Boss: Remove a role from a user ──────────────────────────────────────
     *
     * DELETE /api/users/{user}/roles/{role}
     * Returns: 200
     */
    public function removeRole(User $user, string $role): JsonResponse
    {
        // Cannot remove role from yourself
        if ($user->id === auth()->id()) {
            return response()->json([
                'status'  => false,
                'message' => 'You cannot remove your own role.',
                'data'    => null,
            ], 403);
        }

        // Validate role exists
        if (!Role::where('name', $role)->exists()) {
            return response()->json([
                'status'  => false,
                'message' => "Role '{$role}' not found.",
                'data'    => null,
            ], 404);
        }

        $user->removeRole($role);

        return response()->json([
            'status'  => true,
            'message' => "Role '{$role}' removed from {$user->name} successfully.",
            'data'    => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'roles' => $user->fresh()->getRoleNames(),
            ],
        ], 200);
    }
}
