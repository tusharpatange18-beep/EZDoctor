import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRedirect from './components/common/RoleRedirect';
import PageLoader from './components/common/PageLoader';
import { AuthProvider } from './context/AuthContext';

// Route-level code splitting: each page (and heavy deps like Leaflet and
// socket.io-client) is downloaded only when its route is visited.
const Home = lazy(() => import('./pages/Home'));
const SOS = lazy(() => import('./pages/SOS'));
const DoctorDashboard = lazy(() => import('./pages/DoctorDashboard'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const PatientTracking = lazy(() => import('./pages/PatientTracking'));
const Doctors = lazy(() => import('./pages/Doctors'));
const MyAppointments = lazy(() => import('./pages/MyAppointments'));

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public routes */}
              <Route path="/" element={<RoleRedirect><Home /></RoleRedirect>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/doctors" element={<Doctors />} />

              {/* Patient-only routes */}
              <Route path="/home" element={
                <ProtectedRoute role="patient">
                  <Home />
                </ProtectedRoute>
              } />
              <Route path="/sos" element={
                <ProtectedRoute role="patient">
                  <SOS />
                </ProtectedRoute>
              } />
              <Route path="/track" element={
                <ProtectedRoute role="patient">
                  <PatientTracking />
                </ProtectedRoute>
              } />
              <Route path="/my-appointments" element={
                <ProtectedRoute role="patient">
                  <MyAppointments />
                </ProtectedRoute>
              } />

              {/* Doctor-only routes */}
              <Route path="/doctor-dashboard" element={
                <ProtectedRoute role="doctor">
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              {/* Legacy alias — redirect /doctor → /doctor-dashboard */}
              <Route path="/doctor" element={<Navigate to="/doctor-dashboard" replace />} />

              {/* Admin-only routes */}
              <Route path="/admin" element={
                <ProtectedRoute role="admin">
                  <AdminPanel />
                </ProtectedRoute>
              } />

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </Suspense>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
