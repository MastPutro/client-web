<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;

class BillingController extends Controller
{
    /**
     * Base URL for Web-Admin API
     */
    private function adminApiUrl(): string
    {
        return rtrim(config('services.admin_api.url', env('ADMIN_API_URL', 'http://localhost:8000/api')), '/');
    }

    private function adminPaymentUrl(): ?string
    {
        return rtrim(config('services.admin_payment.url', env('ADMIN_PAYMENT_URL', 'http://localhost:8000')), '/');
    }
    

    /**
     * Get billing data filtered for the authenticated user.
     * Fetches from admin API /keuangan/billing-data then filters
     * the customers array to only include the auth user's entry.
     */
    public function getBillingData(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        $cacheKey = 'billing_data_for_user_' . $user->id;

        try {
            $data = Cache::remember($cacheKey, 120, function () use ($user) {
                $response = Http::timeout(15)->get($this->adminApiUrl() . '/keuangan/billing-data');

                if (!$response->successful()) {
                    return null;
                }

                $json = $response->json();

                if (!($json['success'] ?? false) || !isset($json['data']['customers'])) {
                    return null;
                }

                // Filter customers to only include the authenticated user
                $allCustomers = $json['data']['customers'];
                $userCustomer = null;

                foreach ($allCustomers as $customer) {
                    if (strcasecmp($customer['name'], $user->name) === 0) {
                        $userCustomer = $customer;
                        break;
                    }
                }

                return [
                    'success' => true,
                    'data' => [
                        'customer' => $userCustomer,
                        'billing_policy' => $json['data']['billing_policy'] ?? null,
                        'current_month' => $json['data']['current_month'] ?? null,
                        'current_year' => $json['data']['current_year'] ?? null,
                        'payment_base_url' => $this->adminPaymentUrl() . '/payment',
                    ],
                ];
            });

            if (!$data) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengambil data tagihan',
                ], 500);
            }

            return response()->json($data);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch billing data: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data tagihan: ' . $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Render the Payment History page
     */
    public function paymentHistory()
    {
        return Inertia::render('Billing/PaymentHistory');
    }

    /**
     * Get payment history data for the authenticated user.
     * Fetches from admin API /keuangan/payment-history/{name}
     */
    public function getPaymentHistoryData(): JsonResponse
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Unauthorized',
            ], 401);
        }

        try {
            $response = Http::timeout(15)->get(
                $this->adminApiUrl() . '/keuangan/payment-history/' . urlencode($user->name)
            );

            if (!$response->successful()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Gagal mengambil data riwayat pembayaran',
                ], $response->status());
            }

            $json = $response->json();

            return response()->json([
                'success' => true,
                'data' => $json['data'] ?? [],
            ]);
        } catch (\Exception $e) {
            \Log::error('Failed to fetch payment history: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data riwayat pembayaran: ' . $e->getMessage(),
            ], 500);
        }
    }
}
