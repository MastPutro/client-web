import React from 'react';
import { TicketStatus, STATUS_LABELS } from '@/types/ticket';
interface TicketStatusBadgeProps {
    status: TicketStatus;
    size?: 'sm' | 'md';
}
const statusStyles: Record<TicketStatus, string> = {
    open: 'bg-blue-100 text-blue-800 border-blue-200',
    in_progress: 'bg-amber-100 text-amber-800 border-amber-200',
    pending: 'bg-gray-100 text-gray-700 border-gray-200',
    resolved: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    closed: 'bg-slate-200 text-slate-600 border-slate-300',
};
const statusDots: Record<TicketStatus, string> = {
    open: 'bg-blue-500',
    in_progress: 'bg-amber-500 animate-pulse',
    pending: 'bg-gray-400',
    resolved: 'bg-emerald-500',
    closed: 'bg-slate-400',
};
const TicketStatusBadge: React.FC<TicketStatusBadgeProps> = ({ status, size = 'sm' }) => {
    const sizeClass = size === 'sm'
        ? 'px-2.5 py-0.5 text-xs'
        : 'px-3 py-1 text-sm';
    return (
        <span
            className={`inline-flex items-center gap-1.5 rounded-full border font-medium ${statusStyles[status]} ${sizeClass}`}
        >
            <span className={`inline-block h-1.5 w-1.5 rounded-full ${statusDots[status]}`} />
            {STATUS_LABELS[status]}
        </span>
    );
};
export default TicketStatusBadge;