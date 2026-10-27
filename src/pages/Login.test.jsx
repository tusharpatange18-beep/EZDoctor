import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Login from './Login';
import { renderWithRouter, jsonResponse } from '../test/utils';

describe('Login page', () => {
    beforeEach(() => {
        vi.spyOn(globalThis, 'fetch');
    });

    it('labels its inputs so they can be found by role and name', () => {
        renderWithRouter(<Login />, { route: '/login' });
        expect(screen.getByRole('textbox', { name: 'Email' })).toBeRequired();
        expect(screen.getByLabelText('Password')).toHaveAttribute('type', 'password');
    });

    it('shows the server error message in an alert when login fails', async () => {
        fetch.mockReturnValueOnce(jsonResponse({ message: 'Invalid email or password' }, 401));
        const user = userEvent.setup();
        renderWithRouter(<Login />, { route: '/login' });

        await user.type(screen.getByLabelText('Email'), 'nobody@test.com');
        await user.type(screen.getByLabelText('Password'), 'wrong-pass');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Invalid email or password');
        expect(fetch).toHaveBeenCalledWith('http://api.test/api/auth/login', expect.objectContaining({ method: 'POST' }));
        expect(sessionStorage.getItem('token')).toBeNull();
    });

    it('shows a friendly error when the backend is unreachable', async () => {
        fetch.mockRejectedValueOnce(new TypeError('Failed to fetch'));
        const user = userEvent.setup();
        renderWithRouter(<Login />, { route: '/login' });

        await user.type(screen.getByLabelText('Email'), 'a@test.com');
        await user.type(screen.getByLabelText('Password'), 'secret1');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent(/server error/i);
    });

    it('stores the session and sends a doctor to the doctor dashboard', async () => {
        fetch.mockReturnValueOnce(jsonResponse({
            token: 'jwt-123',
            user: { _id: 'd1', name: 'Dr. Rao', email: 'doctor@demo.com', role: 'doctor' },
        }));
        const user = userEvent.setup();
        renderWithRouter(<Login />, { route: '/login', routes: { '/doctor-dashboard': <p>dashboard</p> } });

        await user.click(screen.getByRole('button', { name: 'Doctor Demo' }));
        expect(screen.getByLabelText('Email')).toHaveValue('doctor@demo.com');
        await user.click(screen.getByRole('button', { name: /sign in/i }));

        await waitFor(() => expect(screen.getByTestId('location')).toHaveTextContent('/doctor-dashboard'));
        expect(sessionStorage.getItem('token')).toBe('jwt-123');
        expect(JSON.parse(sessionStorage.getItem('user')).role).toBe('doctor');
    });
});
