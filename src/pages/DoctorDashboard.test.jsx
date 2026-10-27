import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, act } from '@testing-library/react';
import DoctorDashboard from './DoctorDashboard';
import { renderWithRouter, loginAs, jsonResponse } from '../test/utils';

const socket = vi.hoisted(() => {
    const handlers = {};
    return {
        on: (event, fn) => { handlers[event] = fn; },
        disconnect: () => {},
        emitFromServer: (event, payload) => handlers[event]?.(payload),
    };
});
vi.mock('socket.io-client', () => ({ io: vi.fn(() => socket) }));
vi.mock('react-leaflet', () => ({
    MapContainer: ({ children }) => <div>{children}</div>,
    TileLayer: () => null,
    Marker: () => null,
    Popup: () => null,
}));

const sos = (id, name, status = 'pending') => ({
    _id: id, patientName: name, status, location: { lat: 19.07, lng: 72.87 }, createdAt: '2026-10-27T10:00:00Z',
});

describe('Doctor dashboard', () => {
    beforeEach(() => {
        loginAs('doctor');
        vi.spyOn(globalThis, 'fetch').mockReturnValueOnce(jsonResponse([sos('a', 'Asha Patil')]));
    });

    it('shows a brand-new SOS pushed over Socket.io without a refresh', async () => {
        renderWithRouter(<DoctorDashboard />, { route: '/doctor-dashboard' });
        expect(await screen.findByRole('article', { name: 'SOS from Asha Patil' })).toBeInTheDocument();

        act(() => socket.emitFromServer('requestUpdate', sos('b', 'Ravi Kumar')));

        expect(screen.getByRole('article', { name: 'SOS from Ravi Kumar' })).toBeInTheDocument();
        expect(screen.getAllByRole('article')).toHaveLength(2);
        expect(screen.getAllByRole('button', { name: 'Accept Request' })).toHaveLength(2);
    });

    it('updates an existing card in place instead of duplicating it', async () => {
        renderWithRouter(<DoctorDashboard />, { route: '/doctor-dashboard' });
        await screen.findByRole('article', { name: 'SOS from Asha Patil' });

        act(() => socket.emitFromServer('requestUpdate', sos('a', 'Asha Patil', 'on_the_way')));

        expect(screen.getAllByRole('article')).toHaveLength(1);
        expect(screen.getByRole('button', { name: 'Mark Arrived' })).toBeInTheDocument();
    });
});
