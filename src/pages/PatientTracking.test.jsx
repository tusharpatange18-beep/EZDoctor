import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import PatientTracking from './PatientTracking';
import { renderWithRouter, loginAs, jsonResponse } from '../test/utils';

// Fake Socket.io client: records handlers so the test can push server events.
const socket = vi.hoisted(() => {
    const handlers = {};
    return {
        handlers,
        on: (event, fn) => { handlers[event] = fn; },
        disconnect: () => {},
        emitFromServer: (event, payload) => handlers[event]?.(payload),
    };
});
vi.mock('socket.io-client', () => ({ io: vi.fn(() => socket) }));

// Leaflet needs a real layout engine; jsdom doesn't have one.
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
    TileLayer: () => null,
    Marker: ({ children }) => <div data-testid="marker">{children}</div>,
    Popup: ({ children }) => <span>{children}</span>,
}));

const baseRequest = {
    _id: 'req-42',
    patientName: 'Asha Patil',
    status: 'pending',
    location: { lat: 19.076, lng: 72.8777 },
    createdAt: '2026-10-27T10:00:00.000Z',
};

describe('Patient live tracking', () => {
    beforeEach(() => {
        loginAs('patient');
        vi.spyOn(globalThis, 'fetch');
    });

    it('asks for an SOS first when there is no active request', () => {
        renderWithRouter(<PatientTracking />, { route: '/track' });
        expect(screen.getByText(/no sos request found/i)).toBeInTheDocument();
        expect(fetch).not.toHaveBeenCalled();
    });

    it('shows the current status and announces live updates from the server', async () => {
        sessionStorage.setItem('requestId', 'req-42');
        fetch.mockReturnValueOnce(jsonResponse(baseRequest));
        renderWithRouter(<PatientTracking />, { route: '/track' });

        const status = await screen.findByRole('status');
        expect(status).toHaveTextContent('Waiting for ambulance');
        expect(screen.getAllByTestId('marker')).toHaveLength(1); // patient only

        // Doctor accepts and starts moving: server pushes over Socket.io
        act(() => socket.emitFromServer('requestUpdate', {
            ...baseRequest, status: 'on_the_way', ambulance: 'amb-1',
            doctorLocation: { lat: 19.08, lng: 72.88 },
        }));
        expect(status).toHaveTextContent('On the way');
        expect(screen.getAllByTestId('marker')).toHaveLength(2); // patient + ambulance
        expect(screen.getByRole('listitem', { current: 'step' })).toHaveTextContent('On the way');

        // Updates for someone else's request are ignored
        act(() => socket.emitFromServer('requestUpdate', { ...baseRequest, _id: 'other', status: 'completed' }));
        expect(status).toHaveTextContent('On the way');
    });
});
