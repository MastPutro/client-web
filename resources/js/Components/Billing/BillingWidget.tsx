import React, { useEffect, useState } from 'react';
import axios from 'axios';

interface Invoice {
    id: number;
    amount: number;
    status: 'pending' | 'paid' | 'overdue';
    payment_method: string | null;
    due_date: string;
    paid_date: string | null;
    is_overdue: boolean;
}

interface CustomerBilling {
    id: number;
    name: string;
    phone_number: string | null;
    package_name: string;
    package_price: string;
    invoice: Invoice | null;
}

interface BillingPolicy {
    due_date: number;
    send_bill_to_whatsapp: boolean;
}

interface BillingData {
    customer: CustomerBilling | null;
    billing_policy: BillingPolicy | null;
    current_month: number;
    current_year: number;
    payment_base_url: string;
}

const MONTH_NAMES = [
    '', 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    const d = new Date(dateStr);
    return d.toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function getDaysRemaining(dueDate: string): number {
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

const BillingWidget: React.FC = () => {
    const [data, setData] = useState<BillingData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchBillingData = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/billing/data');
            if (response.data.success) {
                setData(response.data.data);
            } else {
                setError(response.data.message || 'Gagal memuat data tagihan');
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setError('Data pelanggan tidak ditemukan');
            } else {
                setError('Gagal memuat data tagihan');
            }
            console.error('Billing widget error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBillingData();
    }, []);

    // Loading skeleton
    if (loading) {
        return (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                <div className="animate-pulse p-5">
                    <div className="mb-4 h-5 w-36 rounded bg-gray-200"></div>
                    <div className="space-y-3">
                        <div className="h-4 w-full rounded bg-gray-200"></div>
                        <div className="h-4 w-3/4 rounded bg-gray-200"></div>
                        <div className="h-10 w-full rounded bg-gray-200"></div>
                    </div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-red-200">
                <div className="p-5">
                    <div className="flex items-center gap-2 text-red-600">
                        <svg className="h-5 w-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                        </svg>
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                    <button
                        onClick={fetchBillingData}
                        className="mt-3 text-xs font-medium text-red-600 hover:text-red-800 transition-colors"
                    >
                        Coba lagi →
                    </button>
                </div>
            </div>
        );
    }

    // No customer data found
    if (!data || !data.customer) {
        return (
            <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                <div className="p-5">
                    <div className="flex items-center gap-2 text-gray-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                        </svg>
                        <p className="text-sm font-medium text-gray-500">Data tagihan tidak tersedia</p>
                    </div>
                </div>
            </div>
        );
    }

    const { customer, billing_policy, current_month, current_year } = data;
    const invoice = customer.invoice;
    const periodLabel = `${MONTH_NAMES[current_month] || ''} ${current_year}`;

    // Determine status display
    let statusColor = 'gray';
    let statusLabel = 'Belum ada tagihan';
    let statusIcon = '—';

    if (invoice) {
        if (invoice.status === 'paid') {
            statusColor = 'emerald';
            statusLabel = 'Lunas';
            statusIcon = '✓';
        } else if (invoice.is_overdue) {
            statusColor = 'red';
            statusLabel = 'Jatuh Tempo';
            statusIcon = '!';
        } else {
            statusColor = 'amber';
            statusLabel = 'Belum Dibayar';
            statusIcon = '•';
        }
    }

    const statusStyles: Record<string, { bg: string; text: string; ring: string; badge: string; badgeText: string; accent: string }> = {
        emerald: {
            bg: 'bg-emerald-50',
            text: 'text-emerald-700',
            ring: 'ring-emerald-200',
            badge: 'bg-emerald-100',
            badgeText: 'text-emerald-700',
            accent: 'bg-emerald-500',
        },
        amber: {
            bg: 'bg-amber-50',
            text: 'text-amber-700',
            ring: 'ring-amber-200',
            badge: 'bg-amber-100',
            badgeText: 'text-amber-700',
            accent: 'bg-amber-500',
        },
        red: {
            bg: 'bg-red-50',
            text: 'text-red-700',
            ring: 'ring-red-200',
            badge: 'bg-red-100',
            badgeText: 'text-red-700',
            accent: 'bg-red-500',
        },
        gray: {
            bg: 'bg-gray-50',
            text: 'text-gray-500',
            ring: 'ring-gray-200',
            badge: 'bg-gray-100',
            badgeText: 'text-gray-500',
            accent: 'bg-gray-400',
        },
    };

    const style = statusStyles[statusColor];

    return (
        <div className={`overflow-hidden rounded-xl bg-white shadow-sm ring-1 ${style.ring} transition-all hover:shadow-md`}>
            {/* Header accent bar */}
            <div className={`h-1 ${style.accent}`}></div>

            <div className="p-5">
                {/* Header */}
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 flex items-center gap-2">
                            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>
                            Tagihan
                        </h3>
                        <p className="mt-0.5 text-xs text-gray-400">Periode {periodLabel}</p>
                    </div>

                    {/* Status badge */}
                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${style.badge} ${style.badgeText}`}>
                        <span className="text-[10px]">{statusIcon}</span>
                        {statusLabel}
                    </span>
                </div>

                {/* Main content */}
                {invoice ? (
                    <div className="mt-4 space-y-4">
                        {/* Amount */}
                        <div className={`rounded-lg p-4 ${style.bg}`}>
                            <p className="text-xs font-medium text-gray-500">Total Tagihan</p>
                            <p className={`mt-1 text-2xl font-bold ${style.text}`}>
                                {formatCurrency(invoice.amount)}
                            </p>
                        </div>
                        

                        {/* Details grid */}
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <p className="text-xs text-gray-400">Paket</p>
                                <p className="mt-0.5 font-medium text-gray-700">{customer.package_name}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Harga Paket</p>
                                <p className="mt-0.5 font-medium text-gray-700">{formatCurrency(parseFloat(customer.package_price))}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Jatuh Tempo</p>
                                <p className="mt-0.5 font-medium text-gray-700">{formatDate(invoice.due_date)}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-400">Sisa Waktu</p>
                                {(() => {
                                    if (invoice.status === 'paid') {
                                        return <p className="mt-0.5 font-medium text-emerald-600">Sudah dibayar</p>;
                                    }
                                    const days = getDaysRemaining(invoice.due_date);
                                    if (days < 0) {
                                        return <p className="mt-0.5 font-medium text-red-600">Lewat {Math.abs(days)} hari</p>;
                                    }
                                    if (days === 0) {
                                        return <p className="mt-0.5 font-medium text-amber-600">Hari ini</p>;
                                    }
                                    return <p className={`mt-0.5 font-medium ${days <= 3 ? 'text-amber-600' : 'text-gray-700'}`}>{days} hari lagi</p>;
                                })()}
                            </div>
                        </div>

                        {/* Payment info (if paid) */}
                        {invoice.status === 'paid' && invoice.paid_date && (
                            <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                                <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                    <p className="text-xs text-emerald-700">
                                        Dibayar pada {formatDate(invoice.paid_date)}
                                        {invoice.payment_method && ` via ${invoice.payment_method}`}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Overdue warning */}
                        {invoice.is_overdue && (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3">
                                <div className="flex items-center gap-2">
                                    <svg className="h-4 w-4 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                    </svg>
                                    <p className="text-xs font-medium text-red-700">
                                        Tagihan sudah melewati jatuh tempo. Segera lakukan pembayaran.
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Pay Now button */}
                        {invoice.status !== 'paid' && (
                            <a
                                href={`${data.payment_base_url}/${invoice.id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-indigo-500 hover:shadow-md active:bg-indigo-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                            >
                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 0 0 2.25-2.25V6.75A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25v10.5A2.25 2.25 0 0 0 4.5 19.5Z" />
                                </svg>
                                Bayar Sekarang
                            </a>
                        )}
                    </div>
                ) : (
                    /* No invoice for this period */
                    <div className="mt-4">
                        <div className="rounded-lg bg-gray-50 p-4 text-center">
                            <p className="text-sm text-gray-500">Belum ada tagihan untuk periode ini</p>
                            <div className="mt-2 grid grid-cols-2 gap-3 text-sm">
                                <div>
                                    <p className="text-xs text-gray-400">Paket</p>
                                    <p className="mt-0.5 font-medium text-gray-700">{customer.package_name}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-gray-400">Harga Paket</p>
                                    <p className="mt-0.5 font-medium text-gray-700">{formatCurrency(parseFloat(customer.package_price))}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Refresh button */}
                <div className="mt-4 flex justify-end">
                    <button
                        onClick={fetchBillingData}
                        disabled={loading}
                        className="inline-flex items-center gap-1 text-xs text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-50"
                        title="Refresh data tagihan"
                    >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                        </svg>
                        Perbarui
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BillingWidget;
