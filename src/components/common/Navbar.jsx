import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { PhoneCall, Menu, X, LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout, isAuth } = useAuth();

  const handleScroll = (id) => {
    if (location.pathname !== '/') {
      window.location.href = `/#${id}`;
    } else {
      const element = document.getElementById(id);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleLabel = user?.role === 'doctor' ? 'Doctor' : user?.role === 'admin' ? 'Admin' : 'Patient';

  return (
    <nav className="sticky top-0 z-50 bg-white shadow-sm w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">

          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="text-red-600 font-bold text-3xl tracking-tight">EZDoc</Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex space-x-8 items-center">
            <button onClick={() => handleScroll('home')} className="text-gray-600 hover:text-red-600 font-medium transition-colors cursor-pointer">Home</button>
            <button onClick={() => handleScroll('how-it-works')} className="text-gray-600 hover:text-red-600 font-medium transition-colors cursor-pointer">How It Works</button>
            <button onClick={() => handleScroll('features')} className="text-gray-600 hover:text-red-600 font-medium transition-colors cursor-pointer">Features</button>
            <Link to="/doctors" className="text-gray-600 hover:text-red-600 font-medium transition-colors">Doctors</Link>
          </div>

          {/* Desktop Auth / CTA */}
          <div className="hidden md:flex items-center gap-3">
            {isAuth ? (
              <>
                {/* Role chip */}
                <div className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-700">
                  <User className="w-3.5 h-3.5" />
                  <span>{user?.name}</span>
                  <span className="text-xs text-gray-400">· {roleLabel}</span>
                </div>

                {/* Dashboard link */}
                {user?.role === 'doctor' && (
                  <Link to="/doctor-dashboard" className="text-sm font-semibold text-blue-600 hover:underline">Dashboard</Link>
                )}
                {user?.role === 'patient' && (
                  <>
                    <Link to="/my-appointments" className="text-sm font-semibold text-gray-600 hover:text-red-500 hover:underline">Appointments</Link>
                    <Link to="/sos" className="bg-red-500 hover:bg-red-600 text-white px-5 py-2 rounded-full font-semibold text-sm transition-colors shadow-md flex items-center gap-1.5">
                      <PhoneCall className="w-4 h-4" /> SOS
                    </Link>
                  </>
                )}
                {user?.role === 'admin' && (
                  <Link to="/admin" className="text-sm font-semibold text-purple-600 hover:underline">Admin Panel</Link>
                )}

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-red-600 transition font-medium"
                >
                  <LogOut className="w-4 h-4" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-red-600 font-medium text-sm transition">Sign In</Link>
                <Link to="/register" className="bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-full font-semibold transition-colors shadow-md flex items-center gap-2 text-sm">
                  <PhoneCall className="w-4 h-4" />
                  Get Help Now
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-red-600 focus:outline-none">
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-4 pt-2 pb-4 space-y-1">
            <button onClick={() => handleScroll('home')} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium rounded-md text-sm">Home</button>
            <button onClick={() => handleScroll('how-it-works')} className="block w-full text-left px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium rounded-md text-sm">How It Works</button>
            <Link to="/doctors" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium rounded-md text-sm">Doctors</Link>

            {isAuth ? (
              <>
                <div className="px-3 py-2 text-sm text-gray-500">{roleLabel} — {user?.name}</div>
                {user?.role === 'patient' && (
                  <>
                    <Link to="/my-appointments" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 font-medium rounded-md text-sm">My Appointments</Link>
                    <Link to="/sos" onClick={() => setIsOpen(false)} className="block px-3 py-2 bg-red-500 text-white rounded-md font-medium text-sm text-center mt-1">
                      Send SOS
                    </Link>
                  </>
                )}
                {user?.role === 'doctor' && (
                  <Link to="/doctor-dashboard" onClick={() => setIsOpen(false)} className="block px-3 py-2 bg-blue-500 text-white rounded-md font-medium text-sm text-center">
                    Dashboard
                  </Link>
                )}
                <button onClick={handleLogout} className="block w-full text-left px-3 py-2 text-red-600 font-medium rounded-md text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-gray-700 font-medium rounded-md text-sm">Sign In</Link>
                <Link to="/register" onClick={() => setIsOpen(false)} className="block px-3 py-2 bg-red-500 text-white rounded-md font-medium text-sm text-center">
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
