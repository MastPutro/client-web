import React from "react";

type GaugeChartProps = {
    value: number; // Current bandwidth usage (e.g., Mbps)
    max: number;   // Maximum bandwidth (e.g., Mbps)
    label?: string;
};

const GaugeChart: React.FC<GaugeChartProps> = ({ value, max, label = "Bandwidth" }) => {
    const percent = Math.min(Math.max(value / max, 0), 1);
    const angle = percent * 180; // 0 to 180 degrees

    // Calculate needle position
    const r = 80;
    const cx = 100;
    const cy = 100;
    const theta = (Math.PI * (1 - percent)); // 180deg (left) to 0deg (right)
    const needleX = cx + r * Math.cos(theta);
    const needleY = cy - r * Math.sin(theta);

    // Color based on usage
    const getColor = () => {
        if (percent < 0.6) return "#4caf50";
        if (percent < 0.85) return "#ff9800";
        return "#f44336";
    };

    return (
        <svg width={200} height={120}>
            {/* Background arc */}
            <path
                d="M20,100 A80,80 0 0,1 180,100"
                fill="none"
                stroke="#eee"
                strokeWidth={20}
            />
            {/* Foreground arc */}
            <path
                d={describeArc(cx, cy, r, 180, 180 - angle)}
                fill="none"
                stroke={getColor()}
                strokeWidth={20}
                strokeLinecap="round"
            />
            {/* Needle */}
            <line
                x1={cx}
                y1={cy}
                x2={needleX}
                y2={needleY}
                stroke="#222"
                strokeWidth={4}
            />
            {/* Center circle */}
            <circle cx={cx} cy={cy} r={8} fill="#222" />
            {/* Value text */}
            <text x={cx} y={cy + 40} textAnchor="middle" fontSize={22} fontWeight="bold">
                {value} / {max} Mbps
            </text>
            {/* Label */}
            <text x={cx} y={cy + 60} textAnchor="middle" fontSize={16} fill="#666">
                {label}
            </text>
        </svg>
    );
};

// Helper to describe SVG arc
function describeArc(cx: number, cy: number, r: number, startAngle: number, endAngle: number) {
    const start = polarToCartesian(cx, cy, r, endAngle);
    const end = polarToCartesian(cx, cy, r, startAngle);

    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";

    return [
        "M", start.x, start.y,
        "A", r, r, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
}

function polarToCartesian(cx: number, cy: number, r: number, angle: number) {
    const rad = (angle - 90) * Math.PI / 180.0;
    return {
        x: cx + (r * Math.cos(rad)),
        y: cy + (r * Math.sin(rad))
    };
}

export default GaugeChart;