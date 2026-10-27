import { test, expect } from '@playwright/test';

const API = 'http://localhost:5055/api';
const MUMBAI = { latitude: 19.076, longitude: 72.8777 };
const stamp = Date.now();
const patient = { name: 'E2E Patient', email: `patient-${stamp}@e2e.test`, password: 'secret123', role: 'patient' };
const doctor = { name: 'E2E Doctor', email: `doctor-${stamp}@e2e.test`, password: 'secret123', role: 'doctor' };

// Map tiles come from the internet; they aren't part of what we test
const blockTiles = (page) => page.route(/tile\.openstreetmap\.org/, (route) => route.abort());

const signIn = async (page, account) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(account.email);
    await page.getByLabel('Password').fill(account.password);
    await page.getByRole('button', { name: /sign in/i }).click();
};

test.beforeAll(async ({ request }) => {
    for (const account of [patient, doctor]) {
        const res = await request.post(`${API}/auth/register`, { data: account });
        expect(res.status(), await res.text()).toBe(201);
    }
});

test('full SOS lifecycle: patient sends SOS, doctor handles it, patient sees every status live', async ({ browser }) => {
    // Two separate browser sessions, like two real users
    const doctorCtx = await browser.newContext();
    const patientCtx = await browser.newContext({ geolocation: MUMBAI, permissions: ['geolocation'] });
    const doctorPage = await doctorCtx.newPage();
    const patientPage = await patientCtx.newPage();
    await blockTiles(doctorPage);
    await blockTiles(patientPage);

    // Doctor is already watching the dashboard before the SOS exists
    await signIn(doctorPage, doctor);
    await expect(doctorPage).toHaveURL(/\/doctor-dashboard$/);
    await expect(doctorPage.getByRole('heading', { name: 'Doctor Dashboard' })).toBeVisible();

    // Patient sends an SOS
    await signIn(patientPage, patient);
    await expect(patientPage).toHaveURL(/\/home$/);
    await patientPage.getByRole('button', { name: 'Send emergency SOS' }).click();
    await patientPage.getByLabel('Phone Number').fill('9876543210');
    await patientPage.getByLabel('Emergency Type').selectOption('Chest Pain');
    await patientPage.getByLabel('Symptoms').fill('Sudden chest pain');
    await patientPage.getByRole('button', { name: /send sos request/i }).click();

    await expect(patientPage).toHaveURL(/\/track$/);
    const patientStatus = patientPage.getByRole('status').filter({ hasText: 'SOS status' });
    await expect(patientStatus).toContainText('Waiting for ambulance');

    // The new SOS reaches the doctor in real time (no reload)
    const card = doctorPage.getByRole('article', { name: 'SOS from E2E Patient' });
    await expect(card).toBeVisible();
    await expect(card).toContainText('Sudden chest pain');

    // Doctor accepts -> nearest ambulance assigned -> moving
    await card.getByRole('button', { name: 'Accept Request' }).click();
    await expect(card).toContainText('Ambulance assigned');
    await expect(patientStatus).toContainText(/Ambulance assigned|On the way/);
    await expect(patientStatus).toContainText('On the way'); // first location ping

    await card.getByRole('button', { name: 'Mark Arrived' }).click();
    await expect(patientStatus).toContainText('Reached location');

    await card.getByRole('button', { name: 'Mark Completed' }).click();
    await expect(card).toContainText('Case Closed');
    await expect(patientStatus).toContainText('Completed');

    await doctorCtx.close();
    await patientCtx.close();
});

test('self-registration cannot create an admin account', async ({ request }) => {
    const res = await request.post(`${API}/auth/register`, {
        data: { name: 'Mallory', email: `mallory-${stamp}@e2e.test`, password: 'secret123', role: 'admin' },
    });
    expect(res.status()).toBe(201);
    expect((await res.json()).user.role).toBe('patient');
});
