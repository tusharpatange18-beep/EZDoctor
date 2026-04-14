import React, { useEffect, useState } from 'react';
import { MapPin, CheckCircle, Users, RefreshCw, FileText, Clock, Truck, Stethoscope } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { useAuth } from '../context/AuthContext';
import { useToast, ToastContainer } from '../components/common/Toast';
import StatusBadge from '../components/ui/StatusBadge';
import { STATUS_CONFIG, API_BASE } from '../constants/status';
import useSocket from '../hooks/useSocket';
import { fetchAllRequests, acceptRequest as apiAcceptRequest, updateRequestStatus } from '../api/requests';

// ── Inline SVG spinner to avoid extra deps
const Spinner = () => (
  <svg className="animate-spin w-4 h-4 flex-shrink-0" viewBox="0 0 24 24" fill="none">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
  </svg>
);

const DoctorDashboard = () => {
  const { user, token } = useAuth();
  const { showToast, toasts, removeToast } = useToast();

  const [requests, setRequests] = useState([]);
  const [pageLoading, setPageLoading] = useState(true);
  const [updating, setUpdating] = useState({});

  // ── Initial fetch
  const loadRequests = () => {
    setPageLoading(true);
    fetchAllRequests()
      .then(data => setRequests(Array.isArray(data) ? data : []))
      .catch(() => showToast({ title: 'Error', message: 'Failed to load requests', type: 'error' }))
      .finally(() => setPageLoading(false));
  };

  useEffect(() => { loadRequests(); }, []); // eslint-disable-line

  // ── Live socket updates
  useSocket({
    locationUpdate: (updated) => {
      setRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
    },
    requestUpdate: (updated) => {
      setRequests(prev => prev.map(r => r._id === updated._id ? updated : r));
      const cfg = STATUS_CONFIG[updated.status];
      if (cfg) showToast({
        title: `Status Updated`,
        message: `${updated.patientName} → ${cfg.label}`,
        type: 'info',
      });
    },
  });

  // ── Accept request
  const handleAcceptRequest = async (id, patientName) => {
    setUpdating(p => ({ ...p, [id]: 'accepting' }));
    const { ok, data } = await apiAcceptRequest(id, user?._id || 'doc', token);
    if (ok) {
      setRequests(prev => prev.map(r => r._id === id ? data : r));
      showToast({ title: 'Request Accepted', message: `Ambulance assigned to ${patientName}`, type: 'success' });
      simulateDoctorMovement(id);
    } else {
      showToast({ title: 'Error', message: data?.message || 'Could not accept request', type: 'error' });
    }
    setUpdating(p => ({ ...p, [id]: null }));
  };

  // ── Update status (arrived / completed)
  const handleUpdateStatus = async (id, status) => {
    const key = `${id}_${status}`;
    setUpdating(p => ({ ...p, [key]: true }));
    const { ok, data } = await updateRequestStatus(id, status, token);
    if (ok) {
      setRequests(prev => prev.map(r => r._id === id ? data : r));
      const cfg = STATUS_CONFIG[status];
      showToast({ title: `${cfg?.label || status}`, type: 'success' });
    } else {
      showToast({ title: 'Update Failed', message: 'Could not update status', type: 'error' });
    }
    setUpdating(p => ({ ...p, [key]: false }));
  };

  // ── Simulate ambulance movement (demo)
  const simulateDoctorMovement = (requestId) => {
    let lat = 19.076;
    let lng = 72.877;
    const interval = setInterval(async () => {
      lat += 0.001;
      lng += 0.001;
      await fetch(`${API_BASE}/request/${requestId}/location`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ lat, lng }),
      });
    }, 3000);
    setTimeout(() => clearInterval(interval), 60000);
  };

  // ── Action buttons per status
  const renderActions = (request) => {
    const { _id, status, patientName } = request;

    if (status === 'pending') {
      const busy = updating[_id] === 'accepting';
      return (
        <button
          onClick={() => handleAcceptRequest(_id, patientName)}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold
                     bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600
                     text-white shadow-md shadow-emerald-200 hover:shadow-emerald-300
                     hover:-translate-y-0.5 active:translate-y-0 transition-all
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {busy ? <><Spinner /> Accepting…</> : <>Accept Request</>}
        </button>
      );
    }

    if (status === 'on_the_way') {
      const busy = updating[`${_id}_arrived`];
      return (
        <button
          onClick={() => handleUpdateStatus(_id, 'arrived')}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold
                     bg-gradient-to-r from-purple-500 to-violet-500 hover:from-purple-600 hover:to-violet-600
                     text-white shadow-md shadow-purple-200
                     hover:-translate-y-0.5 active:translate-y-0 transition-all
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {busy ? <><Spinner /> Updating…</> : <>Mark Arrived</>}
        </button>
      );
    }

    if (status === 'arrived') {
      const busy = updating[`${_id}_completed`];
      return (
        <button
          onClick={() => handleUpdateStatus(_id, 'completed')}
          disabled={busy}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-sm font-bold
                     bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600
                     text-white shadow-md shadow-blue-200
                     hover:-translate-y-0.5 active:translate-y-0 transition-all
                     disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none"
        >
          {busy ? <><Spinner /> Finishing…</> : <>Mark Completed</>}
        </button>
      );
    }

    if (status === 'completed') {
      return (
        <div className="flex-1 flex items-center justify-center gap-2 text-sm font-semibold text-emerald-600 bg-emerald-50 py-2.5 rounded-xl border border-emerald-200">
          <CheckCircle className="w-4 h-4" /> Case Closed
        </div>
      );
    }

    return null;
  };

  const pendingCount   = requests.filter(r => r.status === 'pending').length;
  const activeCount    = requests.filter(r => ['accepted', 'on_the_way', 'arrived'].includes(r.status)).length;
  const completedCount = requests.filter(r => r.status === 'completed').length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* ── HEADER */}
      <div className="mb-8 flex flex-wrap justify-between items-start gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Doctor Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome, <span className="font-semibold text-gray-700">Dr. {user?.name || 'Doctor'}</span> — manage incoming emergencies
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center px-4 py-2 bg-emerald-50 text-emerald-700 rounded-full font-semibold border border-emerald-200 text-sm gap-2">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            Online & Ready
          </div>
          <button
            onClick={loadRequests}
            className="p-2 rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 transition"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* ── STATS BAR */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total Requests', value: requests.length,  bg: 'bg-white',       text: 'text-gray-800',    border: 'border-gray-200',    icon: <FileText className="w-6 h-6" /> },
          { label: 'Pending',        value: pendingCount,     bg: 'bg-amber-50',    text: 'text-amber-700',   border: 'border-amber-200',   icon: <Clock className="w-6 h-6" /> },
          { label: 'Active',         value: activeCount,      bg: 'bg-blue-50',     text: 'text-blue-700',    border: 'border-blue-200',    icon: <Truck className="w-6 h-6" /> },
          { label: 'Completed',      value: completedCount,   bg: 'bg-emerald-50',  text: 'text-emerald-700', border: 'border-emerald-200', icon: <CheckCircle className="w-6 h-6" /> },
        ].map(stat => (
          <div key={stat.label} className={`${stat.bg} border ${stat.border} rounded-2xl p-4 flex items-center gap-3`}>
            <span className={`${stat.text}`}>{stat.icon}</span>
            <div>
              <div className={`text-2xl font-extrabold ${stat.text}`}>{stat.value}</div>
              <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* ── MAP */}
      <div className="h-[360px] w-full mb-10 rounded-2xl overflow-hidden shadow-md border border-gray-200">
        <MapContainer
          center={requests.length && requests[0].location?.lat
            ? [requests[0].location.lat, requests[0].location.lng]
            : [19.076, 72.877]}
          zoom={12}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {requests.map(req => {
            if (!req.location?.lat) return null;
            const cfg = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
            return (
              <Marker key={req._id} position={[req.location.lat, req.location.lng]}>
                <Popup>
                  <strong>{req.patientName}</strong><br />
                  {cfg.label}
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>
      </div>

      {/* ── REQUEST CARDS */}
      {pageLoading ? (
        <div className="text-center py-20 text-gray-400">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-red-500 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-medium">Loading requests...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-2xl border border-dashed border-gray-200">
          <Stethoscope className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-xl font-bold text-gray-700">No active requests</p>
          <p className="text-sm text-gray-400 mt-2">New SOS requests will appear here in real-time</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {requests.map(request => {
            const cfg = STATUS_CONFIG[request.status] || STATUS_CONFIG.pending;
            const initials = (request.patientName || 'P')
              .split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

            return (
              <div
                key={request._id}
                className={`bg-white rounded-2xl p-5 shadow-sm border-l-4 flex flex-col transition-all hover:shadow-md ${cfg.border}`}
              >
                {/* Card header */}
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${cfg.dot}`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-gray-900 leading-tight">{request.patientName}</h3>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {new Date(request.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className="px-2 py-0.5 text-xs bg-red-50 text-red-600 border border-red-200 rounded-full font-bold tracking-wide">SOS</span>
                    {request.triageInfo && request.triageInfo.level !== 'none' && (
                      <div 
                        className={`text-[10px] font-bold px-2 py-1 rounded shadow-sm text-right w-32 leading-tight ${
                          request.triageInfo.level === 'high' ? 'bg-red-600 text-white shadow-red-200 animate-pulse' :
                          request.triageInfo.level === 'medium' ? 'bg-orange-500 text-white shadow-orange-200' :
                          'bg-yellow-400 text-gray-900 shadow-yellow-200'
                        }`}
                        title={request.triageInfo.label}
                      >
                        AI: {request.triageInfo.label || `${request.triageInfo.level} priority`}
                      </div>
                    )}
                  </div>
                </div>

                {/* Status badge */}
                <div className="mb-4">
                  <StatusBadge status={request.status} size="md" />
                </div>

                {/* Details */}
                <div className="space-y-2 mb-5 flex-grow text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span>
                      {request.location?.lat
                        ? `${request.location.lat.toFixed(4)}, ${request.location.lng.toFixed(4)}`
                        : 'No location data'}
                    </span>
                  </div>
                  {request.symptoms && (
                    <div className="flex items-start gap-2 bg-gray-50 p-2 rounded-lg border border-gray-100 italic mt-2">
                      <span className="font-semibold text-gray-600 non-italic flex-shrink-0">Symptoms:</span>
                      <span className="line-clamp-2">{request.symptoms}</span>
                    </div>
                  )}
                  {request.ambulance && (
                    <div className="flex items-center gap-2 text-blue-600">
                      <CheckCircle className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Ambulance assigned</span>
                    </div>
                  )}
                  {request.doctor && (
                    <div className="flex items-center gap-2">
                      <Users className="w-3.5 h-3.5 flex-shrink-0" />
                      <span>Doctor assigned</span>
                    </div>
                  )}
                </div>

                {/* Action */}
                <div className="flex gap-2">{renderActions(request)}</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default DoctorDashboard;