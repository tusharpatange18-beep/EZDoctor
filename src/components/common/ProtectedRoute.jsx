import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

/**
 * ProtectedRoute
 * - Redirects to /login if not authenticated
 * - If `role` prop is set, redirects wrong-role users to their correct page:
 *     doctor → /doctor-dashboard
 *     patient / default → /home
 */
const ProtectedRoute = ({ children, role }) => {
    const { isAuth, user, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-gray-50">
                <div className="text-center">
                    <div className="text-5xl mb-4 animate-bounce">🚑</div>
                    <div className="w-8 h-8 border-4 border-red-300 border-t-red-500 rounded-full animate-spin mx-auto mb-3" />
                    <p className="text-gray-500 font-medium text-sm">Checking access...</p>
                </div>
            </div>
        );
    }

    if (!isAuth) return <Navigate to="/login" replace />;

    // Get role from context (preferred) or sessionStorage fallback
    const userRole = user?.role || sessionStorage.getItem('role');

    if (role && userRole !== role && userRole !== 'admin') {
        // Wrong role: send them to their correct home
        const fallback = userRole === 'doctor' ? '/doctor-dashboard' : '/home';
        return <Navigate to={fallback} replace />;
    }

    return children;
};

export default ProtectedRoute;

