<?php

namespace App\Services;

use Illuminate\Support\Facades\Log;
use Exception;

class SnmpService
{
    protected string $host;
    protected string $community;
    protected int $timeout;
    protected int $retries;

    public function __construct(
        string $host = '12.20.20.1',
        string $community = 'public',
        int $timeout = 1000000,
        int $retries = 3
    ) {
        $this->host = $host;
        $this->community = $community;
        $this->timeout = $timeout;
        $this->retries = $retries;
    }

    /**
     * Get traffic from a specific interface
     * @param string $interfaceName Name of the interface (e.g., pppoe-namaUserAuth)
     * @return array Traffic data with in/out octets
     */
    public function getInterfaceTraffic(string $interfaceName): array
    {
        try {
            // Get all interfaces
            $interfaces = $this->getInterfaces();
            
            // Find the interface by name
            $interfaceIndex = null;
            foreach ($interfaces as $index => $name) {
                if ($name === $interfaceName) {
                    $interfaceIndex = $index;
                    break;
                }
            }

            if ($interfaceIndex === null) {
                throw new Exception("Interface '{$interfaceName}' not found");
            }

            // Get traffic data for the interface
            $inOctets = $this->snmpGet("1.3.6.1.2.1.2.2.1.10.{$interfaceIndex}");
            $outOctets = $this->snmpGet("1.3.6.1.2.1.2.2.1.16.{$interfaceIndex}");
            $inPackets = $this->snmpGet("1.3.6.1.2.1.2.2.1.11.{$interfaceIndex}");
            $outPackets = $this->snmpGet("1.3.6.1.2.1.2.2.1.17.{$interfaceIndex}");
            $inErrors = $this->snmpGet("1.3.6.1.2.1.2.2.1.13.{$interfaceIndex}");
            $outErrors = $this->snmpGet("1.3.6.1.2.1.2.2.1.20.{$interfaceIndex}");
            $speed = $this->snmpGet("1.3.6.1.2.1.2.2.1.5.{$interfaceIndex}");
            $adminStatus = $this->snmpGet("1.3.6.1.2.1.2.2.1.7.{$interfaceIndex}");
            $operStatus = $this->snmpGet("1.3.6.1.2.1.2.2.1.8.{$interfaceIndex}");

            return [
                'interface' => $interfaceName,
                'index' => $interfaceIndex,
                'in_octets' => (int)$inOctets,
                'out_octets' => (int)$outOctets,
                'in_packets' => (int)$inPackets,
                'out_packets' => (int)$outPackets,
                'in_errors' => (int)$inErrors,
                'out_errors' => (int)$outErrors,
                'speed' => (int)$speed,
                'admin_status' => $this->statusToString($adminStatus),
                'operational_status' => $this->statusToString($operStatus),
                'timestamp' => now(),
            ];
        } catch (Exception $e) {
            Log::error('SNMP Error: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Get multiple traffic samples over time
     * @param string $interfaceName
     * @param int $samples Number of samples to collect
     * @param int $interval Interval in seconds between samples
     * @return array Array of traffic data points
     */
    public function getInterfaceTrafficHistory(string $interfaceName, int $samples = 10, int $interval = 5): array
    {
        $data = [];
        
        for ($i = 0; $i < $samples; $i++) {
            try {
                $traffic = $this->getInterfaceTraffic($interfaceName);
                $traffic['sample'] = $i + 1;
                $data[] = $traffic;
                
                if ($i < $samples - 1) {
                    sleep($interval);
                }
            } catch (Exception $e) {
                Log::error("Failed to get traffic sample {$i}: " . $e->getMessage());
            }
        }
        
        return $data;
    }

    /**
     * Get all interfaces on the device
     * @return array Indexed array of interface names
     */
    public function getInterfaces(): array
    {
        try {
            $interfaces = [];
            // OID for interface names: 1.3.6.1.2.1.2.2.1.2
            // Use snmpwalkoid to get actual OID indices (e.g., 1, 2, 3, ..., 15728640)
            // snmpwalk only returns numeric array keys which don't match actual SNMP OID suffixes
            $result = @snmpwalkoid($this->host, $this->community, '1.3.6.1.2.1.2.2.1.2', $this->timeout, $this->retries);
            
            if ($result === false) {
                throw new Exception('Failed to retrieve interfaces from SNMP');
            }

            // snmpwalkoid returns OID string => value map
            // We need to extract the numeric suffix from the OID
            foreach ($result as $oid => $value) {
                // Extract interface index from OID (e.g., "1.3.6.1.2.1.2.2.1.2.9" => 9)
                if (preg_match('/\.(\d+)$/', $oid, $matches)) {
                    $interfaceIndex = $matches[1];  // Get the actual SNMP OID suffix
                    $interfaces[$interfaceIndex] = $this->parseSnmpValue($value);
                }
            }

            return $interfaces;
        } catch (Exception $e) {
            Log::error('Error getting interfaces: ' . $e->getMessage());
            throw $e;
        }
    }

    /**
     * Single SNMP GET request
     */
    protected function snmpGet(string $oid): ?string
    {
        $result = @snmpget($this->host, $this->community, $oid, $this->timeout, $this->retries);
        
        if ($result === false) {
            Log::warning("SNMP GET failed for OID: {$oid}");
            return null;
        }
        
        return $this->parseSnmpValue($result);
    }

    /**
     * Parse SNMP value (remove type hints and clean data)
     */
    protected function parseSnmpValue(string $value): string
    {
        // Remove type hints like "INTEGER: ", "Gauge32: ", "STRING: ", etc.
        $value = preg_replace('/^[A-Za-z0-9]+:\s+/', '', $value);
        // Remove quotes and angle brackets
        $value = trim($value, '"<>');
        
        return $value;
    }

    /**
     * Convert SNMP status to readable string
     */
    protected function statusToString(string $value): string
    {
        $statusMap = [
            '1' => 'up',
            '2' => 'down',
            '3' => 'testing',
        ];
        
        return $statusMap[$value] ?? 'unknown';
    }

    /**
     * Calculate throughput (Mbps) from octets
     */
    public static function calculateThroughput(int $octets, int $intervalSeconds = 1): float
    {
        // Convert octets to megabits: octets * 8 / 1,000,000
        return ($octets * 8) / 1000000 / $intervalSeconds;
    }

    /**
     * Convert bytes to human-readable format
     */
    public static function formatBytes(int $bytes): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        $bytes /= (1 << (10 * $pow));

        return round($bytes, 2) . ' ' . $units[$pow];
    }
}
