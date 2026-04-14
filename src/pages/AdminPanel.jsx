import { useEffect, useState } from 'react';
import { RefreshCw, Activity } from 'lucide-react';
import { STATUS_CONFIG } from '../constants/status';
import StatusBadge from '../components/ui/StatusBadge';
import useSocket from '../hooks/useSocket';
import { fetchAllRequests } from '../api/requests';

const AdminPanel = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    const loadRequests = () => {
        setLoading(true);
        fetchAllRequests()
            .then(data => {
                setRequests(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        loadRequests();
    }, []);

    // Live updates via useSocket hook
    useSocket({
        requestUpdate: (updated) => setRequests(prev => prev.map(r => r._id === updated._id ? updated : r)),
        locationUpdate: (updated) => setRequests(prev => prev.map(r => r._id === updated._id ? updated : r)),
    });


    const filtered = filter === 'all' ? requests : requests.filter(r => r.status === filter);

    const counts = Object.keys(STATUS_CONFIG).reduce((acc, key) => {
        acc[key] = requests.filter(r => r.status === key).length;
        return acc;
    }, {});

    return (
        <div className="max-w-7xl mx-auto px-4 py-10">

            {/* Header */}
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">🔧 Admin Panel</h1>
                    <p className="text-gray-500 mt-1">Monitor all emergency requests in real-time</p>
                </div>
                <button
                    onClick={loadRequests}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition shadow-sm"
                >
                    <RefreshCw className="w-4 h-4" /> Refresh
                </button>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mb-8">
                <div
                    onClick={() => setFilter('all')}
                    className={`cursor-pointer rounded-xl p-3 text-center border transition ${filter === 'all' ? 'bg-gray-900 text-white border-gray-900' : 'bg-white border-gray-200 hover:border-gray-400'}`}
                >
                    <div className="text-xl font-bold">{requests.length}</div>
                    <div className="text-xs mt-0.5 opacity-70">All</div>
                </div>
                {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                    <div
                        key={key}
                        onClick={() => setFilter(key)}
                        className={`cursor-pointer rounded-xl p-3 text-center border transition ${filter === key ? `${cfg.bg} border-current` : 'bg-white border-gray-200 hover:border-gray-300'}`}
                    >
                        <div className="text-xl font-bold">{counts[key] || 0}</div>
                        <div className="text-xs mt-0.5 opacity-70">{cfg.label}</div>
                    </div>
                ))}
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center py-20">
                    <div className="text-5xl mb-4 animate-bounce">📋</div>
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
                                            {req.location?.lat
                                                ? `${req.location.lat.toFixed(4)}, ${req.location.lng.toFixed(4)}`
                                                : '—'}
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
