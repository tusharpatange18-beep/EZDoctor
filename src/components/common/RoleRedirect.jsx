import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * RoleRedirect — wraps the public landing page ("/")
 *
 * Behaviour:
 *  - While auth is loading → render nothing (avoid flash)
 *  - Logged-out user → show landing page (children)
 *  - Doctor logged in  → /doctor-dashboard
 *  - Patient logged in → /home
 *  - Admin logged in   → /admin
 *
 * Uses BOTH context state and sessionStorage so there's
 * no race condition between the two.
 */
const RoleRedirect = ({ children }) => {
    const { isAuth, user, loading } = useAuth();

    // Always wait for hydration — never redirect based on stale state
    if (loading) return null;

    // Not logged in → show landing page
    if (!isAuth || !user) return children;

    // Logged in → bounce to role-specific home
    const role = user.role || sessionStorage.getItem('role');

    if (role === 'doctor')  return <Navigate to="/doctor-dashboard" replace />;
    if (role === 'admin')   return <Navigate to="/admin" replace />;
    if (role === 'patient') return <Navigate to="/home" replace />;

    // Unknown role → show landing
    return children;
};

export default RoleRedirect;

