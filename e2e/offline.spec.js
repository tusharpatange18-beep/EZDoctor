import { test, expect } from '@playwright/test';

const API = 'http://localhost:5055/api';

// Wait until the service worker has installed and controls the page
const waitForServiceWorker = (page) =>
    page.waitForFunction(async () => {
        await navigator.serviceWorker.ready;
        return !!navigator.serviceWorker.controller;
    });

test('app shell and doctor list still load with no network', async ({ page, context }) => {
    await page.goto('/doctors');
    await expect(page.getByText('Dr. Rahul Sharma')).toBeVisible();
    await waitForServiceWorker(page);

    await context.setOffline(true);
    await page.reload();

    await expect(page.getByText(/you're offline\. saved pages still work/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Find the Right Doctor' })).toBeVisible();
    await expect(page.getByText('Dr. Rahul Sharma')).toBeVisible();
    await context.setOffline(false);
});

test('an SOS made offline is queued and sent automatically on reconnect', async ({ browser }) => {
    const context = await browser.newContext({ geolocation: { latitude: 19.07, longitude: 72.87 }, permissions: ['geolocation'] });
    const page = await context.newPage();
    const email = `offline-${Date.now()}@e2e.test`;
    await page.request.post(`${API}/auth/register`, { data: { name: 'Offline Patient', email, password: 'secret123', role: 'patient' } });

    await page.goto('/login');
    await page.getByLabel('Email').fill(email);
    await page.getByLabel('Password').fill('secret123');
    await page.getByRole('button', { name: /sign in/i }).click();
    await expect(page).toHaveURL(/\/home$/);
    await page.getByRole('button', { name: 'Send emergency SOS' }).click();
    await waitForServiceWorker(page);

    // Signal drops while filling in the form
    await context.setOffline(true);
    await page.getByLabel('Phone Number').fill('9876543210');
    await page.getByLabel('Symptoms').fill('High fever, no signal');
    await page.getByRole('button', { name: /send sos request/i }).click();
    await expect(page.getByRole('heading', { name: 'No connection: SOS saved' })).toBeVisible();
    await expect(page.getByRole('link', { name: /call 108/i })).toHaveAttribute('href', 'tel:108');

    // Signal returns: the queued SOS goes out by itself and tracking opens
    await context.setOffline(false);
    await expect(page.getByText(/back online: your saved sos was sent/i)).toBeVisible();
    await expect(page).toHaveURL(/\/track$/);
    await expect(page.getByRole('status').filter({ hasText: 'SOS status' })).toContainText('Waiting for ambulance');

    // And it really reached the server
    const all = await (await page.request.get(`${API}/requests`)).json();
    expect(all.some(r => r.patientName === 'Offline Patient' && r.symptoms === 'High fever, no signal')).toBe(true);
    await context.close();
});
