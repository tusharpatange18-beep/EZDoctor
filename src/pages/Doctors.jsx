import { useEffect, useState, useMemo } from 'react';
import { MapPin, Briefcase, Phone, Search, SlidersHorizontal, Calendar, Clock, CheckCircle, X, User, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/common/Toast';

const API = import.meta.env.VITE_API_BASE;

// ─── Specialization filter list ───────────────────────────────
const SPECIALIZATIONS = ['All', 'Cardiologist', 'General Physician', 'Dentist', 'Neurologist', 'Orthopedic', 'Pediatrician'];

// ─── Time slots ───────────────────────────────────────────────
const TIME_SLOTS = [
    '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM',
    '11:00 AM', '11:30 AM', '02:00 PM', '02:30 PM',
    '03:00 PM', '03:30 PM', '04:00 PM', '04:30 PM',
];

// ─── Star rating display ──────────────────────────────────────
const Stars = ({ rating = 4.5 }) => {
    const full  = Math.floor(rating);
    const empty = 5 - full;
    return (
        <span className="flex items-center gap-0.5 text-amber-400 text-xs">
            {'★'.repeat(full)}
            <span className="text-gray-300">{'★'.repeat(empty)}</span>
            <span className="ml-1 text-gray-600 font-semibold">{Number(rating).toFixed(1)}</span>
        </span>
    );
};

// ─── Single doctor card ───────────────────────────────────────
const DoctorCard = ({ doctor, onBook }) => {
    const initials = doctor.name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-red-400 to-rose-500" />
            <div className="p-5 flex flex-col flex-1">
                {/* Avatar + name row */}
                <div className="flex items-start gap-4 mb-4">
                    <div className="w-14 h-14 rounded-2xl bg-red-50 text-2xl flex items-center justify-center flex-shrink-0 border border-red-100 overflow-hidden">
                        {doctor.photo && doctor.photo.startsWith('http') ? (
                            <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-7 h-7 text-red-400" />
                        )}
                    </div>
                    <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900 leading-tight truncate">{doctor.name}</h3>
                        <p className="text-sm text-red-600 font-medium mt-0.5">{doctor.specialization}</p>
                        <Stars rating={doctor.rating} />
                    </div>
                    <div className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full border border-emerald-200 flex-shrink-0">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        Available
                    </div>
                </div>
                {/* Details */}
                <div className="space-y-2 text-sm text-gray-500 mb-5 flex-1">
                    <div className="flex items-center gap-2">
                        <Briefcase className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{doctor.experience} years experience</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        <span>{doctor.location || 'Mumbai'}</span>
                    </div>
                    {doctor.phone && (
                        <div className="flex items-center gap-2">
                            <Phone className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                            <span>{doctor.phone}</span>
                        </div>
                    )}
                </div>
                <button
                    onClick={() => onBook(doctor)}
                    className="w-full py-2.5 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white text-sm font-bold transition-all shadow-sm shadow-red-200 hover:-translate-y-0.5 active:translate-y-0"
                >
                    Book Appointment
                </button>
            </div>
        </div>
    );
};

// ─── Skeleton ─────────────────────────────────────────────────
const SkeletonCard = () => (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
        <div className="h-2 bg-gray-200" />
        <div className="p-5 space-y-4">
            <div className="flex gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gray-200" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4" />
                    <div className="h-3 bg-gray-200 rounded w-1/2" />
                    <div className="h-3 bg-gray-200 rounded w-1/3" />
                </div>
            </div>
            <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded w-2/3" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
            <div className="h-10 bg-gray-200 rounded-xl" />
        </div>
    </div>
);

