import React, { useEffect, useState } from 'react';
import { Calendar, Clock, MapPin, CheckCircle, XCircle, Search, User, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/common/Toast';
import { API_BASE } from '../constants/status';

const MyAppointments = () => {
    const { token, user } = useAuth();
    const { showToast, toasts, removeToast } = useToast();
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [cancelling, setCancelling] = useState({});

    useEffect(() => {
        fetchAppointments();
    }, []); // eslint-disable-line

    const fetchAppointments = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/appointments/my`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (!res.ok) throw new Error('Failed to fetch appointments');
            const data = await res.json();
            setAppointments(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id) => {
        if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
        
        setCancelling(prev => ({ ...prev, [id]: true }));
        try {
            const res = await fetch(`${API_BASE}/appointments/${id}/cancel`, {
                method: 'PATCH',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            
            if (!res.ok) throw new Error(data.message || 'Failed to cancel');
            
            setAppointments(prev => prev.map(app => app._id === id ? data.appointment : app));
            showToast('Appointment cancelled successfully', 'success');
        } catch (err) {
            showToast(`${err.message}`, 'error');
        } finally {
            setCancelling(prev => ({ ...prev, [id]: false }));
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4">
            <ToastContainer toasts={toasts} removeToast={removeToast} />
            <div className="max-w-4xl mx-auto">
                <div className="mb-8">
                    <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Appointments</h1>
                    <p className="text-gray-500 mt-1 text-sm">
                        View and manage your upcoming doctor visits
                    </p>
                </div>

                {loading ? (
                    <div className="text-center py-20">
                        <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                        <p className="text-sm font-medium text-gray-500">Loading appointments...</p>
                    </div>
                ) : error ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-red-200">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-lg font-bold text-gray-700">Could not load appointments</p>
                        <p className="text-sm text-gray-400 mt-1 mb-6">{error}</p>
                        <button onClick={fetchAppointments} className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition">
                            Try Again
                        </button>
                    </div>
                ) : appointments.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-bold text-gray-700">No appointments found</p>
                        <p className="text-sm text-gray-400 mt-1">You haven't booked any doctor appointments yet.</p>
                        <a href="/doctors" className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition shadow-md shadow-red-200">
                            <Search className="w-4 h-4" /> Find a Doctor
                        </a>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {appointments.map(appointment => {
                            const isCancelled = appointment.status === 'cancelled';
                            const docName = appointment.doctorId?.name || 'Unknown Doctor';
                            const initials = docName.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

                            return (
                                <div key={appointment._id} className={`bg-white rounded-2xl p-5 md:p-6 shadow-sm border flex flex-col md:flex-row md:items-center justify-between gap-6 transition-all hover:shadow-md ${isCancelled ? 'border-gray-200 opacity-75 grayscale' : 'border-l-4 border-l-red-500'}`}>
                                    <div className="flex gap-4">
                                        <div className={`w-14 h-14 rounded-2xl text-xl flex items-center justify-center border flex-shrink-0 overflow-hidden ${isCancelled ? 'bg-gray-50 border-gray-200 text-gray-400' : 'bg-red-50 border-red-100 text-red-500'}`}>
                                            {appointment.doctorId?.photo && appointment.doctorId.photo.startsWith('http') ? (
                                                <img src={appointment.doctorId.photo} alt={docName} className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-7 h-7" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-gray-900 leading-tight flex items-center gap-2">
                                                {docName}
                                                {isCancelled && (
                                                    <span className="px-2 py-0.5 text-[10px] bg-red-50 text-red-600 border border-red-200 rounded-full font-bold uppercase tracking-wide">Cancelled</span>
                                                )}
                                                {!isCancelled && appointment.status === 'completed' && (
                                                    <span className="px-2 py-0.5 text-[10px] bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-full font-bold uppercase tracking-wide">Completed</span>
                                                )}
                                                {!isCancelled && appointment.status === 'booked' && (
                                                    <span className="px-2 py-0.5 text-[10px] bg-blue-50 text-blue-600 border border-blue-200 rounded-full font-bold uppercase tracking-wide">Upcoming</span>
                                                )}
                                            </h3>
                                            <p className="text-sm text-gray-500 mt-0.5 font-medium">{appointment.doctorId?.specialization || 'Specialist'}</p>
                                            
                                            <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-6 text-sm text-gray-600">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-gray-400" />
                                                    <span className="font-semibold text-gray-700">{appointment.date}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Clock className="w-4 h-4 text-gray-400" />
                                                    <span className="font-semibold text-gray-700">{appointment.time}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <MapPin className="w-4 h-4 text-gray-400" />
                                                    <span>{appointment.doctorId?.location || 'Clinic'}</span>
                                                </div>
                                            </div>
                                            
                                            {appointment.notes && (
                                                <p className="mt-3 text-sm text-gray-500 bg-gray-50 p-3 rounded-lg border border-gray-100 italic">
                                                    "{appointment.notes}"
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    
                                    {!isCancelled && appointment.status === 'booked' && (
                                        <div className="md:border-l md:border-gray-100 md:pl-6 flex md:flex-col justify-end gap-3 mt-4 md:mt-0 pt-4 md:pt-0 border-t border-gray-100 md:border-t-0">
                                            <button 
                                                onClick={() => handleCancel(appointment._id)} 
                                                disabled={cancelling[appointment._id]}
                                                className="w-full md:w-auto px-5 py-2.5 text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {cancelling[appointment._id] ? (
                                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                                                ) : <XCircle className="w-4 h-4" />}
                                                Cancel Visit
                                            </button>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MyAppointments;
