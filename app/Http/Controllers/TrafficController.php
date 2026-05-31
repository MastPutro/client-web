<?php

namespace App\Http\Controllers;

use App\Services\SnmpService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class TrafficController extends Controller
{
    protected SnmpService $snmpService;

    public function __construct(SnmpService $snmpService)
    {
        $this->snmpService = $snmpService;
    }

    /**
     * Get current traffic data for a specific interface
     */
    public function getInterfaceTraffic($interfaceName): JsonResponse
    {
        try {
            $traffic = $this->snmpService->getInterfaceTraffic($interfaceName);
            
            // Calculate throughput in Mbps
            $traffic['in_throughput_mbps'] = 0;
            $traffic['out_throughput_mbps'] = 0;
            $traffic['in_octets_formatted'] = SnmpService::formatBytes($traffic['in_octets']);
            $traffic['out_octets_formatted'] = SnmpService::formatBytes($traffic['out_octets']);
            
            return response()->json([
                'success' => true,
                'data' => $traffic,
            ]);
        } catch (\Exception $e) {
            Log::error('Traffic endpoint error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get traffic history data for charting
     */
    public function getInterfaceTrafficHistory($interfaceName): JsonResponse
    {
        try {
            // Get parameters from request
            $samples = request('samples', 10);
            $interval = request('interval', 5);

            // Limit samples to reasonable amount (max 50)
            $samples = min((int)$samples, 50);
            $interval = max((int)$interval, 1);

            $history = $this->snmpService->getInterfaceTrafficHistory(
                $interfaceName,
                $samples,
                $interval
            );

            // Calculate deltas and throughput for each sample
            $chartData = [];
            foreach ($history as $index => $sample) {
                $dataPoint = [
                    'time' => $sample['timestamp']->format('H:i:s'),
                    'timestamp' => $sample['timestamp']->timestamp,
                    'sample' => $sample['sample'],
                    'in_octets' => $sample['in_octets'],
                    'out_octets' => $sample['out_octets'],
                    'in_octets_mb' => $sample['in_octets'] / (1024 * 1024),
                    'out_octets_mb' => $sample['out_octets'] / (1024 * 1024),
                ];

                // Calculate throughput delta if we have previous sample
                if ($index > 0) {
                    $prevSample = $history[$index - 1];
                    $timeDelta = $sample['timestamp']->diffInSeconds($prevSample['timestamp']);
                    
                    if ($timeDelta > 0) {
                        $inDelta = $sample['in_octets'] - $prevSample['in_octets'];
                        $outDelta = $sample['out_octets'] - $prevSample['out_octets'];
                        
                        // Convert to Mbps
                        $dataPoint['in_throughput_mbps'] = max(0, ($inDelta * 8) / 1000000 / $timeDelta);
                        $dataPoint['out_throughput_mbps'] = max(0, ($outDelta * 8) / 1000000 / $timeDelta);
                    }
                } else {
                    $dataPoint['in_throughput_mbps'] = 0;
                    $dataPoint['out_throughput_mbps'] = 0;
                }

                $chartData[] = $dataPoint;
            }

            return response()->json([
                'success' => true,
                'data' => $chartData,
                'interface' => $interfaceName,
                'samples' => count($chartData),
                'interval_seconds' => $interval,
            ]);
        } catch (\Exception $e) {
            Log::error('Traffic history endpoint error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get list of available interfaces
     */
    public function getInterfaces(): JsonResponse
    {
        try {
            $interfaces = $this->snmpService->getInterfaces();
            
            return response()->json([
                'success' => true,
                'data' => $interfaces,
                'total' => count($interfaces),
            ]);
        } catch (\Exception $e) {
            Log::error('Interfaces endpoint error: ' . $e->getMessage());
            return response()->json([
                'success' => false,
                'error' => $e->getMessage(),
            ], 500);
        }
    }

    /**
     * Get PPPoE interface traffic
     */
    public function getPppoeInterfaceTraffic($interfaceName): JsonResponse
    {
        return $this->getInterfaceTraffic($interfaceName);
    }

    /**
     * Get PPPoE interface traffic history
     */
    public function getPppoeInterfaceTrafficHistory($interfaceName): JsonResponse
    {
        return $this->getInterfaceTrafficHistory($interfaceName);
    }
}
