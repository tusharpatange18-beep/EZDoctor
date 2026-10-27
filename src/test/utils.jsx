import { render } from '@testing-library/react';
import { MemoryRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';

/** Shows the current path so tests can assert on redirects. */
export const LocationProbe = () => {
    const { pathname } = useLocation();
    return <div data-testid="location">{pathname}</div>;
};

/** Store a logged-in session the way AuthContext.login does. */
export const loginAs = (role, extra = {}) => {
    const user = { _id: `${role}-1`, name: `Test ${role}`, email: `${role}@test.com`, role, ...extra };
    sessionStorage.setItem('token', 'test-token');
    sessionStorage.setItem('user', JSON.stringify(user));
    sessionStorage.setItem('role', role);
    return user;
};

/**
 * Render `ui` at `route` inside AuthProvider + MemoryRouter.
 * `routes` maps extra paths to placeholder elements so redirects can be observed.
 */
export const renderWithRouter = (ui, { route = '/', path = '*', routes = {} } = {}) =>
    render(
        <AuthProvider>
            <MemoryRouter initialEntries={[route]}>
                <Routes>
                    <Route path={path} element={ui} />
                    {Object.entries(routes).map(([p, el]) => (
                        <Route key={p} path={p} element={el} />
                    ))}
                </Routes>
                <LocationProbe />
            </MemoryRouter>
        </AuthProvider>,
    );

/** Minimal fetch Response stand-in. */
export const jsonResponse = (body, status = 200) =>
    Promise.resolve({ ok: status >= 200 && status < 300, status, json: () => Promise.resolve(body) });
