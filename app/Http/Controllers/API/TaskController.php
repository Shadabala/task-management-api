<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTaskRequest;
use App\Http\Requests\UpdateTaskRequest;
use App\Models\Task;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TaskController extends Controller
{
    /**
     * Display a paginated listing of the authenticated user's tasks.
     *
     * Supports filtering by:
     *   ?status=pending|in-progress|completed
     *   ?due_date=YYYY-MM-DD
     */
    public function index(Request $request): JsonResponse
    {
        $query = auth()->user()->tasks()->latest();

        // Filter by status
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        // Filter by due date (exact day)
        if ($request->filled('due_date')) {
            $query->whereDate('due_date', $request->due_date);
        }

        $tasks = $query->paginate(10);

        return response()->json([
            'success' => true,
            'data'    => $tasks,
        ]);
    }

    /**
     * Store a newly created task for the authenticated user.
     */
    public function store(StoreTaskRequest $request): JsonResponse
    {
        try {
            $task = auth()->user()->tasks()->create($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Task created successfully.',
                'data'    => $task,
            ], 201);

        } catch (\Throwable $e) {
            Log::error('Task creation error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'payload' => $request->validated(),
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to create task.',
            ], 500);
        }
    }

    /**
     * Display the specified task.
     */
    public function show(Task $task): JsonResponse
    {
        $this->authorizeTask($task);

        return response()->json([
            'success' => true,
            'data'    => $task,
        ]);
    }

    /**
     * Update the specified task.
     */
    public function update(UpdateTaskRequest $request, Task $task): JsonResponse
    {
        $this->authorizeTask($task);

        try {
            $task->update($request->validated());

            return response()->json([
                'success' => true,
                'message' => 'Task updated successfully.',
                'data'    => $task->fresh(),
            ]);

        } catch (\Throwable $e) {
            Log::error('Task update error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'task_id' => $task->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to update task.',
            ], 500);
        }
    }

    /**
     * Soft-delete the specified task.
     */
    public function destroy(Task $task): JsonResponse
    {
        $this->authorizeTask($task);

        try {
            $task->delete(); // SoftDeletes

            return response()->json([
                'success' => true,
                'message' => 'Task deleted successfully.',
            ]);

        } catch (\Throwable $e) {
            Log::error('Task deletion error: ' . $e->getMessage(), [
                'user_id' => auth()->id(),
                'task_id' => $task->id,
            ]);

            return response()->json([
                'success' => false,
                'message' => 'Failed to delete task.',
            ], 500);
        }
    }

    /**
     * Ensure the task belongs to the currently authenticated user.
     */
    private function authorizeTask(Task $task): void
    {
        if ($task->user_id !== auth()->id()) {
            abort(response()->json([
                'success' => false,
                'message' => 'You are not authorized to access this task.',
            ], 403));
        }
    }
}
