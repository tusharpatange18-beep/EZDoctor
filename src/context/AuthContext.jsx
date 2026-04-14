import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Wipe ALL auth keys atomically — call before writing fresh session
const cleanAuth = () => {
    sessionStorage.removeItem('token');
    sessionStorage.removeItem('user');
    sessionStorage.removeItem('role');
    sessionStorage.removeItem('requestId');
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedToken = sessionStorage.getItem('token');
        const storedUser = sessionStorage.getItem('user');
        if (storedToken && storedUser) {
            try {
                const parsed = JSON.parse(storedUser);
                // Sanity-check: ensure the user object actually has a role
                if (parsed && parsed.role) {
                    setToken(storedToken);
                    setUser(parsed);
                } else {
                    // Corrupt/old session — clean it up
                    cleanAuth();
                }
            } catch {
                cleanAuth(); // JSON parse failed — clear storage
            }
        }
        setLoading(false);
    }, []);

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

export const useAuth = () => useContext(AuthContext);

