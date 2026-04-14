import { API_BASE } from '../constants/status';

const getHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ─── SOS ─────────────────────────────────────────
export const createSOS = async (payload, token) => {
    const res = await fetch(`${API_BASE}/sos`, {
        method: 'POST',
        headers: getHeaders(token),
        body: JSON.stringify(payload),
    });
    return res.json().then(data => ({ ok: res.ok, data }));
};

// ─── Requests ────────────────────────────────────
export const fetchAllRequests = async () => {
    const res = await fetch(`${API_BASE}/requests`);
    return res.ok ? res.json() : [];
};

export const fetchRequestById = async (id) => {
    const res = await fetch(`${API_BASE}/request/${id}`);
    if (!res.ok) throw new Error('Request not found');
    return res.json();
};

export const acceptRequest = async (id, doctorId, token) => {
    const res = await fetch(`${API_BASE}/request/${id}`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ doctorId }),
    });
    return res.json().then(data => ({ ok: res.ok, data }));
};

export const updateRequestStatus = async (id, status, token) => {
    const res = await fetch(`${API_BASE}/request/${id}/status`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ status }),
    });
    return res.json().then(data => ({ ok: res.ok, data }));
};

export const updateDoctorLocation = async (id, lat, lng, token) => {
    const res = await fetch(`${API_BASE}/request/${id}/location`, {
        method: 'PUT',
        headers: getHeaders(token),
        body: JSON.stringify({ lat, lng }),
    });
    return res.json().then(data => ({ ok: res.ok, data }));
};
