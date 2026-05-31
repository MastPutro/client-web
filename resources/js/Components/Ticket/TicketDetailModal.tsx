import React, { useState, useEffect, useRef, FormEvent } from 'react';
import Modal from '@/Components/Modal';
import PrimaryButton from '@/Components/PrimaryButton';
import TicketStatusBadge from '@/Components/Ticket/TicketStatusBadge';
import TicketPriorityBadge from '@/Components/Ticket/TicketPriorityBadge';
import { Ticket, TicketReply, CATEGORY_LABELS } from '@/types/ticket';
import axios from 'axios';
interface TicketDetailModalProps {
    show: boolean;
    ticketId: number | null;
    onClose: () => void;
}
const TicketDetailModal: React.FC<TicketDetailModalProps> = ({ show, ticketId, onClose }) => {
    const [ticket, setTicket] = useState<Ticket | null>(null);
    const [replies, setReplies] = useState<TicketReply[]>([]);
    const [loading, setLoading] = useState(false);
    const [replyMessage, setReplyMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [error, setError] = useState('');
    const chatEndRef = useRef<HTMLDivElement>(null);
    const scrollToBottom = () => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };
    const fetchTicketDetail = async () => {
        if (!ticketId) return;
        setLoading(true);
        setError('');
        try {
            const [ticketRes, repliesRes] = await Promise.all([
                axios.get(`/complaints/tickets/${ticketId}`),
                axios.get(`/complaints/tickets/${ticketId}/replies`),
            ]);
            if (ticketRes.data.success) {
                setTicket(ticketRes.data.data);
            }
            if (repliesRes.data.success) {
                const repliesData = repliesRes.data.data;
                setReplies(Array.isArray(repliesData) ? repliesData : (repliesData.data || []));
            }
        } catch (err) {
            setError('Gagal memuat detail tiket');
            console.error('Failed to load ticket:', err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        if (show && ticketId) {
            fetchTicketDetail();
        } else {
            setTicket(null);
            setReplies([]);
            setReplyMessage('');
            setError('');
        }
    }, [show, ticketId]);
    useEffect(() => {
        if (replies.length > 0) {
            setTimeout(scrollToBottom, 100);
        }
    }, [replies]);
    const handleSendReply = async (e: FormEvent) => {
        e.preventDefault();
        if (!replyMessage.trim() || !ticketId || sending) return;
        setSending(true);
        try {
            const response = await axios.post(`/complaints/tickets/${ticketId}/replies`, {
                message: replyMessage,
            });
            if (response.data.success) {
                setReplyMessage('');
                // Refresh replies
                const repliesRes = await axios.get(`/complaints/tickets/${ticketId}/replies`);
                if (repliesRes.data.success) {
                    const repliesData = repliesRes.data.data;
                    setReplies(Array.isArray(repliesData) ? repliesData : (repliesData.data || []));
                }
            }
        } catch (err) {
            console.error('Failed to send reply:', err);
        } finally {
            setSending(false);
        }
    };
    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };
    const formatRelativeTime = (dateStr: string) => {
        const now = new Date();
        const date = new Date(dateStr);
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);
        if (diffMins < 1) return 'baru saja';
        if (diffMins < 60) return `${diffMins} menit lalu`;
        if (diffHours < 24) return `${diffHours} jam lalu`;
        if (diffDays < 7) return `${diffDays} hari lalu`;
        return formatDate(dateStr);
    };
    return (
        <Modal show={show} onClose={onClose} maxWidth="2xl">
            <div className="flex h-[80vh] max-h-[700px] flex-col">
                {/* Header */}
                {ticket && (
                    <div className="flex-shrink-0 border-b border-gray-200 bg-gradient-to-r from-slate-50 to-gray-50 px-6 py-4">
                        <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="inline-flex items-center rounded-md bg-indigo-50 px-2 py-0.5 text-xs font-mono font-medium text-indigo-700 ring-1 ring-inset ring-indigo-200">
                                        {ticket.ticket_number}
                                    </span>
                                    <TicketStatusBadge status={ticket.status} />
                                    <TicketPriorityBadge priority={ticket.priority} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900 truncate">
                                    {ticket.title}
                                </h3>
                                <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-gray-500">
                                    <span className="inline-flex items-center gap-1">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
                                        </svg>
                                        {CATEGORY_LABELS[ticket.category]}
                                    </span>
                                    <span className="inline-flex items-center gap-1">
                                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {formatDate(ticket.created_at)}
                                    </span>
                                    {ticket.assignedTo && (
                                        <span className="inline-flex items-center gap-1">
                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                                            </svg>
                                            Agent: {ticket.assignedTo.name}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="ml-4 flex-shrink-0 rounded-lg p-1.5 text-gray-400 hover:bg-gray-200 hover:text-gray-600 transition-colors"
                            >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )}
                {/* Loading State */}
                {loading && (
                    <div className="flex flex-1 items-center justify-center">
                        <div className="text-center">
                            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
                            <p className="mt-3 text-sm text-gray-500">Memuat tiket...</p>
                        </div>
                    </div>
                )}
                {/* Error State */}
                {error && !loading && (
                    <div className="flex flex-1 items-center justify-center p-6">
                        <div className="text-center">
                            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
                                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                                </svg>
                            </div>
                            <p className="text-sm text-red-600">{error}</p>
                            <button
                                onClick={fetchTicketDetail}
                                className="mt-2 text-sm text-indigo-600 hover:text-indigo-800 underline"
                            >
                                Coba lagi
                            </button>
                        </div>
                    </div>
                )}
                {/* Chat / Conversation Area */}
                {ticket && !loading && (
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                        {/* Original Description as first message */}
                        <div className="flex justify-end">
                            <div className="max-w-[80%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-indigo-500 to-indigo-600 px-4 py-3 text-white shadow-sm">
                                <p className="text-sm whitespace-pre-wrap">{ticket.description}</p>
                                <p className="mt-1.5 text-right text-[10px] text-indigo-200">
                                    {formatRelativeTime(ticket.created_at)}
                                </p>
                            </div>
                        </div>
                        {/* Replies */}
                        {replies.map((reply) => {
                            const isCustomer = !reply.is_internal && reply.user_id === ticket.customer_id;
                            return (
                                <div
                                    key={reply.id}
                                    className={`flex ${isCustomer ? 'justify-end' : 'justify-start'}`}
                                >
                                    {!isCustomer && (
                                        <div className="mr-2 flex-shrink-0">
                                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 text-white text-xs font-bold shadow-sm">
                                                {reply.user?.name?.charAt(0)?.toUpperCase() || 'A'}
                                            </div>
                                        </div>
                                    )}
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                                            isCustomer
                                                ? 'rounded-tr-sm bg-gradient-to-br from-indigo-500 to-indigo-600 text-white'
                                                : 'rounded-tl-sm bg-white text-gray-800 border border-gray-100'
                                        }`}
                                    >
                                        {!isCustomer && reply.user && (
                                            <p className="mb-1 text-xs font-semibold text-emerald-600">
                                                {reply.user.name} • CS Agent
                                            </p>
                                        )}
                                        <p className="text-sm whitespace-pre-wrap">{reply.message}</p>
                                        <p className={`mt-1.5 text-right text-[10px] ${
                                            isCustomer ? 'text-indigo-200' : 'text-gray-400'
                                        }`}>
                                            {formatRelativeTime(reply.created_at)}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                        {/* Resolution Notes */}
                        {ticket.resolution_notes && (
                            <div className="flex justify-center">
                                <div className="rounded-xl bg-emerald-50 border border-emerald-200 px-4 py-2 text-center max-w-[80%]">
                                    <p className="text-xs font-medium text-emerald-700 mb-1">✓ Catatan Penyelesaian</p>
                                    <p className="text-sm text-emerald-600">{ticket.resolution_notes}</p>
                                </div>
                            </div>
                        )}
                        {/* Empty replies state */}
                        {replies.length === 0 && (
                            <div className="flex justify-center py-4">
                                <p className="rounded-full bg-gray-100 px-4 py-1.5 text-xs text-gray-500">
                                    Belum ada balasan — Tim CS akan segera merespons
                                </p>
                            </div>
                        )}
                        <div ref={chatEndRef} />
                    </div>
                )}
                {/* Reply Input */}
                {ticket && !loading && ticket.status !== 'closed' && (
                    <form onSubmit={handleSendReply} className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
                        <div className="flex gap-3">
                            <div className="flex-1 relative">
                                <textarea
                                    id="reply-input"
                                    value={replyMessage}
                                    onChange={(e) => setReplyMessage(e.target.value)}
                                    placeholder="Ketik pesan balasan..."
                                    rows={2}
                                    disabled={sending}
                                    className="block w-full resize-none rounded-xl border-gray-200 bg-gray-50 py-3 px-4 text-sm shadow-sm focus:border-indigo-400 focus:bg-white focus:ring-indigo-400 transition-colors placeholder:text-gray-400"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendReply(e);
                                        }
                                    }}
                                />
                            </div>
                            <div className="flex-shrink-0 self-end">
                                <PrimaryButton
                                    type="submit"
                                    disabled={!replyMessage.trim() || sending}
                                    className="!rounded-xl !px-4 !py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700"
                                >
                                    {sending ? (
                                        <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                                        </svg>
                                    )}
                                </PrimaryButton>
                            </div>
                        </div>
                        <p className="mt-1.5 text-[10px] text-gray-400 pl-1">
                            Tekan Enter untuk mengirim • Shift+Enter untuk baris baru
                        </p>
                    </form>
                )}
                {/* Closed ticket notice */}
                {ticket && ticket.status === 'closed' && (
                    <div className="flex-shrink-0 border-t border-gray-200 bg-gray-50 px-6 py-3 text-center">
                        <p className="text-sm text-gray-500">
                            🔒 Tiket ini sudah ditutup. Buat tiket baru jika Anda memerlukan bantuan lebih lanjut.
                        </p>
                    </div>
                )}
            </div>
        </Modal>
    );
};
export default TicketDetailModal;