import React, { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import TicketStatusBadge from '@/Components/Ticket/TicketStatusBadge';
import TicketPriorityBadge from '@/Components/Ticket/TicketPriorityBadge';
import CreateTicketModal from '@/Components/Ticket/CreateTicketModal';
import TicketDetailModal from '@/Components/Ticket/TicketDetailModal';
import {
    Ticket,
    TicketStatus,
    TicketPriority,
    PaginatedResponse,
    CATEGORY_LABELS,
} from '@/types/ticket';
import axios from 'axios';

interface StatsData {
    total: number;
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
}

export default function ComplaintIndex() {
    // Data state
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [pagination, setPagination] = useState<Omit<PaginatedResponse<Ticket>, 'data'> | null>(null);
    const [stats, setStats] = useState<StatsData>({ total: 0, open: 0, in_progress: 0, resolved: 0, closed: 0 });
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);

    // Filter state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<TicketStatus | ''>('');
    const [priorityFilter, setPriorityFilter] = useState<TicketPriority | ''>('');
    const [currentPage, setCurrentPage] = useState(1);

    // Modal state
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedTicketId, setSelectedTicketId] = useState<number | null>(null);

    // Debounced search
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchTickets = useCallback(async () => {
        setLoading(true);
        try {
            const params: Record<string, string | number> = {
                page: currentPage,
                per_page: 10,
            };
            if (debouncedSearch) params.search = debouncedSearch;
            if (statusFilter) params.status = statusFilter;
            if (priorityFilter) params.priority = priorityFilter;

            const response = await axios.get('/complaints/tickets', { params });

            if (response.data.success) {
                const paginatedData = response.data.data as PaginatedResponse<Ticket>;
                setTickets(paginatedData.data || []);
                const { data: _d, ...rest } = paginatedData;
                setPagination(rest);
            } else {
                setTickets([]);
            }
        } catch (err) {
            console.error('Failed to fetch tickets:', err);
            setTickets([]);
        } finally {
            setLoading(false);
        }
    }, [currentPage, debouncedSearch, statusFilter, priorityFilter]);

    const fetchStats = useCallback(async () => {
        setStatsLoading(true);
        try {
            const response = await axios.get('/complaints/tickets/stats');
            if (response.data.success) {
                setStats(response.data.data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        } finally {
            setStatsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    // Reset to page 1 when filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearch, statusFilter, priorityFilter]);

    const handleCreateSuccess = () => {
        fetchTickets();
        fetchStats();
    };

    const handleViewDetail = (ticketId: number) => {
        setSelectedTicketId(ticketId);
        setShowDetailModal(true);
    };

    const formatRelativeTime = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'baru saja';
        if (diffMins < 60) return `${diffMins}m lalu`;
        if (diffHours < 24) return `${diffHours}j lalu`;
        if (diffDays < 30) return `${diffDays}h lalu`;
        return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
    };

    const statsCards = [
        {
            label: 'Total Tiket',
            value: stats.total,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                </svg>
            ),
            gradient: 'from-slate-600 to-slate-800',
            textColor: 'text-white',
        },
        {
            label: 'Open',
            value: stats.open,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 13.5h3.86a2.25 2.25 0 012.012 1.244l.256.512a2.25 2.25 0 002.013 1.244h3.218a2.25 2.25 0 002.013-1.244l.256-.512a2.25 2.25 0 012.013-1.244h3.859m-19.5.338V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18v-4.162c0-.224-.034-.447-.1-.661L19.24 5.338a2.25 2.25 0 00-2.15-1.588H6.911a2.25 2.25 0 00-2.15 1.588L2.35 13.177a2.25 2.25 0 00-.1.661z" />
                </svg>
            ),
            gradient: 'from-blue-500 to-blue-700',
            textColor: 'text-white',
        },
        {
            label: 'In Progress',
            value: stats.in_progress,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                </svg>
            ),
            gradient: 'from-amber-500 to-orange-600',
            textColor: 'text-white',
        },
        {
            label: 'Resolved',
            value: stats.resolved,
            icon: (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            ),
            gradient: 'from-emerald-500 to-teal-600',
            textColor: 'text-white',
        },
    ];

    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Customer Service
                </h2>
            }
        >
            <Head title="Customer Service" />

            <div className="py-8">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

                    {/* Hero Section */}
                    <div className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 sm:p-8 shadow-xl relative">
                        {/* Decorative elements */}
                        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-40 w-40 rounded-full bg-white/5 blur-2xl" />
                        <div className="absolute bottom-0 left-0 -mb-8 -ml-8 h-32 w-32 rounded-full bg-purple-400/10 blur-xl" />

                        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-sm">
                                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                                        </svg>
                                    </span>
                                    Help Desk
                                </h1>
                                <p className="mt-2 text-indigo-200 text-sm sm:text-base max-w-lg">
                                    Sampaikan keluhan atau permintaan bantuan Anda. Tim Customer Service kami siap membantu.
                                </p>
                            </div>
                            <button
                                id="btn-create-ticket"
                                onClick={() => setShowCreateModal(true)}
                                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 shadow-lg transition-all duration-200 hover:bg-indigo-50 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] flex-shrink-0"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                </svg>
                                Buat Tiket Baru
                            </button>
                        </div>
                    </div>

                    {/* Stats Cards */}
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
                        {statsCards.map((card, index) => (
                            <div
                                key={card.label}
                                className={`overflow-hidden rounded-xl bg-gradient-to-br ${card.gradient} p-5 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02]`}
                                style={{ animationDelay: `${index * 100}ms` }}
                            >
                                {statsLoading ? (
                                    <div className="animate-pulse">
                                        <div className="h-4 w-16 rounded bg-white/20 mb-3" />
                                        <div className="h-8 w-12 rounded bg-white/20" />
                                    </div>
                                ) : (
                                    <>
                                        <div className="flex items-center justify-between mb-2">
                                            <p className={`text-xs font-medium ${card.textColor} opacity-80`}>
                                                {card.label}
                                            </p>
                                            <div className={`${card.textColor} opacity-60`}>
                                                {card.icon}
                                            </div>
                                        </div>
                                        <p className={`text-3xl font-bold ${card.textColor}`}>
                                            {card.value}
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>

                    {/* Filters & Search */}
                    <div className="mb-6 rounded-xl bg-white p-4 shadow-sm border border-gray-100">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                            {/* Search */}
                            <div className="relative flex-1">
                                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                                    </svg>
                                </div>
                                <input
                                    id="search-tickets"
                                    type="text"
                                    value={search}
                                    onChange={(e) => setSearch(e.target.value)}
                                    placeholder="Cari tiket berdasarkan nomor atau judul..."
                                    className="block w-full rounded-lg border-gray-200 bg-gray-50 py-2.5 pl-10 pr-4 text-sm shadow-sm focus:border-indigo-400 focus:bg-white focus:ring-indigo-400 transition-colors"
                                />
                            </div>

                            {/* Status Filter */}
                            <select
                                id="filter-status"
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as TicketStatus | '')}
                                className="rounded-lg border-gray-200 bg-gray-50 py-2.5 px-3 text-sm shadow-sm focus:border-indigo-400 focus:ring-indigo-400"
                            >
                                <option value="">Semua Status</option>
                                <option value="open">Open</option>
                                <option value="in_progress">In Progress</option>
                                <option value="pending">Pending</option>
                                <option value="resolved">Resolved</option>
                                <option value="closed">Closed</option>
                            </select>

                            {/* Priority Filter */}
                            <select
                                id="filter-priority"
                                value={priorityFilter}
                                onChange={(e) => setPriorityFilter(e.target.value as TicketPriority | '')}
                                className="rounded-lg border-gray-200 bg-gray-50 py-2.5 px-3 text-sm shadow-sm focus:border-indigo-400 focus:ring-indigo-400"
                            >
                                <option value="">Semua Prioritas</option>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>

                            {/* Refresh */}
                            <button
                                id="btn-refresh"
                                onClick={() => { fetchTickets(); fetchStats(); }}
                                className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm font-medium text-gray-600 shadow-sm hover:bg-gray-50 transition-colors"
                                title="Refresh"
                            >
                                <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                                </svg>
                            </button>
                        </div>
                    </div>

                    {/* Ticket List */}
                    <div className="rounded-xl bg-white shadow-sm border border-gray-100 overflow-hidden">
                        {/* Loading skeleton */}
                        {loading && (
                            <div className="divide-y divide-gray-100">
                                {[...Array(5)].map((_, i) => (
                                    <div key={i} className="p-5 animate-pulse">
                                        <div className="flex items-center gap-4">
                                            <div className="flex-1">
                                                <div className="h-4 w-24 rounded bg-gray-200 mb-2" />
                                                <div className="h-5 w-64 rounded bg-gray-200 mb-2" />
                                                <div className="flex gap-2">
                                                    <div className="h-5 w-16 rounded-full bg-gray-200" />
                                                    <div className="h-5 w-16 rounded-full bg-gray-200" />
                                                </div>
                                            </div>
                                            <div className="h-8 w-20 rounded bg-gray-200" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Empty State */}
                        {!loading && tickets.length === 0 && (
                            <div className="py-16 text-center">
                                <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-100 to-purple-100">
                                    <svg className="h-10 w-10 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                                    </svg>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800">
                                    {debouncedSearch || statusFilter || priorityFilter
                                        ? 'Tidak ada tiket yang cocok'
                                        : 'Belum ada tiket'}
                                </h3>
                                <p className="mt-1 text-sm text-gray-500 max-w-sm mx-auto">
                                    {debouncedSearch || statusFilter || priorityFilter
                                        ? 'Coba ubah filter pencarian Anda'
                                        : 'Buat tiket pertama Anda untuk menyampaikan keluhan atau permintaan bantuan.'}
                                </p>
                                {!debouncedSearch && !statusFilter && !priorityFilter && (
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="mt-4 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-md hover:from-indigo-700 hover:to-purple-700 transition-all"
                                    >
                                        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                                        </svg>
                                        Buat Tiket Pertama
                                    </button>
                                )}
                            </div>
                        )}

                        {/* Ticket Items */}
                        {!loading && tickets.length > 0 && (
                            <div className="divide-y divide-gray-100">
                                {tickets.map((ticket) => (
                                    <div
                                        key={ticket.id}
                                        id={`ticket-${ticket.id}`}
                                        className="group flex items-start gap-4 p-5 transition-colors hover:bg-gray-50/80 cursor-pointer"
                                        onClick={() => handleViewDetail(ticket.id)}
                                    >
                                        {/* Ticket Icon */}
                                        <div className="flex-shrink-0 hidden sm:block">
                                            <div className={`flex h-10 w-10 items-center justify-center rounded-xl transition-transform group-hover:scale-110 ${
                                                ticket.status === 'open' ? 'bg-blue-100 text-blue-600' :
                                                ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-600' :
                                                ticket.status === 'resolved' ? 'bg-emerald-100 text-emerald-600' :
                                                ticket.status === 'closed' ? 'bg-slate-100 text-slate-500' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>
                                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
                                                </svg>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-xs font-mono font-medium text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                                    {ticket.ticket_number}
                                                </span>
                                                <span className="text-xs text-gray-400">
                                                    {formatRelativeTime(ticket.created_at)}
                                                </span>
                                            </div>
                                            <h4 className="text-sm font-semibold text-gray-900 truncate group-hover:text-indigo-700 transition-colors">
                                                {ticket.title}
                                            </h4>
                                            <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
                                                {ticket.description}
                                            </p>
                                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                                <TicketStatusBadge status={ticket.status} />
                                                <TicketPriorityBadge priority={ticket.priority} />
                                                <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 border border-gray-200">
                                                    {CATEGORY_LABELS[ticket.category]}
                                                </span>
                                                {ticket.replies && ticket.replies.length > 0 && (
                                                    <span className="inline-flex items-center gap-1 text-xs text-gray-400">
                                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
                                                        </svg>
                                                        {ticket.replies.length}
                                                    </span>
                                                )}
                                            </div>
                                        </div>

                                        {/* Arrow */}
                                        <div className="flex-shrink-0 self-center">
                                            <svg className="h-5 w-5 text-gray-300 group-hover:text-indigo-500 transition-colors" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                                            </svg>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Pagination */}
                        {!loading && pagination && pagination.last_page > 1 && (
                            <div className="flex items-center justify-between border-t border-gray-100 px-5 py-4 bg-gray-50/50">
                                <p className="text-xs text-gray-500">
                                    Menampilkan {pagination.from}–{pagination.to} dari {pagination.total} tiket
                                </p>
                                <div className="flex gap-1">
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        ← Prev
                                    </button>
                                    {Array.from({ length: pagination.last_page }, (_, i) => i + 1)
                                        .filter((page) => {
                                            if (pagination.last_page <= 7) return true;
                                            if (page === 1 || page === pagination.last_page) return true;
                                            if (Math.abs(page - currentPage) <= 1) return true;
                                            return false;
                                        })
                                        .map((page, index, arr) => {
                                            const showEllipsis = index > 0 && page - arr[index - 1] > 1;
                                            return (
                                                <React.Fragment key={page}>
                                                    {showEllipsis && (
                                                        <span className="px-2 py-1.5 text-xs text-gray-400">…</span>
                                                    )}
                                                    <button
                                                        onClick={() => setCurrentPage(page)}
                                                        className={`min-w-[32px] rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                                                            page === currentPage
                                                                ? 'bg-indigo-600 text-white shadow-sm'
                                                                : 'border border-gray-200 bg-white text-gray-600 hover:bg-gray-50'
                                                        }`}
                                                    >
                                                        {page}
                                                    </button>
                                                </React.Fragment>
                                            );
                                        })}
                                    <button
                                        onClick={() => setCurrentPage((p) => Math.min(pagination.last_page, p + 1))}
                                        disabled={currentPage === pagination.last_page}
                                        className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-600 shadow-sm hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next →
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <CreateTicketModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSuccess={handleCreateSuccess}
            />
            {/* <TicketDetailModal
                show={showDetailModal}
                ticketId={selectedTicketId}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedTicketId(null);
                }}
            /> */}
        </AuthenticatedLayout>
    );
}