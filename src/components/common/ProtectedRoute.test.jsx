import { describe, it, expect } from 'vitest';
import { screen } from '@testing-library/react';
import ProtectedRoute from './ProtectedRoute';
import RoleRedirect from './RoleRedirect';
import { renderWithRouter, loginAs } from '../../test/utils';

const placeholders = {
    '/login': <p>login page</p>,
    '/home': <p>patient home</p>,
    '/doctor-dashboard': <p>doctor dashboard</p>,
    '/admin': <p>admin panel</p>,
};

const doctorOnly = (
    <ProtectedRoute role="doctor">
        <p>secret doctor page</p>
    </ProtectedRoute>
);

describe('Role-based routing', () => {
    it('sends logged-out users to /login', () => {
        renderWithRouter(doctorOnly, { route: '/doctor-dashboard', path: '/doctor-dashboard', routes: placeholders });
        expect(screen.getByTestId('location')).toHaveTextContent('/login');
        expect(screen.queryByText('secret doctor page')).not.toBeInTheDocument();
    });

    it('lets a doctor into a doctor-only page', () => {
        loginAs('doctor');
        renderWithRouter(doctorOnly, { route: '/doctor-dashboard', path: '/doctor-dashboard', routes: placeholders });
        expect(screen.getByText('secret doctor page')).toBeInTheDocument();
    });

    it('redirects a patient away from a doctor-only page to /home', () => {
        loginAs('patient');
        renderWithRouter(doctorOnly, { route: '/doctor-dashboard', path: '/doctor-dashboard', routes: placeholders });
        expect(screen.getByTestId('location')).toHaveTextContent('/home');
    });

    it('redirects a doctor away from a patient-only page to the dashboard', () => {
        loginAs('doctor');
        renderWithRouter(
            <ProtectedRoute role="patient"><p>sos form</p></ProtectedRoute>,
            { route: '/sos', path: '/sos', routes: placeholders },
        );
        expect(screen.getByTestId('location')).toHaveTextContent('/doctor-dashboard');
    });

    it.each([
        ['patient', '/home'],
        ['doctor', '/doctor-dashboard'],
        ['admin', '/admin'],
    ])('landing page sends a logged-in %s to %s', (role, target) => {
        loginAs(role);
        renderWithRouter(<RoleRedirect><p>landing</p></RoleRedirect>, { route: '/', path: '/', routes: placeholders });
        expect(screen.getByTestId('location')).toHaveTextContent(target);
    });

    it('ignores a corrupt saved session and shows the landing page', () => {
        sessionStorage.setItem('token', 'x');
        sessionStorage.setItem('user', '{not json');
        renderWithRouter(<RoleRedirect><p>landing</p></RoleRedirect>, { route: '/', path: '/', routes: placeholders });
        expect(screen.getByText('landing')).toBeInTheDocument();
        expect(sessionStorage.getItem('token')).toBeNull();
    });
});
