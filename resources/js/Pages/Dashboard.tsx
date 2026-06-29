import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import TrafficChart from '@/Components/Traffic/TrafficChart';
import TrafficWidget from '@/Components/Traffic/TrafficWidget';
import BillingWidget from '@/Components/Billing/BillingWidget';

export default function Dashboard() {
    const user = usePage().props.auth.user;


    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />

            <div className="py-12">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
                    {/* Welcome Card */}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <h3 className="text-lg font-semibold">Welcome!</h3>
                            <p className="mt-2 text-sm text-gray-600">Monitor your network traffic in real-time with live RX/TX rate updates.</p>
                        </div>
                    </div>

                    {/* Quick Overview Section */}
                    <div className="mt-6">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Network Status</h2>
                        <div className="grid gap-6 lg:grid-cols-2">
                            <div>
                                <TrafficWidget
                                    interfaceName={`pppoe-${user.name}`}
                                    interfaceLabel={`PPPoE User Auth (${user.name})`}
                                    samples={2}
                                    interval={1}
                                    autoRefresh={true}
                                    refreshInterval={3000}
                                />
                            </div>
                            <div>
                                <BillingWidget />
                            </div>
                        </div>
                    </div>

                    {/* Detailed Traffic Chart */}
                    <div className="mt-8">
                        <h2 className="mb-4 text-lg font-semibold text-gray-800">Network Traffic Monitor</h2>
                        <TrafficChart
                            interfaceName={`pppoe-${user.name}`}
                            interfaceLabel={`PPPoE User Auth (${user.name}) - Real-time Traffic Analysis`}
                            samples={5}
                            interval={2}
                            autoRefresh={true}
                            refreshInterval={15000}
                            chartType="line"
                        />
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
