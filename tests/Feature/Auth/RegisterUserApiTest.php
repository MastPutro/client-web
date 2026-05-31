<?php

namespace Tests\Feature\Auth;

use App\Models\ClientApplication;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegisterUserApiTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Create test client application
        ClientApplication::create([
            'name' => 'Test Client',
            'api_key' => 'test-api-key-12345',
            'description' => 'Test client for registration',
            'status' => 'active',
        ]);
    }

    /**
     * Test successful user registration with valid API key
     */
    public function test_can_register_user_with_valid_api_key(): void
    {
        $response = $this->postJson('/api/register-user', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
        ], [
            'X-API-Key' => 'test-api-key-12345',
        ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'User registered successfully',
            ])
            ->assertJsonStructure([
                'message',
                'user' => [
                    'id',
                    'name',
                    'email',
                    'created_at',
                    'updated_at',
                ],
            ]);

        $this->assertDatabaseHas('users', [
            'email' => 'john@example.com',
            'name' => 'John Doe',
        ]);
    }

    /**
     * Test user registration fails without API key
     */
    public function test_cannot_register_user_without_api_key(): void
    {
        $response = $this->postJson('/api/register-user', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'API Key is required',
                'error' => 'missing_api_key',
            ]);
    }

    /**
     * Test user registration fails with invalid API key
     */
    public function test_cannot_register_user_with_invalid_api_key(): void
    {
        $response = $this->postJson('/api/register-user', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
        ], [
            'X-API-Key' => 'invalid-api-key',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid or inactive API Key',
                'error' => 'invalid_api_key',
            ]);
    }

    /**
     * Test user registration fails with revoked API key
     */
    public function test_cannot_register_user_with_revoked_api_key(): void
    {
        // Revoke the API key
        ClientApplication::where('api_key', 'test-api-key-12345')
            ->update(['status' => 'revoked']);

        $response = $this->postJson('/api/register-user', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
        ], [
            'X-API-Key' => 'test-api-key-12345',
        ]);

        $response->assertStatus(401)
            ->assertJson([
                'message' => 'Invalid or inactive API Key',
                'error' => 'invalid_api_key',
            ]);
    }

    /**
     * Test validation fails for duplicate email
     */
    public function test_cannot_register_user_with_duplicate_email(): void
    {
        // Create existing user
        User::create([
            'name' => 'Existing User',
            'email' => 'john@example.com',
            'password' => bcrypt('Password@123'),
        ]);

        $response = $this->postJson('/api/register-user', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
        ], [
            'X-API-Key' => 'test-api-key-12345',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    /**
     * Test validation fails for invalid password
     */
    public function test_cannot_register_user_with_weak_password(): void
    {
        $response = $this->postJson('/api/register-user', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'weak',
            'password_confirmation' => 'weak',
        ], [
            'X-API-Key' => 'test-api-key-12345',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('password');
    }

    /**
     * Test API key last_used_at gets updated
     */
    public function test_api_key_last_used_at_is_updated(): void
    {
        $application = ClientApplication::where('api_key', 'test-api-key-12345')->first();
        $this->assertNull($application->last_used_at);

        $this->postJson('/api/register-user', [
            'name' => 'John Doe',
            'email' => 'john@example.com',
            'password' => 'Password@123',
            'password_confirmation' => 'Password@123',
        ], [
            'X-API-Key' => 'test-api-key-12345',
        ]);

        $application->refresh();
        $this->assertNotNull($application->last_used_at);
    }
}
