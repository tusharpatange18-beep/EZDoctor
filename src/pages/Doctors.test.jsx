import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Doctors from './Doctors';
import { renderWithRouter, loginAs, jsonResponse } from '../test/utils';

const DOCTORS = [
    { _id: '1', name: 'Dr. Rahul Sharma', specialization: 'Cardiologist', experience: 12, location: 'Mumbai', rating: 4.9 },
    { _id: '2', name: 'Dr. Priya Desai', specialization: 'Pediatrician', experience: 8, location: 'Pune', rating: 4.7 },
    { _id: '3', name: 'Dr. Amit Kulkarni', specialization: 'Cardiologist', experience: 15, location: 'Nashik', rating: 4.6 },
];

const cardNames = () => screen.getAllByRole('heading', { level: 2 }).map(h => h.textContent);

describe('Doctor search and booking', () => {
    beforeEach(() => {
        vi.spyOn(globalThis, 'fetch').mockReturnValue(jsonResponse(DOCTORS));
    });

    it('filters by specialization chip and by search text', async () => {
        const user = userEvent.setup();
        renderWithRouter(<Doctors />, { route: '/doctors' });
        await screen.findByText('Dr. Rahul Sharma');
        expect(cardNames()).toHaveLength(3);

        const filters = screen.getByRole('group', { name: 'Filter by specialization' });
        await user.click(within(filters).getByRole('button', { name: 'Cardiologist' }));
        expect(within(filters).getByRole('button', { name: 'Cardiologist' })).toHaveAttribute('aria-pressed', 'true');
        expect(cardNames()).toEqual(['Dr. Rahul Sharma', 'Dr. Amit Kulkarni']);

        await user.type(screen.getByRole('searchbox', { name: 'Search doctors' }), 'nashik');
        expect(cardNames()).toEqual(['Dr. Amit Kulkarni']);
        expect(screen.getByText(/showing/i)).toHaveTextContent('Showing 1 doctor');

        await user.clear(screen.getByRole('searchbox', { name: 'Search doctors' }));
        await user.type(screen.getByRole('searchbox', { name: 'Search doctors' }), 'zzz');
        expect(screen.getByText('No doctors found')).toBeInTheDocument();
    });

    it('sends a logged-out visitor to login when they try to book', async () => {
        const user = userEvent.setup();
        renderWithRouter(<Doctors />, { route: '/doctors', routes: { '/login': <p>login</p> } });
        await user.click(await screen.findByRole('button', { name: 'Book appointment with Dr. Priya Desai' }));
        expect(screen.getByTestId('location')).toHaveTextContent('/login');
    });

    it('booking dialog is keyboard friendly and validates the time slot', async () => {
        loginAs('patient');
        const user = userEvent.setup();
        renderWithRouter(<Doctors />, { route: '/doctors' });
        const bookBtn = await screen.findByRole('button', { name: 'Book appointment with Dr. Rahul Sharma' });
        await user.click(bookBtn);

        const dialog = screen.getByRole('dialog', { name: 'Dr. Rahul Sharma' });
        expect(dialog).toHaveFocus();

        await user.click(within(dialog).getByRole('button', { name: 'Confirm Appointment' }));
        expect(within(dialog).getByRole('alert')).toHaveTextContent('Please select a time slot');

        await user.keyboard('{Escape}');
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
        expect(bookBtn).toHaveFocus(); // focus returns to the trigger
    });
});
