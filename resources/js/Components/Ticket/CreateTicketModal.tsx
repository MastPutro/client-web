import React, { useState, FormEvent } from 'react';
import Modal from '@/Components/Modal';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import { TicketPriority, TicketCategory, PRIORITY_LABELS, CATEGORY_LABELS } from '@/types/ticket';
import axios from 'axios';
interface CreateTicketModalProps {
    show: boolean;
    onClose: () => void;
    onSuccess: () => void;
}
interface FormData {
    title: string;
    description: string;
    priority: TicketPriority;
    category: TicketCategory;
}
interface FormErrors {
    title?: string;
    description?: string;
    priority?: string;
    category?: string;
    general?: string;
}
const CreateTicketModal: React.FC<CreateTicketModalProps> = ({ show, onClose, onSuccess }) => {
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        priority: 'medium',
        category: 'service',
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [submitting, setSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setErrors({});
        setSuccessMessage('');
        // Client-side validation
        const newErrors: FormErrors = {};
        if (!formData.title.trim()) newErrors.title = 'Judul tiket wajib diisi';
        if (!formData.description.trim()) newErrors.description = 'Deskripsi wajib diisi';
        if (formData.title.length > 255) newErrors.title = 'Judul maksimal 255 karakter';
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }
        setSubmitting(true);
        try {
            const response = await axios.post('/complaints/tickets', formData);
            if (response.data.success) {
                setSuccessMessage('Tiket berhasil dibuat!');
                setFormData({ title: '', description: '', priority: 'medium', category: 'service' });
                setTimeout(() => {
                    setSuccessMessage('');
                    onSuccess();
                    onClose();
                }, 1200);
            } else {
                setErrors({ general: response.data.message || 'Gagal membuat tiket' });
            }
        } catch (err: unknown) {
            if (axios.isAxiosError(err) && err.response?.data?.errors) {
                const serverErrors: FormErrors = {};
                const responseErrors = err.response.data.errors as Record<string, string[]>;
                Object.entries(responseErrors).forEach(([key, messages]) => {
                    (serverErrors as Record<string, string>)[key] = messages[0];
                });
                setErrors(serverErrors);
            } else if (axios.isAxiosError(err)) {
                setErrors({ general: err.response?.data?.message || 'Terjadi kesalahan' });
            } else {
                setErrors({ general: 'Terjadi kesalahan yang tidak diketahui' });
            }
        } finally {
            setSubmitting(false);
        }
    };
    const handleClose = () => {
        if (!submitting) {
            setErrors({});
            setSuccessMessage('');
            onClose();
        }
    };
    return (
        <Modal show={show} onClose={handleClose} maxWidth="lg">
            <form onSubmit={handleSubmit} className="p-6">
                {/* Header */}
                <div className="mb-6">
                    <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-sm">
                            +
                        </span>
                        Buat Tiket Baru
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                        Deskripsikan masalah Anda dan kami akan segera merespons.
                    </p>
                </div>
                {/* Success Message */}
                {successMessage && (
                    <div className="mb-4 rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-sm text-emerald-700 flex items-center gap-2">
                        <svg className="h-5 w-5 text-emerald-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {successMessage}
                    </div>
                )}
                {/* General Error */}
                {errors.general && (
                    <div className="mb-4 rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-700 flex items-center gap-2">
                        <svg className="h-5 w-5 text-red-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                        </svg>
                        {errors.general}
                    </div>
                )}
                {/* Title */}
                <div className="mb-4">
                    <InputLabel htmlFor="ticket-title" value="Judul Tiket" />
                    <TextInput
                        id="ticket-title"
                        className="mt-1 block w-full"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Contoh: Internet lambat sejak kemarin"
                        disabled={submitting}
                    />
                    <InputError message={errors.title} className="mt-1" />
                </div>
                {/* Category & Priority Row */}
                <div className="mb-4 grid grid-cols-2 gap-4">
                    <div>
                        <InputLabel htmlFor="ticket-category" value="Kategori" />
                        <select
                            id="ticket-category"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            value={formData.category}
                            onChange={(e) => setFormData({ ...formData, category: e.target.value as TicketCategory })}
                            disabled={submitting}
                        >
                            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <InputError message={errors.category} className="mt-1" />
                    </div>
                    <div>
                        <InputLabel htmlFor="ticket-priority" value="Prioritas" />
                        <select
                            id="ticket-priority"
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                            value={formData.priority}
                            onChange={(e) => setFormData({ ...formData, priority: e.target.value as TicketPriority })}
                            disabled={submitting}
                        >
                            {Object.entries(PRIORITY_LABELS).map(([value, label]) => (
                                <option key={value} value={value}>{label}</option>
                            ))}
                        </select>
                        <InputError message={errors.priority} className="mt-1" />
                    </div>
                </div>
                {/* Description */}
                <div className="mb-6">
                    <InputLabel htmlFor="ticket-description" value="Deskripsi Masalah" />
                    <textarea
                        id="ticket-description"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 text-sm"
                        rows={5}
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        placeholder="Jelaskan masalah Anda secara detail..."
                        disabled={submitting}
                    />
                    <InputError message={errors.description} className="mt-1" />
                </div>
                {/* Actions */}
                <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
                    <SecondaryButton type="button" onClick={handleClose} disabled={submitting}>
                        Batal
                    </SecondaryButton>
                    <PrimaryButton type="submit" disabled={submitting} className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700">
                        {submitting ? (
                            <span className="flex items-center gap-2">
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                </svg>
                                Mengirim...
                            </span>
                        ) : (
                            'Kirim Tiket'
                        )}
                    </PrimaryButton>
                </div>
            </form>
        </Modal>
    );
};
export default CreateTicketModal;