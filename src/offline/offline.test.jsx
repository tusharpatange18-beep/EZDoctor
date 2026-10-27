import { describe, it, expect, vi, afterEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { enqueueSOS, getQueuedSOS } from './db';
import { flushSOSQueue, SOS_SENT_EVENT } from './sosQueue';
import SOS from '../pages/SOS';
import Doctors from '../pages/Doctors';
import { renderWithRouter, loginAs, jsonResponse } from '../test/utils';

const payload = (name) => ({ patientName: name, location: { lat: 19.07, lng: 72.87 }, symptoms: '', type: 'Fever' });

const setOnline = (value) => Object.defineProperty(navigator, 'onLine', { configurable: true, get: () => value });
afterEach(() => setOnline(true));

describe('Offline SOS queue (IndexedDB)', () => {
    it('sends queued SOS requests in order once the network is back', async () => {
        await enqueueSOS(payload('first'), 't1');
        await enqueueSOS(payload('second'), 't2');
        const onSent = vi.fn();
        window.addEventListener(SOS_SENT_EVENT, onSent);

        // Still offline after the first one: keep the rest
        const send = vi.fn()
            .mockResolvedValueOnce({ ok: true, data: { _id: 'r1' } })
            .mockRejectedValueOnce(new TypeError('Failed to fetch'));
        let result = await flushSOSQueue(send);
        expect(result.sent).toHaveLength(1);
        expect((await getQueuedSOS()).map(i => i.payload.patientName)).toEqual(['second']);
        expect(sessionStorage.getItem('requestId')).toBe('r1');

        // Connection fully back
        send.mockResolvedValueOnce({ ok: true, data: { _id: 'r2' } });
        result = await flushSOSQueue(send);
        expect(send).toHaveBeenLastCalledWith(payload('second'), 't2');
        expect(await getQueuedSOS()).toEqual([]);
        expect(sessionStorage.getItem('requestId')).toBe('r2');
        expect(onSent).toHaveBeenCalledTimes(2);
        window.removeEventListener(SOS_SENT_EVENT, onSent);
    });

    it('drops an SOS the server rejects instead of retrying forever', async () => {
        await enqueueSOS(payload('bad'), 't');
        const { sent, failed } = await flushSOSQueue(vi.fn().mockResolvedValue({ ok: false, data: { message: 'invalid' } }));
        expect(sent).toEqual([]);
        expect(failed).toHaveLength(1);
        expect(await getQueuedSOS()).toEqual([]);
    });

    it('never sends the same SOS twice when two flushes overlap', async () => {
        await enqueueSOS(payload('once'), 't');
        const send = vi.fn().mockResolvedValue({ ok: true, data: { _id: 'r1' } });
        await Promise.all([flushSOSQueue(send), flushSOSQueue(send)]);
        expect(send).toHaveBeenCalledTimes(1);
    });

    it('SOS page saves the request on the device when offline', async () => {
        loginAs('patient', { name: 'Asha Patil' });
        setOnline(false);
        Object.defineProperty(navigator, 'geolocation', {
            configurable: true,
            value: { getCurrentPosition: (ok) => ok({ coords: { latitude: 19.07, longitude: 72.87 } }) },
        });
        const fetchSpy = vi.spyOn(globalThis, 'fetch');
        const user = userEvent.setup();
        renderWithRouter(<SOS />, { route: '/sos' });

        await user.type(screen.getByLabelText('Phone Number'), '9876543210');
        await user.click(screen.getByRole('button', { name: /send sos request/i }));

        const heading = await screen.findByRole('heading', { name: 'No connection: SOS saved' });
        const alert = heading.closest('[role="alert"]');
        expect(alert).toBeInTheDocument();
        expect(within(alert).getByRole('link', { name: /call 108/i })).toHaveAttribute('href', 'tel:108');
        expect(fetchSpy).not.toHaveBeenCalled();
        const queued = await getQueuedSOS();
        expect(queued).toHaveLength(1);
        expect(queued[0].payload).toMatchObject({ patientName: 'Asha Patil', location: { lat: 19.07, lng: 72.87 } });
        expect(queued[0].token).toBe('test-token');
    });
});

describe('Doctors offline and optimistic booking', () => {
    const DOCTORS = [{ _id: '1', name: 'Dr. Rahul Sharma', specialization: 'Cardiologist', experience: 12, location: 'Mumbai', rating: 4.9 }];

    it('shows the last saved doctor list when the network is down', async () => {
        vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(jsonResponse(DOCTORS));
        const first = renderWithRouter(<Doctors />, { route: '/doctors' });
        await screen.findByText('Dr. Rahul Sharma');
        await waitFor(async () => expect(await import('./db').then(m => m.loadDoctors())).not.toBeNull());
        first.unmount();

        fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
        renderWithRouter(<Doctors />, { route: '/doctors' });
        expect(await screen.findByText(/you're offline\. showing doctors saved on/i)).toBeInTheDocument();
        expect(screen.getByText('Dr. Rahul Sharma')).toBeInTheDocument();
    });

    it('confirms a booking instantly and rolls back if the server fails', async () => {
        loginAs('patient');
        let rejectBooking;
        vi.spyOn(globalThis, 'fetch')
            .mockReturnValueOnce(jsonResponse(DOCTORS))
            .mockReturnValueOnce(new Promise((_, reject) => { rejectBooking = reject; }));
        const user = userEvent.setup();
        renderWithRouter(<Doctors />, { route: '/doctors' });

        await user.click(await screen.findByRole('button', { name: 'Book appointment with Dr. Rahul Sharma' }));
        const dialog = screen.getByRole('dialog');
        await user.click(within(dialog).getByRole('button', { name: '10:00 AM' }));
        await user.click(within(dialog).getByRole('button', { name: 'Confirm Appointment' }));

        // Optimistic: success shows before the server answers
        expect(within(dialog).getByText('Appointment Booked!')).toBeInTheDocument();
        expect(within(dialog).getByText('Saving to your appointments…')).toBeInTheDocument();

        rejectBooking(new TypeError('Failed to fetch'));
        expect(await within(dialog).findByRole('alert')).toHaveTextContent('Your appointment was not saved');
        expect(within(dialog).queryByText('Appointment Booked!')).not.toBeInTheDocument();
        expect(within(dialog).getByRole('button', { name: '10:00 AM' })).toHaveAttribute('aria-pressed', 'true'); // choice kept
    });
});
