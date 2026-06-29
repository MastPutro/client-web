import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head } from '@inertiajs/react';
import axios from 'axios';

interface Payment {
    invoice_id: number;
    customer_id: number;
    amount: number;
    payment_method: string;
    midtrans_id: string | null;
    proof_of_payment: string | null;
    status: string;
    created_at: string;
    updated_at: string;
}

function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(amount);
}

function formatDate(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
}

function formatDateTime(dateStr: string): string {
    return new Date(dateStr).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

function getStatusConfig(status: string) {
    switch (status) {
        case 'success':
            return {
                label: 'Berhasil',
                bg: 'bg-emerald-50',
                text: 'text-emerald-700',
                ring: 'ring-emerald-600/20',
                dot: 'bg-emerald-500',
                icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                ),
            };
        case 'pending':
            return {
                label: 'Menunggu',
                bg: 'bg-amber-50',
                text: 'text-amber-700',
                ring: 'ring-amber-600/20',
                dot: 'bg-amber-500',
                icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                ),
            };
        case 'failed':
            return {
                label: 'Gagal',
                bg: 'bg-red-50',
                text: 'text-red-700',
                ring: 'ring-red-600/20',
                dot: 'bg-red-500',
                icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                    </svg>
                ),
            };
        default:
            return {
                label: status,
                bg: 'bg-gray-50',
                text: 'text-gray-700',
                ring: 'ring-gray-600/20',
                dot: 'bg-gray-500',
                icon: (
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 5.25h.008v.008H12v-.008Z" />
                    </svg>
                ),
            };
    }
}

function getPaymentMethodLabel(method: string): string {
    const labels: Record<string, string> = {
        cash: 'Tunai',
        transfer: 'Transfer Bank',
        midtrans: 'Midtrans',
        qris: 'QRIS',
        ewallet: 'E-Wallet',
    };
    return labels[method] || method;
}

