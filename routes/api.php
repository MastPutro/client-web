<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Auth\RegisteredUserController;
use App\Http\Controllers\TrafficController;
use App\Http\Controllers\ResourceController;

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');

// Public API routes yang tidak memerlukan autentikasi
Route::middleware(['api'])->group(function () {
    // Traffic monitoring routes
    Route::get('/traffic/interfaces', [TrafficController::class, 'getInterfaces']);
    Route::get('/traffic/{interfaceName}', [TrafficController::class, 'getInterfaceTraffic']);
    Route::get('/traffic/{interfaceName}/history', [TrafficController::class, 'getInterfaceTrafficHistory']);
    Route::get('/traffic/pppoe/{interfaceName}', [TrafficController::class, 'getPppoeInterfaceTraffic']);
    Route::get('/traffic/pppoe/{interfaceName}/history', [TrafficController::class, 'getPppoeInterfaceTrafficHistory']);
});

// Protected API routes - memerlukan API Key
Route::middleware(['api', 'verify.client.application'])->group(function () {
    // Register user via API - memerlukan API Key
    Route::post('/register-user', [RegisteredUserController::class, 'apiStore']);
    Route::delete('/delete-user/{email}', [RegisteredUserController::class, 'apiDelete']);
    
    // Tambahkan endpoint API lainnya di sini
});
