<?php

namespace Tests\Feature;

use App\Models\Task;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class TaskTest extends TestCase
{
    use RefreshDatabase;

    // -----------------------------------------------------------------------
    // Create Task
    // -----------------------------------------------------------------------

    #[Test]
    public function test_authenticated_user_can_create_a_task(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->postJson('/api/tasks', [
                             'title'       => 'Write unit tests',
                             'description' => 'Cover auth and task endpoints.',
                             'status'      => 'pending',
                             'due_date'    => now()->addDays(5)->format('Y-m-d'),
                         ]);

        $response->assertStatus(201)
                 ->assertJson(['success' => true])
                 ->assertJsonPath('data.title', 'Write unit tests')
                 ->assertJsonPath('data.status', 'pending');

        $this->assertDatabaseHas('tasks', [
            'user_id' => $user->id,
            'title'   => 'Write unit tests',
        ]);
    }

    #[Test]
    public function test_task_creation_requires_title(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->postJson('/api/tasks', ['description' => 'No title here']);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['title']);
    }

    #[Test]
    public function test_task_creation_rejects_invalid_status(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->postJson('/api/tasks', [
                             'title'  => 'Bad status task',
                             'status' => 'flying',
                         ]);

        $response->assertStatus(422)
                 ->assertJsonValidationErrors(['status']);
    }

    // -----------------------------------------------------------------------
    // List Tasks
    // -----------------------------------------------------------------------

    #[Test]
    public function test_user_can_list_own_tasks_paginated(): void
    {
        $user = User::factory()->create();
        Task::factory()->count(15)->for($user)->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson('/api/tasks');

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonStructure([
                     'data' => [
                         'data',
                         'current_page',
                         'last_page',
                         'per_page',
                         'total',
                     ],
                 ]);

        // Should return 10 per page (15 tasks total)
        $this->assertCount(10, $response->json('data.data'));
    }

    #[Test]
    public function test_user_can_filter_tasks_by_status(): void
    {
        $user = User::factory()->create();
        Task::factory()->count(3)->for($user)->pending()->create();
        Task::factory()->count(2)->for($user)->completed()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson('/api/tasks?status=pending');

        $response->assertStatus(200)
                 ->assertJson(['success' => true]);

        $this->assertCount(3, $response->json('data.data'));
    }

    // -----------------------------------------------------------------------
    // Show Task
    // -----------------------------------------------------------------------

    #[Test]
    public function test_user_can_view_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create(['title' => 'My specific task']);

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonPath('data.title', 'My specific task');
    }

    #[Test]
    public function test_user_cannot_view_another_users_task(): void
    {
        $owner  = User::factory()->create();
        $other  = User::factory()->create();
        $task   = Task::factory()->for($owner)->create();

        $response = $this->actingAs($other, 'sanctum')
                         ->getJson("/api/tasks/{$task->id}");

        $response->assertStatus(403)
                 ->assertJson(['success' => false]);
    }

    // -----------------------------------------------------------------------
    // Update Task
    // -----------------------------------------------------------------------

    #[Test]
    public function test_user_can_update_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->pending()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->putJson("/api/tasks/{$task->id}", [
                             'status' => 'completed',
                         ]);

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonPath('data.status', 'completed');

        $this->assertDatabaseHas('tasks', [
            'id'     => $task->id,
            'status' => 'completed',
        ]);
    }

    #[Test]
    public function test_user_cannot_update_another_users_task(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $task  = Task::factory()->for($owner)->create();

        $response = $this->actingAs($other, 'sanctum')
                         ->putJson("/api/tasks/{$task->id}", ['title' => 'Hijacked']);

        $response->assertStatus(403);
    }

    // -----------------------------------------------------------------------
    // Delete Task
    // -----------------------------------------------------------------------

    #[Test]
    public function test_user_can_soft_delete_own_task(): void
    {
        $user = User::factory()->create();
        $task = Task::factory()->for($user)->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Task deleted successfully.',
                 ]);

        // Soft deleted — should still exist in DB with deleted_at set
        $this->assertSoftDeleted('tasks', ['id' => $task->id]);
    }

    #[Test]
    public function test_user_cannot_delete_another_users_task(): void
    {
        $owner = User::factory()->create();
        $other = User::factory()->create();
        $task  = Task::factory()->for($owner)->create();

        $response = $this->actingAs($other, 'sanctum')
                         ->deleteJson("/api/tasks/{$task->id}");

        $response->assertStatus(403);
    }

    // -----------------------------------------------------------------------
    // Unauthenticated Access
    // -----------------------------------------------------------------------

    #[Test]
    public function test_unauthenticated_user_cannot_access_tasks(): void
    {
        $this->getJson('/api/tasks')->assertStatus(401);
    }
}
