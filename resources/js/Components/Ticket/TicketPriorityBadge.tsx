import React from 'react';
import { TicketPriority, PRIORITY_LABELS } from '@/types/ticket';
interface TicketPriorityBadgeProps {
    priority: TicketPriority;
    size?: 'sm' | 'md';
}
const priorityStyles: Record<TicketPriority, string> = {
    low: 'bg-slate-100 text-slate-600 border-slate-200',
    medium: 'bg-sky-100 text-sky-700 border-sky-200',
    high: 'bg-orange-100 text-orange-700 border-orange-200',
    urgent: 'bg-red-100 text-red-700 border-red-200 animate-pulse',
};
const priorityIcons: Record<TicketPriority, string> = {
    low: '▽',
    medium: '◇',
    high: '△',
    urgent: '⚠',
};
const TicketPriorityBadge: React.FC<TicketPriorityBadgeProps> = ({ priority, size = 'sm' }) => {
    const sizeClass = size === 'sm'
        ? 'px-2.5 py-0.5 text-xs'
        : 'px-3 py-1 text-sm';
    return (
        <span
            className={`inline-flex items-center gap-1 rounded-full border font-medium ${priorityStyles[priority]} ${sizeClass}`}
        >
            <span className="text-[10px]">{priorityIcons[priority]}</span>
            {PRIORITY_LABELS[priority]}
        </span>
    );
};
export default TicketPriorityBadge;
