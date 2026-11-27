import { test, expect } from '@playwright/test';

// Server-side rules that the UI tests can't see: who may call what, and double accepts.
// Talks straight to the test backend (see e2e/test-backend.cjs).
const API = 'http://localhost:5055/api';
const stamp = Date.now();
const patient = { name: 'Rules Patient', email: `rules-patient-${stamp}@e2e.test`, password: 'secret123', role: 'patient' };
const doctor = { name: 'Rules Doctor', email: `rules-doctor-${stamp}@e2e.test`, password: 'secret123', role: 'doctor' };
const MUMBAI = { lat: 19.076, lng: 72.8777 };

let patientToken;
let doctorToken;

const auth = (token) => ({ Authorization: `Bearer ${token}` });

test.beforeAll(async ({ request }) => {
    for (const account of [patient, doctor]) {
        const res = await request.post(`${API}/auth/register`, { data: account });
        expect(res.status(), await res.text()).toBe(201);
        const body = await res.json();
        if (account.role === 'patient') patientToken = body.token;
        else doctorToken = body.token;
    }
});

/** Sends an SOS (public on purpose: an emergency must never need a login) and returns its id. */
async function newSOS(request, name) {
    const res = await request.post(`${API}/sos`, { data: { patientName: name, location: MUMBAI, type: 'Accident' } });
    expect(res.status()).toBe(201);
    return (await res.json())._id;
}

test('SOS endpoints for staff need a login', async ({ request }) => {
    const id = await newSOS(request, 'No Login Test');

    // No token at all -> 401
    expect((await request.get(`${API}/requests`)).status()).toBe(401);
    expect((await request.put(`${API}/request/${id}`, { data: { doctorId: 'x' } })).status()).toBe(401);
    expect((await request.put(`${API}/request/${id}/status`, { data: { status: 'completed' } })).status()).toBe(401);
    expect((await request.put(`${API}/request/${id}/location`, { data: MUMBAI })).status()).toBe(401);
    expect((await request.put(`${API}/request/${id}/ambulance-location`, { data: MUMBAI })).status()).toBe(401);

    // Patients may not act as staff -> 403
    expect((await request.get(`${API}/requests`, { headers: auth(patientToken) })).status()).toBe(403);
    expect((await request.put(`${API}/request/${id}/status`, { headers: auth(patientToken), data: { status: 'completed' } })).status()).toBe(403);

    // Still public: sending an SOS (above) and tracking your own one
    expect((await request.get(`${API}/request/${id}`)).status()).toBe(200);
});

test('only admins may add doctors or change their availability', async ({ request }) => {
    const newDoctor = { name: 'Dr. Fake', specialization: 'Dentist', experience: 1, location: 'Pune', phone: '9000000000' };
    expect((await request.post(`${API}/doctor`, { data: newDoctor })).status()).toBe(401);
    expect((await request.post(`${API}/doctor`, { headers: auth(doctorToken), data: newDoctor })).status()).toBe(403);

    const doctors = await (await request.get(`${API}/doctors`)).json();
    const someId = doctors[0]._id;
    expect((await request.patch(`${API}/doctor/${someId}/availability`, { data: { available: false } })).status()).toBe(401);
    // Public list is still public
    expect(doctors.length).toBeGreaterThan(0);
});

test('an SOS can be accepted only once', async ({ request }) => {
    const id = await newSOS(request, 'Double Accept Test');

    const first = await request.put(`${API}/request/${id}`, { headers: auth(doctorToken), data: {} });
    expect(first.status(), await first.text()).toBe(200);
    const accepted = await first.json();
    expect(accepted.status).toBe('accepted');
    expect(accepted.ambulance).toBeTruthy();

    // A second accept must not grab another ambulance or change the first one
    const second = await request.put(`${API}/request/${id}`, { headers: auth(doctorToken), data: {} });
    expect(second.status()).toBe(409);
    const after = await (await request.get(`${API}/request/${id}`)).json();
    expect(after.ambulance).toBe(accepted.ambulance);

    // Finish the job so the ambulance is free again for the other tests
    const done = await request.put(`${API}/request/${id}/status`, { headers: auth(doctorToken), data: { status: 'completed' } });
    expect(done.status()).toBe(200);
});
