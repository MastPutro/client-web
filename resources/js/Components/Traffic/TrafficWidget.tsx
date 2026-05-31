import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { TrafficSample } from '@/types/traffic';
import { InterfaceResponse } from '@/types/traffic';

interface TrafficWidgetProps {
    interfaceName: string;
    interfaceLabel?: string;
    samples?: number;
    interval?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
}

interface WidgetData {
    in_throughput_mbps: number;
    out_throughput_mbps: number;
    in_octets_formatted: string;
    out_octets_formatted: string;
    operational_status: string;
}

const TrafficWidget: React.FC<TrafficWidgetProps> = ({
    interfaceName,
    interfaceLabel = interfaceName,
    samples = 3,
    interval = 3,
    autoRefresh = true,
    refreshInterval = 20000,
}) => {
    const [data, setData] = useState<WidgetData | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchTrafficData = async () => {
        try {
            setLoading(true);
            setError(null);
            const samples_data: TrafficSample[] = [];

            // Collect samples to calculate throughput
            for (let i = 0; i < samples; i++) {
                try {
                    const sampleStartTime = Date.now();
                    
                    const response = await axios.get<InterfaceResponse>(
                        `/api/traffic/${interfaceName}`,
                    );

                    if (response.data.success) {
                        const traffic = response.data.data;
                        const sampleData: TrafficSample = {
                            time: new Date().toLocaleTimeString(),
                            timestamp: Math.floor(sampleStartTime / 1000),
                            sample: i + 1,
                            in_octets: traffic.in_octets ?? 0,
                            out_octets: traffic.out_octets ?? 0,
                            in_octets_mb: ((traffic.in_octets ?? 0) / (1024 * 1024)),
                            out_octets_mb: ((traffic.out_octets ?? 0) / (1024 * 1024)),
                            in_throughput_mbps: 0,
                            out_throughput_mbps: 0,
                            in_octets_formatted: traffic.in_octets_formatted,
                            out_octets_formatted: traffic.out_octets_formatted,
                            operational_status: traffic.operational_status,
                            _timestampMs: sampleStartTime,
                        };

                        // Calculate throughput if we have a previous sample
                        if (samples_data.length > 0) {
                            const prev = samples_data[samples_data.length - 1];
                            const prevTimestampMs = prev._timestampMs ?? Date.now();
                            const timeDeltaMs = sampleStartTime - prevTimestampMs;
                            const timeDeltaSec = timeDeltaMs / 1000;
                            
                            if (timeDeltaSec > 0) {
                                const inDelta = sampleData.in_octets - prev.in_octets;
                                const outDelta = sampleData.out_octets - prev.out_octets;
                                
                                sampleData.in_throughput_mbps = Math.max(0, (inDelta * 8) / 1000000 / timeDeltaSec);
                                sampleData.out_throughput_mbps = Math.max(0, (outDelta * 8) / 1000000 / timeDeltaSec);
                                
                                console.debug(
                                    `Sample ${i}: timeDelta=${timeDeltaSec.toFixed(2)}s, inDelta=${inDelta}, outDelta=${outDelta}, RX=${sampleData.in_throughput_mbps.toFixed(4)} Mbps, TX=${sampleData.out_throughput_mbps.toFixed(4)} Mbps`
                                );
                            }
                        }
                        
                        samples_data.push(sampleData);
                    } else {
                        setError(response.data.error || 'Failed to fetch traffic data');
                    }

                    // Wait before next sample (except for the last one)
                    if (i < samples - 1) {
                        await new Promise(resolve => setTimeout(resolve, interval * 1000));
                    }
                } catch (err) {
                    console.error(`Error fetching sample ${i + 1}:`, err);
                }
            }

            // Calculate average throughput from all deltas for more accuracy
            if (samples_data.length > 1) {
                let totalInThroughput = 0;
                let totalOutThroughput = 0;
                let deltaCount = 0;

                for (let i = 1; i < samples_data.length; i++) {
                    if (samples_data[i].in_throughput_mbps > 0 || samples_data[i].out_throughput_mbps > 0) {
                        totalInThroughput += samples_data[i].in_throughput_mbps;
                        totalOutThroughput += samples_data[i].out_throughput_mbps;
                        deltaCount++;
                    }
                }

                const lastSample = samples_data[samples_data.length - 1];
                setData({
                    in_throughput_mbps: deltaCount > 0 ? totalInThroughput / deltaCount : lastSample.in_throughput_mbps,
                    out_throughput_mbps: deltaCount > 0 ? totalOutThroughput / deltaCount : lastSample.out_throughput_mbps,
                    in_octets_formatted: lastSample.in_octets_formatted as string,
                    out_octets_formatted: lastSample.out_octets_formatted as string,
                    operational_status: lastSample.operational_status as string,
                });

                console.debug(
                    `Average throughput: RX=${((deltaCount > 0 ? totalInThroughput / deltaCount : 0).toFixed(4))} Mbps, TX=${((deltaCount > 0 ? totalOutThroughput / deltaCount : 0).toFixed(4))} Mbps`
                );
            }
        } catch (err) {
            const message =
                axios.isAxiosError(err) && err.response?.data?.error
                    ? err.response.data.error
                    : 'Error fetching traffic data';
            setError(message);
            console.error('Traffic widget error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTrafficData();

        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchTrafficData();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [interfaceName, autoRefresh, refreshInterval]);

    if (error) {
        return (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-xs font-medium text-red-800">{error}</p>
            </div>
        );
    }

    if (loading && !data) {
        return (
            <div className="animate-pulse rounded-lg bg-gray-100 p-4">
                <div className="mb-2 h-4 w-24 rounded bg-gray-300"></div>
                <div className="h-8 w-32 rounded bg-gray-300"></div>
            </div>
        );
    }

    if (!data) {
        return null;
    }

    return (
        <div className="space-y-4">
            {/* RX/TX Rate Cards */}
            <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                    <p className="text-xs font-medium text-blue-600">↓ RX Rate</p>
                    <p className="mt-2 text-2xl font-bold text-blue-700">
                        {data.in_throughput_mbps.toFixed(2)}
                    </p>
                    <p className="text-xs text-blue-500">Mbps</p>
                </div>

                <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                    <p className="text-xs font-medium text-green-600">↑ TX Rate</p>
                    <p className="mt-2 text-2xl font-bold text-green-700">
                        {data.out_throughput_mbps.toFixed(2)}
                    </p>
                    <p className="text-xs text-green-500">Mbps</p>
                </div>
            </div>

            {/* Status & Total Data */}
            <div className="rounded-lg border border-gray-200 bg-white p-4">
                <div className="mb-3 flex items-start justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-600">{interfaceLabel}</p>
                        <p className="mt-1 text-xs text-gray-500">
                            Status: <span className="font-semibold text-green-600">
                                {data.operational_status}
                            </span>
                        </p>
                    </div>
                    <button
                        onClick={fetchTrafficData}
                        disabled={loading}
                        className="text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
                        title="Refresh"
                    >
                        ⟳
                    </button>
                </div>

                <div className="border-t border-gray-200 pt-3 text-xs text-gray-500">
                    <p>Total In: <span className="font-semibold text-gray-700">{data.in_octets_formatted}</span></p>
                    <p>Total Out: <span className="font-semibold text-gray-700">{data.out_octets_formatted}</span></p>
                </div>
            </div>
        </div>
    );
};

export default TrafficWidget;
