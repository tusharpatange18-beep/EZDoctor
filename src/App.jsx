import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Home from './pages/Home';
import SOS from './pages/SOS';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminPanel from './pages/AdminPanel';
import Login from './pages/Login';
import Register from './pages/Register';
import PatientTracking from './pages/PatientTracking';
import Doctors from './pages/Doctors';
import MyAppointments from './pages/MyAppointments';
import ProtectedRoute from './components/common/ProtectedRoute';
import RoleRedirect from './components/common/RoleRedirect';
import { AuthProvider } from './context/AuthContext';
import "leaflet/dist/leaflet.css";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
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
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
