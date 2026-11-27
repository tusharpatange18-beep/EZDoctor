import { useEffect, useState } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { STATUS_CONFIG } from '../constants/status';
import StatusBadge from '../components/ui/StatusBadge';
import useSocket from '../hooks/useSocket';
import upsertById from '../utils/upsertById';
import { fetchAllRequests } from '../api/requests';
import { useAuth } from '../context/AuthContext';

/** "19.0760, 72.8770", or a dash when the request has no position. */
function locationText(request) {
    if (!request.location || !request.location.lat) {
        return '—';
    }
    return `${request.location.lat.toFixed(4)}, ${request.location.lng.toFixed(4)}`;
}

const AdminPanel = () => {
    const { token } = useAuth(); // the server only shows all requests to logged-in staff
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    // Only accept a list (anything else means the server answered something unexpected)
    const saveRequests = (data) => {
        if (Array.isArray(data)) {
            setRequests(data);
        } else {
            setRequests([]);
        }
    };

    // Refresh button: show the spinner again, then reload
    const loadRequests = () => {
        setLoading(true);
        fetchAllRequests(token)
            .then(saveRequests)
            .catch(() => {
                // keep the old list; the table just stops loading
            })
            .finally(() => setLoading(false));
    };

    // First load. `loading` already starts as true, so the effect must not set it again
    // (React's lint rule forbids setting state directly inside an effect).
    useEffect(() => {
        fetchAllRequests(token)
            .then(saveRequests)
            .catch(() => {
                // the table stays empty; the Refresh button can try again
            })
            .finally(() => setLoading(false));
    }, [token]); // load again if a different user logs in

    // Live updates: add the request if it's new, replace it if we already have it
    function onRequestChanged(updated) {
        setRequests(prev => upsertById(prev, updated));
    }
    useSocket({
        requestUpdate: onRequestChanged,
        locationUpdate: onRequestChanged,
    });

    // The rows shown in the table, for the chosen filter button
    const filtered = [];
    for (const request of requests) {
        if (filter === 'all' || request.status === filter) {
            filtered.push(request);
        }
    }

    // How many requests have each status, e.g. { pending: 3, completed: 5, ... }
    const counts = {};
    for (const status of Object.keys(STATUS_CONFIG)) {
        counts[status] = 0;
    }
    for (const request of requests) {
        if (counts[request.status] !== undefined) {
            counts[request.status] = counts[request.status] + 1;
        }
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900"><span aria-hidden="true">🔧 </span>Admin Panel</h1>
                    <p className="text-gray-500 mt-1">Monitor all emergency requests in real-time</p>
                </div>
                <button
                    onClick={loadRequests}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" aria-hidden="true" /> Refresh
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8" role="group" aria-label="Filter requests by status">
                <button
                    type="button"
                    aria-pressed={filter === 'all'}
                    onClick={() => setFilter('all')}
                    className={`cursor-pointer rounded-xl p-3 text-center border transition ${filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-400'}`}
                >
                    <div className="text-xl font-bold">{requests.length}</div>
                    <div className="text-xs mt-0.5">All</div>
                </button>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <button
                        type="button"
                        key={key}
                        aria-pressed={filter === key}
                        onClick={() => setFilter(key)}
                        className={`cursor-pointer rounded-xl p-3 text-center border transition ${filter === key ? `${cfg.bg} border-current` : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="text-xl font-bold">{counts[key] || 0}</div>
                        <div className="text-xs mt-0.5">{cfg.label}</div>
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4 animate-bounce" aria-hidden="true">📋</div>
                    <p className="text-gray-500">Loading requests...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-20 text-gray-400">
                    <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p className="text-lg font-medium">No requests found</p>
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100">
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">#</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Patient</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Status</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Ambulance</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Location</th>
                                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wide">Created</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {filtered.map((req, idx) => (
                                    <tr key={req._id} className="hover:bg-gray-50 transition">
                                        <td className="px-4 py-3 text-gray-400 font-mono text-xs">{idx + 1}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-semibold text-gray-800">{req.patientName}</div>
                                            <div className="text-xs text-gray-400 font-mono">{req._id.slice(-6)}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <StatusBadge status={req.status} />
                                        </td>
                                        <td className="px-4 py-3">
                                            {req.ambulance ? (
                                                <span className="text-blue-600 font-medium">🚑 Assigned</span>
                                            ) : (
                                                <span className="text-gray-400">—</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                                            {locationText(req)}
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">
                                            {new Date(req.createdAt).toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminPanel;
