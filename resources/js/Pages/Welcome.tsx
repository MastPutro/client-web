import { PageProps } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { useState } from 'react';

export default function Welcome({
    auth,
}: PageProps<{ laravelVersion: string; phpVersion: string }>) {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const [activePlan, setActivePlan] = useState(1);

    const plans = [
        {
            name: 'Basic',
            speed: '10 Mbps',
            price: '100.000',
            features: ['10 Mbps Download', '10 Mbps Upload', 'Unlimited Kuota', 'Dukungan via Chat', 'FUP 1 TB/bulan'],
            popular: false,
            gradient: 'from-slate-600 to-slate-800',
            accent: 'text-slate-400',
        },
        {
            name: 'Standard',
            speed: '25 Mbps',
            price: '150.000',
            features: ['25 Mbps Download', '25 Mbps Upload', 'Unlimited Kuota', 'Prioritas Support', 'FUP 2 TB/bulan', 'Free Router'],
            popular: true,
            gradient: 'from-indigo-600 to-purple-700',
            accent: 'text-indigo-300',
        },
        {
            name: 'Premium',
            speed: '50 Mbps',
            price: '250.000',
            features: ['50 Mbps Download', '50 Mbps Upload', 'Unlimited Kuota', 'Support 24/7', 'Tanpa FUP', 'Free Router', 'Static IP'],
            popular: false,
            gradient: 'from-amber-600 to-orange-700',
            accent: 'text-amber-300',
        },
    ];

    const features = [
        {
            icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
            ),
            title: 'Kecepatan Tinggi',
            desc: 'Koneksi fiber optik hingga 50 Mbps, streaming & gaming tanpa buffering.',
        },
        {
            icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                </svg>
            ),
            title: 'Stabil 24/7',
            desc: 'Uptime 99.9% dengan backup jalur redundan. Internet Anda tidak pernah mati.',
        },
        {
            icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
                </svg>
            ),
            title: 'Harga Terjangkau',
            desc: 'Mulai dari Rp 100.000/bulan. Internet cepat tidak harus mahal.',
        },
        {
            icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
                </svg>
            ),
            title: 'Aman & Terproteksi',
            desc: 'Dilengkapi firewall dan anti-DDoS untuk keamanan jaringan Anda.',
        },
        {
            icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 01-.825-.242m9.345-8.334a2.126 2.126 0 00-.476-.095 48.64 48.64 0 00-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0011.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155" />
                </svg>
            ),
            title: 'Support Responsif',
            desc: 'Tim CS siap membantu via chat & telepon. Masalah ditangani kurang dari 24 jam.',
        },
        {
            icon: (
                <svg className="h-7 w-7" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.42 15.17l-5.1-5.1m0 0L11.42 4.97m-5.1 5.1H20.25m-4.83 5.1l5.1-5.1m0 0l-5.1-5.1m5.1 5.1H3.75" />
                </svg>
            ),
            title: 'Tanpa Kontrak',
            desc: 'Bebas berlangganan tanpa ikatan kontrak. Berhenti kapan saja.',
        },
    ];

    const faqs = [
        {
            q: 'Berapa biaya pemasangan?',
            a: 'Biaya pemasangan mulai dari Rp 200.000 sudah termasuk ONT/Router dan kabel fiber optik. Promo gratis pemasangan berlaku untuk periode tertentu.',
        },
        {
            q: 'Berapa lama proses pemasangan?',
            a: 'Proses pemasangan membutuhkan waktu 1-3 hari kerja setelah survei lokasi. Survei dilakukan dalam 24 jam setelah pendaftaran.',
        },
        {
            q: 'Apakah kuota benar-benar unlimited?',
            a: 'Ya, semua paket kami unlimited tanpa kuota harian. Namun pada paket Basic dan Standard, terdapat kebijakan Fair Usage Policy (FUP) untuk menjaga kualitas layanan.',
        },
        {
            q: 'Area mana saja yang sudah tercover?',
            a: 'Saat ini kami sudah melayani wilayah Bangun Kecamatan Pungging, Mojokerto dan sekitarnya. Cek ketersediaan di area Anda dengan menghubungi CS kami.',
        },
        {
            q: 'Bagaimana cara pembayaran?',
            a: 'Pembayaran bisa dilakukan melalui transfer bank, QRIS, atau e-wallet (GoPay, OVO, DANA). Pembayaran otomatis bisa diatur melalui dashboard pelanggan.',
        },
    ];

    return (
        <>
            <Head title="SENTOLOP.NET — WiFi Cepat & Murah" />

            <div className="min-h-screen bg-[#0a0a1a] text-white overflow-x-hidden">
                {/* ======== NAVBAR ======== */}
                <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-xl bg-[#0a0a1a]/80 border-b border-white/5">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="flex h-16 items-center justify-between">
                            <div className="flex items-center gap-2">
                                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-lg shadow-indigo-500/30">
                                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                                    </svg>
                                </div>
                                <span className="text-lg font-bold tracking-tight">
                                    SENTOLOP<span className="text-indigo-400">.NET</span>
                                </span>
                            </div>

                            <div className="hidden sm:flex items-center gap-6 text-sm text-gray-400">
                                <a href="#features" className="hover:text-white transition-colors">Fitur</a>
                                <a href="#pricing" className="hover:text-white transition-colors">Harga</a>
                                <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
                            </div>

                            <div className="flex items-center gap-3">
                                {auth.user ? (
                                    <Link
                                        href={route('dashboard')}
                                        className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]"
                                    >
                                        Dashboard
                                    </Link>
                                ) : (
                                    <>
                                        <Link
                                            href={route('login')}
                                            className="rounded-lg px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:text-white"
                                        >
                                            Masuk
                                        </Link>
                                        <Link
                                            href={route('register')}
                                            className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-2 text-sm font-medium text-white shadow-lg shadow-indigo-500/25 transition-all hover:shadow-indigo-500/40 hover:scale-[1.02]"
                                        >
                                            Daftar
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </nav>

                {/* ======== HERO SECTION ======== */}
                <section className="relative min-h-screen flex items-center justify-center pt-16 overflow-hidden">
                    {/* Animated background orbs */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute -top-40 -left-40 h-96 w-96 rounded-full bg-indigo-600/20 blur-[128px] animate-pulse" />
                        <div className="absolute top-1/3 -right-40 h-80 w-80 rounded-full bg-purple-600/20 blur-[128px] animate-pulse" style={{ animationDelay: '2s' }} />
                        <div className="absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-cyan-500/10 blur-[128px] animate-pulse" style={{ animationDelay: '4s' }} />
                    </div>

                    {/* Grid pattern overlay */}
                    <div className="absolute inset-0 opacity-[0.03]" style={{
                        backgroundImage: 'linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }} />

                    <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
                        {/* Badge */}
                        <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/10 px-4 py-1.5 text-sm text-indigo-300 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                            </span>
                            Internet Fiber Optik Terjangkau
                        </div>

                        {/* Title */}
                        <h1 className="text-5xl sm:text-6xl lg:text-8xl font-black tracking-tight leading-none">
                            <span className="bg-gradient-to-r from-white via-white to-gray-400 bg-clip-text text-transparent">
                                SENTOLOP
                            </span>
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                .NET
                            </span>
                        </h1>

                        {/* Subtitle */}
                        <p className="mt-6 text-xl sm:text-2xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
                            WiFi murah mulai dari{' '}
                            <span className="font-bold text-white bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                100rb-an
                            </span>{' '}
                            per bulan. Internet cepat, stabil, dan tanpa ribet.
                        </p>

                        {/* CTA Buttons */}
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="#pricing"
                                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 hover:scale-[1.03] active:scale-[0.98]"
                            >
                                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 blur-xl transition-opacity group-hover:opacity-50" />
                                <span className="relative">Lihat Paket</span>
                                <svg className="relative h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                            <a
                                href="https://wa.me/6287780279431"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white hover:border-white/20"
                            >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                </svg>
                                Hubungi Kami
                            </a>
                        </div>

                        {/* Stats */}
                        <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
                            {[
                                { value: '50+', label: 'Pelanggan Aktif' },
                                { value: '99.9%', label: 'Uptime' },
                                { value: '<24jam', label: 'Response Time' },
                            ].map((stat) => (
                                <div key={stat.label} className="text-center">
                                    <p className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                                        {stat.value}
                                    </p>
                                    <p className="mt-1 text-xs text-gray-500">{stat.label}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
                        <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                        </svg>
                    </div>
                </section>

                {/* ======== FEATURES SECTION ======== */}
                <section id="features" className="relative py-24 sm:py-32">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <p className="text-sm font-medium uppercase tracking-widest text-indigo-400 mb-3">Mengapa Memilih Kami</p>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                Internet Tanpa <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Kompromi</span>
                            </h2>
                            <p className="mt-4 text-gray-500 max-w-2xl mx-auto">
                                Nikmati koneksi internet fiber optik yang cepat, stabil, dan terjangkau untuk kebutuhan streaming, gaming, dan bekerja dari rumah.
                            </p>
                        </div>

                        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                            {features.map((feature, idx) => (
                                <div
                                    key={idx}
                                    className="group relative rounded-2xl border border-white/5 bg-white/[0.02] p-6 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05] hover:border-white/10 hover:shadow-lg hover:shadow-indigo-500/5"
                                >
                                    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 ring-1 ring-indigo-500/20 transition-all group-hover:ring-indigo-500/40 group-hover:shadow-md group-hover:shadow-indigo-500/10">
                                        {feature.icon}
                                    </div>
                                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ======== PRICING SECTION ======== */}
                <section id="pricing" className="relative py-24 sm:py-32">
                    {/* Background accent */}
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-indigo-600/5 blur-[128px]" />
                    </div>

                    <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <p className="text-sm font-medium uppercase tracking-widest text-indigo-400 mb-3">Paket Internet</p>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                Pilih Paket <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Terbaikmu</span>
                            </h2>
                            <p className="mt-4 text-gray-500 max-w-xl mx-auto">
                                Semua paket termasuk unlimited kuota. Tanpa biaya tersembunyi, tanpa kontrak.
                            </p>
                        </div>

                        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
                            {plans.map((plan, idx) => (
                                <div
                                    key={idx}
                                    onClick={() => setActivePlan(idx)}
                                    className={`relative rounded-2xl border transition-all duration-300 cursor-pointer ${
                                        plan.popular
                                            ? 'border-indigo-500/50 bg-gradient-to-b from-indigo-950/80 to-[#0a0a1a] shadow-xl shadow-indigo-500/10 scale-[1.02] lg:scale-105'
                                            : 'border-white/5 bg-white/[0.02] hover:border-white/10'
                                    } ${activePlan === idx ? 'ring-2 ring-indigo-500/50' : ''}`}
                                >
                                    {plan.popular && (
                                        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                                            <span className="inline-flex items-center rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 px-4 py-1 text-xs font-semibold text-white shadow-lg shadow-indigo-500/30">
                                                ⭐ Paling Populer
                                            </span>
                                        </div>
                                    )}

                                    <div className="p-6 sm:p-8">
                                        <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
                                        <p className={`mt-1 text-sm ${plan.accent}`}>{plan.speed}</p>

                                        <div className="mt-6 flex items-baseline gap-1">
                                            <span className="text-sm text-gray-500">Rp</span>
                                            <span className="text-4xl font-bold text-white tracking-tight">{plan.price}</span>
                                            <span className="text-sm text-gray-500">/bulan</span>
                                        </div>

                                        <ul className="mt-8 space-y-3">
                                            {plan.features.map((feature, fIdx) => (
                                                <li key={fIdx} className="flex items-center gap-3 text-sm text-gray-400">
                                                    <svg className="h-4 w-4 flex-shrink-0 text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                                                    </svg>
                                                    {feature}
                                                </li>
                                            ))}
                                        </ul>

                                        <a
                                            href="https://wa.me/6287780279431"
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`mt-8 block w-full rounded-xl py-3 text-center text-sm font-semibold transition-all duration-200 ${
                                                plan.popular
                                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]'
                                                    : 'border border-white/10 bg-white/5 text-white hover:bg-white/10'
                                            }`}
                                        >
                                            Pilih Paket
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ======== HOW IT WORKS ======== */}
                <section className="relative py-24 sm:py-32 border-t border-white/5">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <p className="text-sm font-medium uppercase tracking-widest text-indigo-400 mb-3">Cara Berlangganan</p>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                Mulai dalam <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">3 Langkah</span>
                            </h2>
                        </div>

                        <div className="grid gap-8 sm:grid-cols-3 max-w-4xl mx-auto">
                            {[
                                {
                                    step: '01',
                                    title: 'Hubungi Kami',
                                    desc: 'Chat via WhatsApp atau daftar online. Tim kami akan merespons kurang dari 1 jam.',
                                    icon: (
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                        </svg>
                                    ),
                                },
                                {
                                    step: '02',
                                    title: 'Survei Lokasi',
                                    desc: 'Teknisi kami survei lokasi dalam 24 jam untuk memastikan area Anda tercover.',
                                    icon: (
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                    ),
                                },
                                {
                                    step: '03',
                                    title: 'Pasang & Nikmati',
                                    desc: 'Instalasi selesai dalam 1-3 hari. Internet siap digunakan tanpa batas!',
                                    icon: (
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                                        </svg>
                                    ),
                                },
                            ].map((item, idx) => (
                                <div key={idx} className="relative text-center group">
                                    {/* Step number */}
                                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 text-indigo-400 ring-1 ring-indigo-500/20 transition-all group-hover:ring-indigo-500/40 group-hover:shadow-lg group-hover:shadow-indigo-500/10">
                                        {item.icon}
                                    </div>
                                    <span className="absolute top-0 right-1/4 text-6xl font-black text-white/[0.03] select-none">{item.step}</span>
                                    <h3 className="text-lg font-semibold text-white mb-2">{item.title}</h3>
                                    <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ======== FAQ SECTION ======== */}
                <section id="faq" className="relative py-24 sm:py-32 border-t border-white/5">
                    <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
                        <div className="text-center mb-16">
                            <p className="text-sm font-medium uppercase tracking-widest text-indigo-400 mb-3">FAQ</p>
                            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                                Pertanyaan <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Umum</span>
                            </h2>
                        </div>

                        <div className="space-y-3">
                            {faqs.map((faq, idx) => (
                                <div
                                    key={idx}
                                    className="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden transition-colors hover:border-white/10"
                                >
                                    <button
                                        onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                                        className="flex w-full items-center justify-between px-6 py-4 text-left"
                                    >
                                        <span className="text-sm font-medium text-white pr-4">{faq.q}</span>
                                        <svg
                                            className={`h-5 w-5 flex-shrink-0 text-gray-500 transition-transform duration-300 ${openFaq === idx ? 'rotate-180' : ''}`}
                                            fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                                        </svg>
                                    </button>
                                    <div className={`transition-all duration-300 ease-in-out overflow-hidden ${openFaq === idx ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0'}`}>
                                        <p className="px-6 pb-4 text-sm text-gray-500 leading-relaxed">
                                            {faq.a}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ======== CTA SECTION ======== */}
                <section className="relative py-24 sm:py-32">
                    <div className="absolute inset-0 overflow-hidden">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-[400px] w-[600px] rounded-full bg-indigo-600/10 blur-[128px]" />
                    </div>

                    <div className="relative mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
                        <h2 className="text-3xl sm:text-5xl font-bold tracking-tight leading-tight">
                            Siap Beralih ke Internet{' '}
                            <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                                yang Lebih Baik?
                            </span>
                        </h2>
                        <p className="mt-5 text-lg text-gray-500 max-w-2xl mx-auto">
                            Bergabung dengan ratusan pelanggan puas SENTOLOP.NET. Pemasangan cepat, harga bersahabat, dan koneksi stabil setiap hari.
                        </p>
                        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                            <a
                                href="https://wa.me/6287780279431"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-4 text-base font-semibold text-white shadow-2xl shadow-indigo-500/30 transition-all duration-300 hover:shadow-indigo-500/50 hover:scale-[1.03]"
                            >
                                <span className="absolute inset-0 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 opacity-0 blur-xl transition-opacity group-hover:opacity-50" />
                                <span className="relative">Daftar Sekarang</span>
                                <svg className="relative h-5 w-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                                </svg>
                            </a>
                            {!auth.user && (
                                <Link
                                    href={route('login')}
                                    className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-8 py-4 text-base font-medium text-gray-300 backdrop-blur-sm transition-all duration-300 hover:bg-white/10 hover:text-white"
                                >
                                    Login Pelanggan
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                {/* ======== FOOTER ======== */}
                <footer className="border-t border-white/5 bg-[#050510]">
                    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                            {/* Brand */}
                            <div className="lg:col-span-2">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M8.288 15.038a5.25 5.25 0 017.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 011.06 0z" />
                                        </svg>
                                    </div>
                                    <span className="text-base font-bold">
                                        SENTOLOP<span className="text-indigo-400">.NET</span>
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600 max-w-xs leading-relaxed">
                                    Penyedia layanan internet fiber optik terjangkau untuk rumah dan bisnis di wilayah Bangun, Pungging, Mojokerto.
                                </p>
                            </div>

                            {/* Quick Links */}
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-3">Layanan</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li><a href="#pricing" className="hover:text-gray-300 transition-colors">Paket Internet</a></li>
                                    <li><a href="#features" className="hover:text-gray-300 transition-colors">Keunggulan</a></li>
                                    <li><a href="#faq" className="hover:text-gray-300 transition-colors">FAQ</a></li>
                                </ul>
                            </div>

                            {/* Contact */}
                            <div>
                                <h4 className="text-sm font-semibold text-white mb-3">Kontak</h4>
                                <ul className="space-y-2 text-sm text-gray-600">
                                    <li className="flex items-center gap-2">
                                        <svg className="h-4 w-4 text-indigo-500" fill="currentColor" viewBox="0 0 24 24">
                                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                        </svg>
                                        <a href="https://wa.me/6287780279431" className="hover:text-gray-300 transition-colors">0877-8027-9431</a>
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <svg className="h-4 w-4 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                        </svg>
                                        Bangun, Pungging, Mojokerto
                                    </li>
                                </ul>
                            </div>
                        </div>

                        <div className="mt-10 border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-xs text-gray-700">
                                &copy; {new Date().getFullYear()} SENTOLOP.NET. All rights reserved.
                            </p>
                            <div className="flex gap-4 text-xs text-gray-700">
                                <a href="#" className="hover:text-gray-400 transition-colors">Syarat & Ketentuan</a>
                                <a href="#" className="hover:text-gray-400 transition-colors">Kebijakan Privasi</a>
                            </div>
                        </div>
                    </div>
                </footer>
            </div>
        </>
    );
}
