import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, MapPin, Truck, CheckCircle, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { STATUS_STEPS } from '../constants/status';
import { fetchRequestById } from '../api/requests';
import useSocket from '../hooks/useSocket';

const stepIndex = (status) => STATUS_STEPS.findIndex(s => s.key === status);

const StepIcon = ({ stepKey, className }) => {
    switch(stepKey) {
        case 'pending': return <Clock className={className} />;
        case 'accepted': return <Truck className={className} />;
        case 'on_the_way': return <Truck className={className} />;
        case 'arrived': return <MapPin className={className} />;
        case 'completed': return <CheckCircle className={className} />;
        default: return <Activity className={className} />;
    }
};

const PatientTracking = () => {
    const navigate = useNavigate();
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const requestId = sessionStorage.getItem('requestId');

        if (!requestId) {
            setError('No SOS request found. Please submit an SOS first.');
            setLoading(false);
            return;
        }

        fetchRequestById(requestId)
            .then(data => {
                setRequest(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load tracking data. Please try again.');
                setLoading(false);
            });
    }, []);

    // Live socket updates
    useSocket({
        locationUpdate: (updated) => {
            const requestId = sessionStorage.getItem('requestId');
            if (updated._id === requestId) setRequest(updated);
        },
        requestUpdate: (updated) => {
            const requestId = sessionStorage.getItem('requestId');
            if (updated._id === requestId) setRequest(updated);
        },
    });

    // ── Loading screen
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-red-50 to-white">
                <div className="text-center">
                    <Activity className="w-16 h-16 text-red-500 mb-5 animate-bounce mx-auto" />
                    <div className="w-10 h-10 border-4 border-red-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-lg font-semibold text-gray-700">Connecting to live tracking...</p>
                    <p className="text-sm text-gray-400 mt-1">Please wait a moment</p>
                </div>
            </div>
        );
    }

    // ── Error screen
    if (error) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-red-50">
                <div className="text-center bg-white p-10 rounded-3xl shadow-xl max-w-md mx-4">
                    <AlertCircle className="w-12 h-12 text-red-500 mb-4 mx-auto" />
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">Tracking Error</h2>
                    <p className="text-gray-500 text-sm mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/sos')}
                        className="px-6 py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold transition shadow-md"
                    >
                        Submit New SOS
                    </button>
                </div>
            </div>
        );
    }

    const currentIdx  = request ? stepIndex(request.status) : 0;
    const currentStep = STATUS_STEPS[currentIdx] || STATUS_STEPS[0];

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Status Banner */}
            <div className={`w-full py-5 px-6 ${currentStep.bg} border-b`}>
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
                        <StepIcon stepKey={currentStep.key} className={`w-6 h-6 ${currentStep.color}`} />
                    </div>
                    <div className="flex-1">
                        <p className={`text-lg font-extrabold ${currentStep.color}`}>{currentStep.label}</p>
                        <p className="text-sm text-gray-500 mt-0.5">Patient: <span className="font-medium">{request?.patientName}</span></p>
                    </div>
                    {/* Live indicator */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white/60 rounded-full text-xs font-semibold text-gray-600 border border-white/80">
                        <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                        Live
                    </div>
                </div>
            </div>

            {/* ── Status Timeline */}
            <div className="max-w-2xl mx-auto px-4 py-8">
                <div className="flex items-start justify-between">
                    {STATUS_STEPS.map((step, idx) => {
                        const done   = idx < currentIdx;
                        const active = idx === currentIdx;
                        return (
                            <div key={step.key} className="flex flex-col items-center flex-1">
                                {/* Connector + Circle row */}
                                <div className="relative w-full flex items-center justify-center mb-2">
                                    {/* Left connector */}
                                    {idx > 0 && (
                                        <div className={`absolute left-0 right-1/2 h-0.5 top-4 transition-colors
                                            ${done || active ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                    )}
                                    {/* Right connector */}
                                    {idx < STATUS_STEPS.length - 1 && (
                                        <div className={`absolute left-1/2 right-0 h-0.5 top-4 transition-colors
                                            ${done ? 'bg-emerald-400' : 'bg-gray-200'}`} />
                                    )}
                                    {/* Circle */}
                                    <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-sm border-2 transition-all
                                        ${done
                                            ? 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200'
                                            : active
                                                ? `${step.bg} ${step.color} border-current scale-110 shadow-lg`
                                                : 'bg-white border-gray-200 text-gray-300'
                                        }`}
                                    >
                                        {done ? '✓' : <StepIcon stepKey={step.key} className="w-4 h-4" />}
                                    </div>
                                </div>
                                {/* Label */}
                                <p className={`text-xs text-center mt-1 font-semibold leading-tight px-1
                                    ${active ? step.color : done ? 'text-emerald-600' : 'text-gray-400'}`}
                                >
                                    {step.label}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* ── Map */}
            {request?.location?.lat && (
                <div className="h-[45vh] w-full shadow-inner border-y border-gray-200">
                    <MapContainer
                        center={[request.location.lat, request.location.lng]}
                        zoom={14}
                        style={{ height: '100%', width: '100%' }}
                    >
                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

                        {/* Patient pin */}
                        <Marker position={[request.location.lat, request.location.lng]}>
                            <Popup>{request.patientName} — You are here</Popup>
                        </Marker>

                        {/* Ambulance pin (moves in real-time) */}
                        {request.doctorLocation?.lat && (
                            <Marker position={[request.doctorLocation.lat, request.doctorLocation.lng]}>
                                <Popup>Ambulance en route</Popup>
                            </Marker>
                        )}
                    </MapContainer>
                </div>
            )}

            {/* ── Info Card */}
            <div className="max-w-2xl mx-auto px-4 py-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                    <h2 className="text-base font-bold text-gray-800 mb-4 flex items-center gap-2">
                        Request Details
                    </h2>
                    <div className="space-y-3">
                        {[
                            { label: 'Patient',   value: request?.patientName },
                            { label: 'Status',    value: currentStep.label, color: currentStep.color },
                            { label: 'Location',  value: request?.location?.lat
                                ? `${request.location.lat.toFixed(4)}, ${request.location.lng.toFixed(4)}`
                                : '—' },
                            ...(request?.ambulance ? [{ label: 'Ambulance', value: 'Assigned', color: 'text-blue-600' }] : []),
                            { label: 'Submitted', value: new Date(request?.createdAt).toLocaleString() },
                        ].map(row => (
                            <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span className="text-xs text-gray-400 font-medium">{row.label}</span>
                                <span className={`text-sm font-semibold ${row.color || 'text-gray-800'}`}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Help hint */}
                <p className="text-center text-xs text-gray-400 mt-4">
                    This page updates automatically in real-time
                </p>
            </div>
        </div>
    );
};

export default PatientTracking;
