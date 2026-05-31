export interface Customer {
    id: number;
    name: string;
    phone_number?: string;
    ip_address?: string;
    status?: string;
}

export interface AssignedUser {
    id: number;
    name: string;
    email?: string;
}

export interface TicketReply {
    id: number;
    ticket_id: number;
    user_id: number;
    message: string;
    is_internal: boolean;
    user?: AssignedUser;
    created_at: string;
    updated_at: string;
}

export type TicketStatus = 'open' | 'in_progress' | 'pending' | 'resolved' | 'closed';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketCategory = 'billing' | 'technical' | 'service' | 'complaint' | 'other';

export interface Ticket {
    id: number;
    ticket_number: string;
    title: string;
    description: string;
    status: TicketStatus;
    priority: TicketPriority;
    category: TicketCategory;
    customer_id: number;
    assigned_to: number | null;
    resolution_notes: string | null;
    response_time_minutes: number | null;
    resolution_time_minutes: number | null;
    customer?: Customer;
    assignedTo?: AssignedUser;
    replies?: TicketReply[];
    created_at: string;
    updated_at: string;
}

export interface TicketStatistics {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
    urgent: number;
    average_response_time: number | null;
    average_resolution_time: number | null;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginatedResponse<T> {
    current_page: number;
    data: T[];
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
}

export const STATUS_LABELS: Record<TicketStatus, string> = {
    open: 'Open',
    in_progress: 'In Progress',
    pending: 'Pending',
    resolved: 'Resolved',
    closed: 'Closed',
};

export const PRIORITY_LABELS: Record<TicketPriority, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    urgent: 'Urgent',
};

export const CATEGORY_LABELS: Record<TicketCategory, string> = {
    billing: 'Billing',
    technical: 'Technical',
    service: 'Service',
    complaint: 'Complaint',
    other: 'Other',
};
