<?php
namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use Inertia\Inertia;
class ComplaintController extends Controller
{
    /**
     * Base URL for Web-Admin API
     */
    private function adminApiUrl(): string
    {
        return rtrim(config('services.admin_api.url', env('ADMIN_API_URL', 'https://admin.sentolop.biz.id/api')), '/');
    }
    /**
     * Render the Complaint/Ticket page
     */
    public function index()
    {
        return Inertia::render('Complaint/Index');
    }
    /**
     * Resolve the customer_id from Web-Admin by matching user name.
     * Caches the result for 5 minutes to avoid repeated API calls.
     */
    private function resolveCustomerId(): ?int
    {
        $user = Auth::user();
        if (!$user) {
            return null;
        }
        $cacheKey = 'customer_id_for_user_' . $user->id;
        return Cache::remember($cacheKey, 300, function () use ($user) {
            try {
                $page = 1;
                $maxPages = 10;
                while ($page <= $maxPages) {
                    $response = Http::timeout(10)->get($this->adminApiUrl() . '/user-list', [
                        'page' => $page,
                    ]);
                    if (!$response->successful()) {
                        break;
                    }
                    $data = $response->json();
                    $customers = $data['data'] ?? [];
                    foreach ($customers as $customer) {
                        if (strcasecmp($customer['name'], $user->name) === 0) {
                            return (int) $customer['id'];
                        }
                    }
                    // Check if there are more pages
                    if ($page >= ($data['last_page'] ?? 1)) {
                        break;
                    }
                    $page++;
                }
            } catch (\Exception $e) {
                \Log::error('Failed to resolve customer ID: ' . $e->getMessage());
            }
            return null;
        });
    }
    /**
     * Get tickets for the authenticated customer
     */
    public function getTickets(Request $request): JsonResponse
    {
        $customerId = $this->resolveCustomerId();
        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan di sistem admin',
            ], 404);
        }
        try {
            $params = array_filter([
                'customer_id' => $customerId,
                'status' => $request->get('status'),
                'priority' => $request->get('priority'),
                'category' => $request->get('category'),
                'search' => $request->get('search'),
                'sort_by' => $request->get('sort_by', 'created_at'),
                'sort_order' => $request->get('sort_order', 'desc'),
                'per_page' => $request->get('per_page', 15),
                'page' => $request->get('page', 1),
            ]);
            $response = Http::timeout(15)->get($this->adminApiUrl() . '/tickets', $params);
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil data tiket: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Get ticket detail
     */
    public function getTicketDetail(int $ticketId): JsonResponse
    {
        try {
            $response = Http::timeout(10)->get($this->adminApiUrl() . '/tickets/' . $ticketId);
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil detail tiket: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Create a new ticket
     */
    public function createTicket(Request $request): JsonResponse
    {
        $customerId = $this->resolveCustomerId();
        if (!$customerId) {
            return response()->json([
                'success' => false,
                'message' => 'Customer tidak ditemukan di sistem admin',
            ], 404);
        }
        $validated = $request->validate([
            'title' => 'required|string|max:255',
            'description' => 'required|string',
            'priority' => 'required|in:low,medium,high,urgent',
            'category' => 'required|in:billing,technical,service,complaint,other',
        ]);
        try {
            $validated['customer_id'] = $customerId;
            $response = Http::timeout(15)->post($this->adminApiUrl() . '/tickets', $validated);
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal membuat tiket: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Get replies for a ticket
     */
    public function getReplies(int $ticketId, Request $request): JsonResponse
    {
        try {
            $params = [
                'per_page' => $request->get('per_page', 50),
                'page' => $request->get('page', 1),
            ];
            $response = Http::timeout(10)->get(
                $this->adminApiUrl() . '/tickets/' . $ticketId . '/replies',
                $params
            );
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil balasan: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Add a reply to a ticket
     */
    public function addReply(Request $request, int $ticketId): JsonResponse
    {
        $validated = $request->validate([
            'message' => 'required|string',
        ]);
        try {
            $response = Http::timeout(15)->post(
                $this->adminApiUrl() . '/tickets/' . $ticketId . '/replies',
                [
                    'message' => $validated['message'],
                    'is_internal' => false,
                ]
            );
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengirim balasan: ' . $e->getMessage(),
            ], 500);
        }
    }
    /**
     * Get ticket statistics
     */
    public function getStats(): JsonResponse
    {
        try {
            $response = Http::timeout(10)->get($this->adminApiUrl() . '/tickets/stats/summary');
            return response()->json($response->json(), $response->status());
        } catch (\Exception $e) {
            return response()->json([
                'success' => false,
                'message' => 'Gagal mengambil statistik: ' . $e->getMessage(),
            ], 500);
        }
    }
}