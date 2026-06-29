<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\ComplaintController;
use App\Http\Controllers\ResourceController;
use App\Http\Controllers\BillingController;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Route::get('/dashboard', function () {
//     return Inertia::render('Dashboard');
// })->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::get('/dashboard', [ResourceController::class, 'dashboard'])->name('dashboard');

    // Billing
    Route::get('/billing/data', [BillingController::class, 'getBillingData'])->name('billing.data');
    Route::get('/billing/payment-history', [BillingController::class, 'paymentHistory'])->name('billing.payment-history');
    Route::get('/billing/payment-history/data', [BillingController::class, 'getPaymentHistoryData'])->name('billing.payment-history.data');

    // Complaint / Ticket System
    Route::get('/complaints', [ComplaintController::class, 'index'])->name('complaints.index');
    Route::get('/complaints/tickets', [ComplaintController::class, 'getTickets'])->name('complaints.tickets');
    Route::post('/complaints/tickets', [ComplaintController::class, 'createTicket'])->name('complaints.tickets.store');
    Route::get('/complaints/tickets/stats', [ComplaintController::class, 'getStats'])->name('complaints.tickets.stats');
    Route::get('/complaints/tickets/{ticket}', [ComplaintController::class, 'getTicketDetail'])->name('complaints.tickets.show');
    Route::get('/complaints/tickets/{ticket}/replies', [ComplaintController::class, 'getReplies'])->name('complaints.tickets.replies');
    Route::post('/complaints/tickets/{ticket}/replies', [ComplaintController::class, 'addReply'])->name('complaints.tickets.replies.store');

});

require __DIR__.'/auth.php';

