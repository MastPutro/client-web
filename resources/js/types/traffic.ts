import type { ReactNode } from "react";

// Traffic data types
export interface TrafficSample {
    in_octets_formatted: ReactNode;
    out_octets_formatted: ReactNode;
    operational_status: ReactNode;
    time: string;
    timestamp: number;
    sample: number;
    in_octets: number;
    out_octets: number;
    in_octets_mb: number;
    out_octets_mb: number;
    in_throughput_mbps: number;
    out_throughput_mbps: number;
    _timestampMs?: number; // Internal field for precise time delta calculations
}

export interface TrafficResponse {
    success: boolean;
    data: TrafficSample[];
    interface: string;
    samples: number;
    interval_seconds: number;
    error?: string;
}

export interface InterfaceData {
    interface: string;
    index: number;
    in_octets: number;
    out_octets: number;
    in_packets: number;
    out_packets: number;
    in_errors: number;
    out_errors: number;
    speed: number;
    admin_status: string;
    operational_status: string;
    timestamp: string;
    in_throughput_mbps: number;
    out_throughput_mbps: number;
    in_octets_formatted: string;
    out_octets_formatted: string;
}

export interface InterfaceResponse {
    success: boolean;
    data: InterfaceData;
    error?: string;
}

export interface InterfacesListResponse {
    success: boolean;
    data: Record<number, string>;
    total: number;
    error?: string;
}
