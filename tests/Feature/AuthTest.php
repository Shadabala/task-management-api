<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use PHPUnit\Framework\Attributes\Test;
use Tests\TestCase;

class AuthTest extends TestCase
{
    use RefreshDatabase;

    // -----------------------------------------------------------------------
    // Registration
    // -----------------------------------------------------------------------

    #[Test]
    public function test_user_can_register_with_valid_data(): void
    {
        $response = $this->postJson('/api/register', [
            'name'                  => 'Shadab Alam',
            'email'                 => 'shadab@example.com',
            'password'              => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertStatus(201)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => ['user', 'token'],
                 ])
                 ->assertJson(['success' => true]);

        $this->assertDatabaseHas('users', ['email' => 'shadab@example.com']);
    }

    #[Test]
    public function test_register_fails_with_duplicate_email(): void
    {
        User::factory()->create(['email' => 'duplicate@example.com']);

        $response = $this->postJson('/api/register', [
            'name'                  => 'Another User',
            'email'                 => 'duplicate@example.com',
            'password'              => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $response->assertStatus(422)
                 ->assertJson(['success' => false]);
    }

    #[Test]
    public function test_register_fails_without_required_fields(): void
    {
        $response = $this->postJson('/api/register', []);

        $response->assertStatus(422)
                 ->assertJson(['success' => false])
                 ->assertJsonValidationErrors(['name', 'email', 'password']);
    }

    // -----------------------------------------------------------------------
    // Login
    // -----------------------------------------------------------------------

    #[Test]
    public function test_user_can_login_with_correct_credentials(): void
    {
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'secret123',
        ]);

        $response->assertStatus(200)
                 ->assertJsonStructure([
                     'success',
                     'message',
                     'data' => ['user', 'token'],
                 ])
                 ->assertJson(['success' => true]);
    }

    #[Test]
    public function test_login_fails_with_wrong_password(): void
    {
        $user = User::factory()->create(['password' => bcrypt('secret123')]);

        $response = $this->postJson('/api/login', [
            'email'    => $user->email,
            'password' => 'wrongpassword',
        ]);

        $response->assertStatus(401)
                 ->assertJson([
                     'success' => false,
                     'message' => 'Invalid credentials. Please check your email and password.',
                 ]);
    }

    // -----------------------------------------------------------------------
    // Logout & Profile
    // -----------------------------------------------------------------------

    #[Test]
    public function test_authenticated_user_can_logout(): void
    {
        $user = User::factory()->create();
        $token = $user->createToken('api-token')->plainTextToken;

        $response = $this->withHeader('Authorization', "Bearer {$token}")
                         ->postJson('/api/logout');

        $response->assertStatus(200)
                 ->assertJson([
                     'success' => true,
                     'message' => 'Logged out successfully.',
                 ]);
    }

    #[Test]
    public function test_unauthenticated_user_cannot_access_protected_routes(): void
    {
        $this->getJson('/api/me')->assertStatus(401);
    }

    #[Test]
    public function test_authenticated_user_can_get_profile(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')
                         ->getJson('/api/me');

        $response->assertStatus(200)
                 ->assertJson(['success' => true])
                 ->assertJsonPath('data.email', $user->email);
    }
}
