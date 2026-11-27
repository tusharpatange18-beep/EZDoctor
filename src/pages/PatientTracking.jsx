import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, AlertCircle, MapPin, Truck, CheckCircle, Clock } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { STATUS_STEPS } from '../constants/status';
import { fetchRequestById } from '../api/requests';
import useSocket from '../hooks/useSocket';

/** Position of a status in the progress bar (0 = pending), or -1 if unknown. */
function stepIndex(status) {
    for (let i = 0; i < STATUS_STEPS.length; i++) {
        if (STATUS_STEPS[i].key === status) {
            return i;
        }
    }
    return -1;
}

/** CSS classes for a step's circle: finished steps green, the current step highlighted, later steps grey. */
function circleClass(step, done, active) {
    if (done) {
        return 'bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200';
    }
    if (active) {
        return `${step.bg} ${step.color} border-current scale-110 shadow-lg`;
    }
    return 'bg-white border-gray-200 text-gray-300';
}

/** Text colour for a step's label. */
function labelClass(step, done, active) {
    if (active) {
        return step.color;
    }
    if (done) {
        return 'text-emerald-600';
    }
    return 'text-gray-400';
}

/** The rows of the Request Details card. The Ambulance row appears only once one is assigned. */
function detailRows(request, currentStep) {
    let locationText = '—';
    if (request && request.location && request.location.lat) {
        locationText = `${request.location.lat.toFixed(4)}, ${request.location.lng.toFixed(4)}`;
    }
    let patientName = undefined;
    let createdAt = undefined;
    if (request) {
        patientName = request.patientName;
        createdAt = request.createdAt;
    }

    const rows = [];
    rows.push({ label: 'Patient', value: patientName });
    rows.push({ label: 'Status', value: currentStep.label, color: currentStep.color });
    rows.push({ label: 'Location', value: locationText });
    if (request && request.ambulance) {
        rows.push({ label: 'Ambulance', value: 'Assigned', color: 'text-blue-600' });
    }
    rows.push({ label: 'Submitted', value: new Date(createdAt).toLocaleString() });
    return rows;
}

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
    const [requestId] = useState(() => sessionStorage.getItem('requestId'));
    const [request, setRequest] = useState(null);
    const [loading, setLoading] = useState(!!requestId);
    // No saved request id means the user opened this page without sending an SOS first
    let firstError = null;
    if (!requestId) {
        firstError = 'No SOS request found. Please submit an SOS first.';
    }
    const [error, setError] = useState(firstError);

    useEffect(() => {
        if (!requestId) return;

        fetchRequestById(requestId)
            .then(data => {
                setRequest(data);
                setLoading(false);
            })
            .catch(() => {
                setError('Failed to load tracking data. Please try again.');
                setLoading(false);
            });
    }, [requestId]);

    // Live socket updates: the server broadcasts every request; keep only ours
    function onRequestChanged(updated) {
        const myRequestId = sessionStorage.getItem('requestId');
        if (updated._id === myRequestId) {
            setRequest(updated);
        }
    }
    useSocket({
        locationUpdate: onRequestChanged, // the ambulance moved
        requestUpdate: onRequestChanged,  // the status changed
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
                        className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-semibold transition shadow-md"
                    >
                        Submit New SOS
                    </button>
                </div>
            </div>
        );
    }

    // Which step of the progress bar we are on (unknown status -> first step)
    let currentIdx = 0;
    if (request) {
        currentIdx = stepIndex(request.status);
    }
    let currentStep = STATUS_STEPS[currentIdx];
    if (!currentStep) {
        currentStep = STATUS_STEPS[0];
    }

    // The map needs the patient's position; the ambulance pin needs the doctor's position
    const hasPatientLocation = Boolean(request && request.location && request.location.lat);
    const hasAmbulanceLocation = Boolean(request && request.doctorLocation && request.doctorLocation.lat);
    let patientName = undefined;
    if (request) {
        patientName = request.patientName;
    }

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ── Status Banner */}
            <div className={`w-full py-5 px-6 ${currentStep.bg} border-b`}>
                <div className="max-w-2xl mx-auto flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 rounded-full bg-white shadow-sm">
                        <StepIcon stepKey={currentStep.key} className={`w-6 h-6 ${currentStep.color}`} />
                    </div>
                    <div className="flex-1" role="status" aria-live="polite" aria-atomic="true">
                        <h1 className={`text-lg font-extrabold ${currentStep.color}`}>
                            <span className="sr-only">SOS status: </span>{currentStep.label}
                        </h1>
                        <p className="text-sm text-gray-500 mt-0.5">Patient: <span className="font-medium">{patientName}</span></p>
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
                <ol className="flex items-start justify-between" aria-label="SOS progress">
                    {STATUS_STEPS.map((step, idx) => {
                        const done   = idx < currentIdx;
                        const active = idx === currentIdx;
                        return (
                            <li key={step.key} className="flex flex-col items-center flex-1" aria-current={active ? 'step' : undefined}>
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
                                        ${circleClass(step, done, active)}`}
                                    >
                                        {done ? '✓' : <StepIcon stepKey={step.key} className="w-4 h-4" />}
                                    </div>
                                </div>
                                {/* Label */}
                                <p className={`text-xs text-center mt-1 font-semibold leading-tight px-1
                                    ${labelClass(step, done, active)}`}
                                >
                                    {step.label}
                                    {done && <span className="sr-only"> (done)</span>}
                                </p>
                            </li>
                        );
                    })}
                </ol>
            </div>

            {/* ── Map */}
            {hasPatientLocation && (
                <div className="h-[45vh] w-full shadow-inner border-y border-gray-200" role="region" aria-label="Live map of patient and ambulance location">
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
                        {hasAmbulanceLocation && (
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
                        {detailRows(request, currentStep).map(row => (
                            <div key={row.label} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                                <span className="text-xs text-gray-500 font-medium">{row.label}</span>
                                <span className={`text-sm font-semibold ${row.color || 'text-gray-800'}`}>{row.value}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Help hint */}
                <p className="text-center text-xs text-gray-500 mt-4">
                    This page updates automatically in real-time
                </p>
            </div>
        </div>
    );
};

export default PatientTracking;
