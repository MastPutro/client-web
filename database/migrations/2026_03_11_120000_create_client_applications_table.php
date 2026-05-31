<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('client_applications', function (Blueprint $table) {
            $table->id();
            $table->string('name')->unique(); // Nama aplikasi
            $table->string('api_key')->unique(); // API Key untuk autentikasi
            $table->text('description')->nullable();
            $table->string('status')->default('active'); // active, inactive, revoked
            $table->json('allowed_endpoints')->nullable(); // Endpoint mana saja yang boleh diakses
            $table->timestamp('last_used_at')->nullable();
            $table->timestamps();
            
            $table->index('api_key');
            $table->index('status');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('client_applications');
    }
};
