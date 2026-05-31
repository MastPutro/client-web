<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Models\ClientApplication;

class VerifyClientApplication
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next): Response
    {
        // Ambil API Key dari header
        $apiKey = $request->header('X-API-Key');

        // Validasi API Key ada
        if (!$apiKey) {
            return response()->json([
                'message' => 'API Key is required',
                'error' => 'missing_api_key',
            ], 401);
        }

        // Cek apakah API Key valid
        $application = ClientApplication::findByApiKey($apiKey);

        if (!$application) {
            return response()->json([
                'message' => 'Invalid or inactive API Key',
                'error' => 'invalid_api_key',
            ], 401);
        }

        // Update last_used_at
        $application->update(['last_used_at' => now()]);

        // Attach application ke request untuk digunakan di controller jika diperlukan
        $request->merge(['client_application' => $application]);

        return $next($request);
    }
}
