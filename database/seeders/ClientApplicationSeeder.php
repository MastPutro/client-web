<?php

namespace Database\Seeders;

use App\Models\ClientApplication;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ClientApplicationSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Buat aplikasi testing
        ClientApplication::create([
            'name' => 'Mobile App',
            'api_key' => Str::uuid(),
            'description' => 'Aplikasi mobile untuk registrasi user',
            'status' => 'active',
            'allowed_endpoints' => ['register', 'login'],
        ]);

        ClientApplication::create([
            'name' => 'Web App',
            'api_key' => Str::uuid(),
            'description' => 'Aplikasi web untuk registrasi user',
            'status' => 'active',
            'allowed_endpoints' => ['register', 'login'],
        ]);

        ClientApplication::create([
            'name' => 'Testing Client',
            'api_key' => 'test-api-key-12345',
            'description' => 'Client untuk testing API',
            'status' => 'active',
            'allowed_endpoints' => ['register', 'login'],
        ]);
    }
}
