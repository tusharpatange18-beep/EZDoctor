import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SOS from './SOS';
import SOSButton from '../components/ui/SOSButton';
import { renderWithRouter, loginAs, jsonResponse } from '../test/utils';

const mockGeolocation = (impl) => {
    Object.defineProperty(navigator, 'geolocation', {
        configurable: true,
        value: { getCurrentPosition: vi.fn(impl) },
    });
};

describe('SOS', () => {
    beforeEach(() => {
        vi.spyOn(globalThis, 'fetch');
        loginAs('patient', { name: 'Asha Patil' });
    });

    it('home SOS button has an accessible name and opens the SOS form', async () => {
        const user = userEvent.setup();
        renderWithRouter(<SOSButton />, { route: '/', path: '/', routes: { '/sos': <p>sos form</p> } });
        await user.click(screen.getByRole('button', { name: 'Send emergency SOS' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/sos');
    });

    it('sends the GPS location with the SOS and moves to live tracking', async () => {
        mockGeolocation((ok) => ok({ coords: { latitude: 19.076, longitude: 72.8777 } }));
        fetch.mockReturnValueOnce(jsonResponse({ _id: 'req-42', status: 'pending' }, 201));
        const user = userEvent.setup();
        renderWithRouter(<SOS />, { route: '/sos', routes: { '/track': <p>tracking</p> } });

        expect(screen.getByLabelText('Patient Name')).toHaveValue('Asha Patil');
        await user.type(screen.getByLabelText('Phone Number'), '9876543210');
        await user.selectOptions(screen.getByLabelText('Emergency Type'), 'Chest Pain');
        await user.type(screen.getByLabelText('Symptoms'), 'Pain in left arm');
        await user.click(screen.getByRole('button', { name: /send sos request/i }));

        await waitFor(() => expect(fetch).toHaveBeenCalledTimes(1));
        const [url, init] = fetch.mock.calls[0];
        expect(url).toBe('http://api.test/api/sos');
        expect(init.headers.Authorization).toBe('Bearer test-token');
        expect(JSON.parse(init.body)).toEqual({
            patientName: 'Asha Patil',
            location: { lat: 19.076, lng: 72.8777 },
            symptoms: 'Pain in left arm',
            type: 'Chest Pain',
        });
        expect(await screen.findByText(/sos sent/i)).toBeInTheDocument();
        expect(sessionStorage.getItem('requestId')).toBe('req-42');
        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/track'), { timeout: 2000 });
    });

    it('tells the user when GPS permission is denied and sends nothing', async () => {
        mockGeolocation((_ok, fail) => fail({ code: 1, message: 'denied' }));
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const user = userEvent.setup();
        renderWithRouter(<SOS />, { route: '/sos' });

        await user.type(screen.getByLabelText('Phone Number'), '9876543210');
        await user.click(screen.getByRole('button', { name: /send sos request/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/location access denied/i);
        expect(fetch).not.toHaveBeenCalled();
    });
});