export default function PaymentHistory() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchPayments = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await axios.get('/billing/payment-history/data');
            if (response.data.success) {
                setPayments(response.data.data);
            } else {
                setError(response.data.message || 'Gagal memuat riwayat pembayaran');
            }
        } catch (err) {
            if (axios.isAxiosError(err) && err.response?.status === 404) {
                setError('Data tidak ditemukan');
            } else {
                setError('Gagal memuat riwayat pembayaran');
            }
            console.error('Payment history error:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, []);

    // Stats
    const totalPaid = payments
        .filter((p) => p.status === 'success')
        .reduce((sum, p) => sum + p.amount, 0);
    const totalTransactions = payments.length;
    const successCount = payments.filter((p) => p.status === 'success').length;

    return (
        <AuthenticatedLayout
            header={
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold leading-tight text-gray-800">
                        Riwayat Pembayaran
                    </h2>
                    <button
                        onClick={fetchPayments}
                        disabled={loading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 disabled:opacity-50"
                    >
                        <svg className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182M2.985 19.644l3.181-3.183" />
                        </svg>
                        Refresh
                    </button>
                </div>
            }
        >
            <Head title="Riwayat Pembayaran" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">

                    {/* Stats Cards */}
                    <div className="mb-6 grid gap-4 sm:grid-cols-3">
                        {/* Total Dibayar */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                            <div className="h-1 bg-emerald-500"></div>
                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
                                        <svg className="h-5 w-5 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Total Dibayar</p>
                                        <p className="text-lg font-bold text-gray-900">{formatCurrency(totalPaid)}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Total Transaksi */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                            <div className="h-1 bg-indigo-500"></div>
                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50">
                                        <svg className="h-5 w-5 text-indigo-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Total Transaksi</p>
                                        <p className="text-lg font-bold text-gray-900">{totalTransactions}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Berhasil */}
                        <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                            <div className="h-1 bg-sky-500"></div>
                            <div className="p-5">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-sky-50">
                                        <svg className="h-5 w-5 text-sky-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <p className="text-xs font-medium text-gray-500">Pembayaran Berhasil</p>
                                        <p className="text-lg font-bold text-gray-900">{successCount} <span className="text-sm font-normal text-gray-400">/ {totalTransactions}</span></p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Payment History Table */}
                    <div className="overflow-hidden rounded-xl bg-white shadow-sm ring-1 ring-gray-200">
                        <div className="border-b border-gray-200 px-6 py-4">
                            <h3 className="text-sm font-semibold text-gray-900">Daftar Pembayaran</h3>
                        </div>

                        {/* Loading */}
                        {loading && (
                            <div className="p-6">
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="animate-pulse">
                                            <div className="flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-lg bg-gray-200"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 w-1/3 rounded bg-gray-200"></div>
                                                    <div className="h-3 w-1/4 rounded bg-gray-200"></div>
                                                </div>
                                                <div className="h-6 w-20 rounded-full bg-gray-200"></div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {!loading && error && (
                            <div className="p-6">
                                <div className="flex flex-col items-center justify-center py-8 text-center">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
                                        <svg className="h-6 w-6 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z" />
                                        </svg>
                                    </div>
                                    <p className="mt-3 text-sm font-medium text-gray-900">{error}</p>
                                    <button
                                        onClick={fetchPayments}
                                        className="mt-3 text-sm font-medium text-indigo-600 hover:text-indigo-500 transition-colors"
                                    >
                                        Coba lagi →
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Empty */}
                        {!loading && !error && payments.length === 0 && (
                            <div className="p-6">
                                <div className="flex flex-col items-center justify-center py-12 text-center">
                                    <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
                                        <svg className="h-7 w-7 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                                        </svg>
                                    </div>
                                    <p className="mt-4 text-sm font-medium text-gray-900">Belum ada riwayat pembayaran</p>
                                    <p className="mt-1 text-xs text-gray-500">Riwayat pembayaran Anda akan muncul di sini.</p>
                                </div>
                            </div>
                        )}

                        {/* Payment List */}
                        {!loading && !error && payments.length > 0 && (
                            <div className="divide-y divide-gray-100">
                                {/* Desktop table header */}
                                <div className="hidden bg-gray-50 px-6 py-3 sm:grid sm:grid-cols-12 sm:gap-4">
                                    <div className="col-span-1 text-xs font-medium uppercase tracking-wider text-gray-500">Invoice</div>
                                    <div className="col-span-3 text-xs font-medium uppercase tracking-wider text-gray-500">Tanggal</div>
                                    <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500">Metode</div>
                                    <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500 text-right">Jumlah</div>
                                    <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500 text-center">Status</div>
                                    <div className="col-span-2 text-xs font-medium uppercase tracking-wider text-gray-500 text-center">Bukti</div>
                                </div>

                                {payments.map((payment, index) => {
                                    const statusConfig = getStatusConfig(payment.status);
                                    return (
                                        <div
                                            key={`${payment.invoice_id}-${index}`}
                                            className="px-6 py-4 transition-colors hover:bg-gray-50/50"
                                        >
                                            {/* Desktop layout */}
                                            <div className="hidden sm:grid sm:grid-cols-12 sm:items-center sm:gap-4">
                                                <div className="col-span-1">
                                                    <span className="text-sm font-semibold text-gray-900">#{payment.invoice_id}</span>
                                                </div>
                                                <div className="col-span-3">
                                                    <p className="text-sm text-gray-700">{formatDateTime(payment.created_at)}</p>
                                                </div>
                                                <div className="col-span-2">
                                                    <span className="inline-flex items-center gap-1.5 rounded-md bg-gray-50 px-2 py-1 text-xs font-medium text-gray-700 ring-1 ring-inset ring-gray-200">
                                                        {getPaymentMethodLabel(payment.payment_method)}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-right">
                                                    <span className="text-sm font-semibold text-gray-900">{formatCurrency(payment.amount)}</span>
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${statusConfig.bg} ${statusConfig.text} ${statusConfig.ring}`}>
                                                        {statusConfig.icon}
                                                        {statusConfig.label}
                                                    </span>
                                                </div>
                                                <div className="col-span-2 text-center">
                                                    {payment.proof_of_payment ? (
                                                        <span className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600">
                                                            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                                            </svg>
                                                            Ada
                                                        </span>
                                                    ) : (
                                                        <span className="text-xs text-gray-400">—</span>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Mobile layout */}
                                            <div className="sm:hidden">
                                                <div className="flex items-start justify-between">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${statusConfig.bg} ${statusConfig.text}`}>
                                                            {statusConfig.icon}
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-semibold text-gray-900">
                                                                Invoice #{payment.invoice_id}
                                                            </p>
                                                            <p className="mt-0.5 text-xs text-gray-500">
                                                                {formatDate(payment.created_at)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-sm font-bold text-gray-900">{formatCurrency(payment.amount)}</p>
                                                        <span className={`mt-1 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${statusConfig.bg} ${statusConfig.text} ${statusConfig.ring}`}>
                                                            {statusConfig.label}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className="mt-2 flex items-center gap-3 pl-[52px]">
                                                    <span className="inline-flex items-center gap-1 rounded-md bg-gray-50 px-2 py-0.5 text-[10px] font-medium text-gray-600 ring-1 ring-inset ring-gray-200">
                                                        {getPaymentMethodLabel(payment.payment_method)}
                                                    </span>
                                                    {payment.proof_of_payment && (
                                                        <span className="inline-flex items-center gap-1 text-[10px] font-medium text-indigo-600">
                                                            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0 0 22.5 18.75V5.25A2.25 2.25 0 0 0 20.25 3H3.75A2.25 2.25 0 0 0 1.5 5.25v13.5A2.25 2.25 0 0 0 3.75 21Z" />
                                                            </svg>
                                                            Bukti
                                                        </span>
                                                    )}
                                                    {payment.midtrans_id && (
                                                        <span className="text-[10px] text-gray-400">
                                                            ID: {payment.midtrans_id}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