// ─── Booking Modal — form + API call ─────────────────────────
const BookingModal = ({ doctor, token, onClose, onSuccess }) => {
    // Tomorrow as default date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const defaultDate = tomorrow.toISOString().split('T')[0];

    const [date, setDate]     = useState(defaultDate);
    const [time, setTime]     = useState('');
    const [notes, setNotes]   = useState('');
    const [step, setStep]     = useState('form');   // 'form' | 'success'
    const [loading, setLoading] = useState(false);
    const [error, setError]   = useState('');

    if (!doctor) return null;

    const initials = doctor.name.split(' ').filter(Boolean).map(w => w[0]).join('').toUpperCase().slice(0, 2);

    const handleConfirm = async () => {
        if (!date)  { setError('Please pick a date');  return; }
        if (!time)  { setError('Please select a time slot'); return; }
        setError('');
        setLoading(true);

        try {
            const res = await fetch(`${API}/appointments`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ doctorId: doctor._id, date, time, notes }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.message || 'Booking failed. Try again.');
                setLoading(false);
                return;
            }

            setStep('success');
            onSuccess(data.appointment);
        } catch {
            setError('Network error — is the backend running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md animate-fade-in">

                {/* ── Success screen */}
                {step === 'success' ? (
                    <div className="p-8 text-center">
                        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <CheckCircle className="w-8 h-8 text-emerald-600" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-1">Appointment Booked!</h2>
                        <p className="text-gray-500 text-sm mb-1">
                            <span className="font-semibold text-gray-700">{doctor.name}</span> · {doctor.specialization}
                        </p>
                        <p className="text-gray-500 text-sm mb-6 flex items-center justify-center gap-3">
                            <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {date}</span>
                            <span className="flex items-center gap-1"><Clock className="w-4 h-4" /> {time}</span>
                        </p>
                        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-emerald-700 text-sm font-semibold mb-4 flex items-center justify-center gap-2">
                            <CheckCircle className="w-4 h-4" /> Saved to your appointments
                        </div>
                        <button
                            onClick={onClose}
                            className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 text-sm font-medium hover:bg-gray-50 transition"
                        >
                            Done
                        </button>
                    </div>
                ) : (
                    // ── Booking form
                    <div>
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-2xl bg-red-50 flex items-center justify-center border border-red-100 overflow-hidden text-xl">
                                    {doctor.photo && doctor.photo.startsWith('http') ? (
                                        <img src={doctor.photo} alt={doctor.name} className="w-full h-full object-cover" />
                                    ) : (
                                        <User className="w-6 h-6 text-red-400" />
                                    )}
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-gray-900 leading-tight">{doctor.name}</h2>
                                    <p className="text-xs text-red-600 font-medium">{doctor.specialization}</p>
                                </div>
                            </div>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition p-1">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Form body */}
                        <div className="p-6 space-y-5">
                            {/* Date picker */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Calendar className="w-4 h-4 text-red-500" />
                                    Select Date
                                </label>
                                <input
                                    type="date"
                                    value={date}
                                    min={defaultDate}
                                    onChange={e => setDate(e.target.value)}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm font-medium
                                               focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent"
                                />
                            </div>

                            {/* Time slots */}
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                                    <Clock className="w-4 h-4 text-red-500" />
                                    Select Time Slot
                                </label>
                                <div className="grid grid-cols-3 gap-2">
                                    {TIME_SLOTS.map(slot => (
                                        <button
                                            key={slot}
                                            type="button"
                                            onClick={() => setTime(slot)}
                                            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all
                                                ${time === slot
                                                    ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-200'
                                                    : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-500'
                                                }`}
                                        >
                                            {slot}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Notes (optional) */}
                            <div>
                                <label className="text-sm font-semibold text-gray-700 mb-2 block">
                                    Notes <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <textarea
                                    value={notes}
                                    onChange={e => setNotes(e.target.value)}
                                    placeholder="Describe your symptoms or reason for visit..."
                                    rows={2}
                                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-sm
                                               focus:outline-none focus:ring-2 focus:ring-red-300 focus:border-transparent resize-none"
                                />
                            </div>

                            {/* Error */}
                            {error && (
                                <p className="text-red-600 text-xs font-semibold flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
                                    <AlertCircle className="w-4 h-4" /> {error}
                                </p>
                            )}

                            {/* Confirm button */}
                            <button
                                onClick={handleConfirm}
                                disabled={loading}
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500
                                           hover:from-red-600 hover:to-rose-600 text-white font-bold text-sm
                                           transition-all shadow-md shadow-red-200 disabled:opacity-60 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Booking...' : 'Confirm Appointment'}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

// ─── Main Doctors page ────────────────────────────────────────
const Doctors = () => {
    const navigate = useNavigate();
    const { isAuth, token } = useAuth();
    const { showToast, toasts, removeToast } = useToast();

    const [doctors, setDoctors]         = useState([]);
    const [loading, setLoading]         = useState(true);
    const [error, setError]             = useState(null);
    const [search, setSearch]           = useState('');
    const [activeSpec, setActiveSpec]   = useState('All');
    const [selectedDoctor, setSelectedDoctor] = useState(null);

    // ── Fetch available doctors
    useEffect(() => {
        fetch(`${API}/doctors`)
            .then(res => { if (!res.ok) throw new Error('Failed to load doctors'); return res.json(); })
            .then(data => { setDoctors(Array.isArray(data) ? data : []); setLoading(false); })
            .catch(err => { setError(err.message); setLoading(false); });
    }, []);

    // ── Filter logic
    const filtered = useMemo(() => doctors.filter(d => {
        const matchSpec   = activeSpec === 'All' || d.specialization === activeSpec;
        const matchSearch = !search || [d.name, d.specialization, d.location || '']
            .some(f => f.toLowerCase().includes(search.toLowerCase()));
        return matchSpec && matchSearch;
    }), [doctors, activeSpec, search]);

    // ── Open booking modal (guard: must be logged in)
    const handleBook = (doctor) => {
        if (!isAuth) { navigate('/login'); return; }
        setSelectedDoctor(doctor);
    };

    // ── Called after successful booking API call
    const handleBooked = (appointment) => {
        console.log('✅ Appointment saved:', appointment);
        showToast({
            title: 'Appointment Booked!',
            message: `${selectedDoctor?.name} · ${appointment.date} ${appointment.time}`,
            type: 'success',
            duration: 5000,
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <ToastContainer toasts={toasts} removeToast={removeToast} />

            {/* ── Hero */}
            <div className="bg-gradient-to-br from-red-500 to-rose-600 text-white py-14 px-4">
                <div className="max-w-4xl mx-auto text-center">
                    <p className="text-red-200 text-sm font-semibold uppercase tracking-widest mb-2">EZDoctor Network</p>
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-3 leading-tight">Find the Right Doctor</h1>
                    <p className="text-red-100 text-lg mb-8">{doctors.length} verified doctors available right now</p>
                    <div className="relative max-w-md mx-auto">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by name, specialization, city..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl text-gray-800 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-white/30 shadow-lg"
                        />
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">

                {/* ── Filters */}
                <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 hide-scrollbar">
                    <SlidersHorizontal className="w-4 h-4 text-gray-400 flex-shrink-0 mr-1" />
                    {SPECIALIZATIONS.map(spec => (
                        <button
                            key={spec}
                            onClick={() => setActiveSpec(spec)}
                            className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-semibold transition-all border
                                ${activeSpec === spec
                                    ? 'bg-red-500 text-white border-red-500 shadow-md shadow-red-200'
                                    : 'bg-white text-gray-600 border-gray-200 hover:border-red-300 hover:text-red-500'}`}
                        >
                            {spec}
                        </button>
                    ))}
                </div>

                {/* ── Result count */}
                {!loading && !error && (
                    <p className="text-sm text-gray-400 mb-6 font-medium">
                        Showing <span className="text-gray-700 font-bold">{filtered.length}</span> doctor{filtered.length !== 1 ? 's' : ''}
                        {activeSpec !== 'All' && ` · ${activeSpec}`}
                        {search && ` · "${search}"`}
                    </p>
                )}

                {/* ── Skeletons */}
                {loading && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[...Array(6)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {/* ── Error */}
                {error && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-red-200">
                        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                        <p className="text-lg font-bold text-gray-700">Could not load doctors</p>
                        <p className="text-sm text-gray-400 mt-1 mb-6">{error}</p>
                        <button onClick={() => window.location.reload()} className="px-6 py-2.5 bg-red-500 text-white rounded-xl text-sm font-semibold hover:bg-red-600 transition">
                            Try Again
                        </button>
                    </div>
                )}

                {/* ── Empty */}
                {!loading && !error && filtered.length === 0 && (
                    <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
                        <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-lg font-bold text-gray-700">No doctors found</p>
                        <p className="text-sm text-gray-400 mt-1">Try a different specialization or search term</p>
                        <button onClick={() => { setActiveSpec('All'); setSearch(''); }} className="mt-4 px-5 py-2 border border-gray-200 rounded-xl text-sm font-medium text-gray-500 hover:bg-gray-50 transition">
                            Clear filters
                        </button>
                    </div>
                )}

                {/* ── Cards grid */}
                {!loading && !error && filtered.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filtered.map(doctor => (
                            <DoctorCard key={doctor._id} doctor={doctor} onBook={handleBook} />
                        ))}
                    </div>
                )}

                {/* ── Login hint */}
                {!isAuth && !loading && (
                    <p className="text-center text-xs text-gray-400 mt-8">
                        <span onClick={() => navigate('/login')} className="text-red-500 font-semibold cursor-pointer hover:underline">Sign in</span>
                        {' '}to book appointments
                    </p>
                )}
            </div>

            {/* ── Booking modal */}
            {selectedDoctor && (
                <BookingModal
                    doctor={selectedDoctor}
                    token={token}
                    onClose={() => setSelectedDoctor(null)}
                    onSuccess={handleBooked}
                />
            )}
        </div>
    );
};

export default Doctors;
