import { API_BASE } from '../constants/status';

const getHeaders = (token) => ({
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
});

// ─── Auth ────────────────────────────────────────
export const registerUser = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return res.json().then(data => ({ ok: res.ok, data }));
};

export const loginUser = async (payload) => {
    const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
    });
    return res.json().then(data => ({ ok: res.ok, data }));
};
