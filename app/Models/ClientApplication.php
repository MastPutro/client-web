<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Casts\AsCollection;

class ClientApplication extends Model
{
    protected $fillable = [
        'name',
        'api_key',
        'description',
        'status',
        'allowed_endpoints',
        'last_used_at',
    ];

    protected $casts = [
        'allowed_endpoints' => AsCollection::class,
        'last_used_at' => 'datetime',
    ];

    /**
     * Check if the API key is valid and active
     */
    public static function isValidApiKey(string $apiKey): bool
    {
        return self::where('api_key', $apiKey)
            ->where('status', 'active')
            ->exists();
    }

    /**
     * Get application by API key
     */
    public static function findByApiKey(string $apiKey): ?self
    {
        return self::where('api_key', $apiKey)
            ->where('status', 'active')
            ->first();
    }

    /**
     * Check if endpoint is allowed for this application
     */
    public function isEndpointAllowed(string $endpoint): bool
    {
        // Jika allowed_endpoints null, semua endpoint diizinkan
        if (!$this->allowed_endpoints) {
            return true;
        }

        return $this->allowed_endpoints->contains($endpoint);
    }
}
