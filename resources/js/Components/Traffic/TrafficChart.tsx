import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
} from 'recharts';
import { TrafficSample, TrafficResponse, InterfaceResponse } from '@/types/traffic';

interface TrafficChartProps {
    interfaceName: string;
    interfaceLabel?: string;
    samples?: number;
    interval?: number;
    autoRefresh?: boolean;
    refreshInterval?: number;
    chartType?: 'line' | 'bar';
}

const TrafficChart: React.FC<TrafficChartProps> = ({
    interfaceName,
    interfaceLabel = interfaceName,
    samples = 10,
    interval = 5,
    autoRefresh = true,
    refreshInterval = 10000,
    chartType = 'line',
}) => {
    const [data, setData] = useState<TrafficSample[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchTrafficData = async () => {
        try {
            setLoading(true);
            setError(null);
            const samples_arr: TrafficSample[] = [];

            // Collect samples on client side instead of using blocking server-side sleep
            for (let i = 0; i < samples; i++) {
                try {
                    const sampleStartTime = Date.now(); // Capture time at start of sample
                    
                    const response = await axios.get<InterfaceResponse>(
                        `/api/traffic/${interfaceName}`,
                    );

                    if (response.data.success) {
                        const traffic = response.data.data;
                        const sampleData: TrafficSample = {
                            time: new Date().toLocaleTimeString(),
                            timestamp: Math.floor(sampleStartTime / 1000), // Use seconds for display
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
                            _timestampMs: sampleStartTime, // Store ms precision for throughput calculation
                        };

                        // Calculate throughput if we have a previous sample
                        if (samples_arr.length > 0) {
                            const prev = samples_arr[samples_arr.length - 1];
                            // Use millisecond precision for time delta
                            const prevTimestampMs = prev._timestampMs ?? Date.now();
                            const timeDeltaMs = sampleStartTime - prevTimestampMs;
                            const timeDeltaSec = timeDeltaMs / 1000;
                            
                            if (timeDeltaSec > 0) {
                                const inDelta = sampleData.in_octets - prev.in_octets;
                                const outDelta = sampleData.out_octets - prev.out_octets;
                                
                                // Formula: (octets * 8 bits/octet) / (1,000,000 bits/Mbps) / seconds
                                sampleData.in_throughput_mbps = Math.max(0, (inDelta * 8) / 1000000 / timeDeltaSec);
                                sampleData.out_throughput_mbps = Math.max(0, (outDelta * 8) / 1000000 / timeDeltaSec);
                                
                                console.debug(
                                    `Sample ${i + 1}: timeDelta=${timeDeltaSec.toFixed(2)}s, inDelta=${inDelta}, outDelta=${outDelta}, throughput in=${sampleData.in_throughput_mbps.toFixed(2)}, out=${sampleData.out_throughput_mbps.toFixed(2)}`
                                );
                            }
                        }
                        
                        samples_arr.push(sampleData);
                        console.debug(`Sample ${i + 1} collected:`, {
                            in_octets: sampleData.in_octets,
                            out_octets: sampleData.out_octets,
                            in_throughput_mbps: sampleData.in_throughput_mbps,
                            out_throughput_mbps: sampleData.out_throughput_mbps,
                        });
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

            if (samples_arr.length > 0) {
                setData(samples_arr);
                setLastUpdate(new Date());
            }
        } catch (err) {
            const message =
                axios.isAxiosError(err) && err.response?.data?.error
                    ? err.response.data.error
                    : 'Error fetching traffic data';
            setError(message);
            console.error('Traffic data fetch error:', err);
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
    }, [interfaceName, samples, interval, autoRefresh, refreshInterval]);

    if (error) {
        return (
            <div className="rounded-lg bg-red-50 p-4">
                <p className="text-sm font-medium text-red-800">Error Loading Traffic Data</p>
                <p className="mt-1 text-sm text-red-700">{error}</p>
                <button
                    onClick={fetchTrafficData}
                    className="mt-3 inline-flex items-center rounded-md bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    if (loading && data.length === 0) {
        return (
            <div className="flex items-center justify-center rounded-lg bg-gray-50 p-8">
                <div className="text-center">
                    <div className="inline-block">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                    </div>
                    <p className="mt-4 text-gray-600">Loading traffic data...</p>
                </div>
            </div>
        );
    }

    const maxThroughput = data.length > 0
        ? Math.max(
              ...data.map((d) => Math.max(d.in_throughput_mbps || 0, d.out_throughput_mbps || 0)),
              0
          )
        : 0;

    const maxInOctets = data.length > 0
        ? Math.max(...data.map((d) => d.in_octets_mb || 0), 0)
        : 0;

    const tooltipFormatter = (value: any): string => {
        return typeof value === 'number' ? `${value.toFixed(2)} Mbps` : 'N/A';
    };

    const dataFormatter = (value: any): string => {
        return typeof value === 'number' ? `${value.toFixed(2)} MB` : 'N/A';
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                    <h3 className="text-lg font-semibold text-gray-900">{interfaceLabel}</h3>
                    {lastUpdate && (
                        <p className="mt-1 text-sm text-gray-500">
                            Last updated: {lastUpdate.toLocaleTimeString()}
                        </p>
                    )}
                </div>
                <button
                    onClick={fetchTrafficData}
                    disabled={loading}
                    className="inline-flex items-center rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
                >
                    {loading ? 'Updating...' : 'Refresh'}
                </button>
            </div>

            {/* Stats Cards */}
            {data.length > 0 && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {/* Current Download */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-sm font-medium text-gray-600">Incoming Rate</p>
                        <div className="mt-2">
                            <p className="text-2xl font-bold text-blue-600">
                                {(data[data.length - 1]?.in_throughput_mbps ?? 0)?.toFixed(2) ?? 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">Mbps</p>
                        </div>
                    </div>

                    {/* Current Upload */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-sm font-medium text-gray-600">Outgoing Rate</p>
                        <div className="mt-2">
                            <p className="text-2xl font-bold text-green-600">
                                {(data[data.length - 1]?.out_throughput_mbps ?? 0)?.toFixed(2) ?? 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">Mbps</p>
                        </div>
                    </div>

                    {/* Total Downloaded */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-sm font-medium text-gray-600">Total In</p>
                        <div className="mt-2">
                            <p className="text-2xl font-bold text-indigo-600">
                                {(data[data.length - 1]?.in_octets_mb ?? 0)?.toFixed(2) ?? 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">MB</p>
                        </div>
                    </div>

                    {/* Total Uploaded */}
                    <div className="rounded-lg border border-gray-200 bg-white p-4">
                        <p className="text-sm font-medium text-gray-600">Total Out</p>
                        <div className="mt-2">
                            <p className="text-2xl font-bold text-purple-600">
                                {(data[data.length - 1]?.out_octets_mb ?? 0)?.toFixed(2) ?? 'N/A'}
                            </p>
                            <p className="text-xs text-gray-500">MB</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Throughput Chart */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h4 className="mb-4 text-sm font-semibold text-gray-900">Network Throughput</h4>
                <ResponsiveContainer width="100%" height={400}>
                    {chartType === 'bar' ? (
                        <BarChart
                            data={data}
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis label={{ value: 'Mbps', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={tooltipFormatter} />
                            <Legend />
                            <Bar dataKey="in_throughput_mbps" fill="#3b82f6" name="Incoming" />
                            <Bar dataKey="out_throughput_mbps" fill="#10b981" name="Outgoing" />
                        </BarChart>
                    ) : (
                        <LineChart 
                            width="100%" 
                            height={400} 
                            data={data} 
                            margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                        >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis label={{ value: 'Mbps', angle: -90, position: 'insideLeft' }} />
                            <Tooltip formatter={tooltipFormatter} />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="in_throughput_mbps"
                                stroke="#3b82f6"
                                dot={false}
                                name="Incoming"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="out_throughput_mbps"
                                stroke="#10b981"
                                dot={false}
                                name="Outgoing"
                                strokeWidth={2}
                            />
                        </LineChart>
                    )}
                </ResponsiveContainer>
            </div>

            {/* Data Chart */}
            <div className="rounded-lg border border-gray-200 bg-white p-6">
                <h4 className="mb-4 text-sm font-semibold text-gray-900">Cumulative Data Transfer</h4>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="time" />
                        <YAxis label={{ value: 'MB', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={dataFormatter} />
                        <Legend />
                        <Line
                            type="monotone"
                            dataKey="in_octets_mb"
                            stroke="#6366f1"
                            dot={false}
                            name="Total In"
                            strokeWidth={2}
                        />
                        <Line
                            type="monotone"
                            dataKey="out_octets_mb"
                            stroke="#d946ef"
                            dot={false}
                            name="Total Out"
                            strokeWidth={2}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

export default TrafficChart;
