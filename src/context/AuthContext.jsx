import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

// Wipe ALL auth keys atomically — call before writing fresh session
const cleanAuth = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('requestId');
};

// Read the saved session synchronously so the first render already knows who is
// logged in. (Hydrating in an effect rendered an empty page for one frame, which
// made the footer jump and caused a large layout shift.)
const readSession = () => {
    const storedToken = sessionStorage.getItem('token');
    const storedUser = sessionStorage.getItem('user');
    if (!storedToken || !storedUser) return { token: null, user: null };
    try {
        const parsed = JSON.parse(storedUser);
        // Sanity-check: ensure the user object actually has a role
        if (parsed && parsed.role) return { token: storedToken, user: parsed };
    } catch {
        // JSON parse failed — fall through and clear storage
    }
    cleanAuth(); // Corrupt/old session — clean it up
    return { token: null, user: null };
};

export const AuthProvider = ({ children }) => {
    const [session] = useState(readSession);
    const [user, setUser] = useState(session.user);
    const [token, setToken] = useState(session.token);
    const loading = false; // kept for consumers; hydration is now synchronous

    const login = (newToken, newUser) => {
        // Always wipe old session before writing new one
        // This prevents cross-role contamination (e.g. doctor → patient)
        cleanAuth();
        sessionStorage.setItem('token', newToken);
        sessionStorage.setItem('user', JSON.stringify(newUser));
        sessionStorage.setItem('role', newUser.role); // convenience key
        setToken(newToken);
        setUser(newUser);
    };

    const logout = () => {
        cleanAuth();
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, loading, isAuth: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);

