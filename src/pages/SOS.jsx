import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, MapPin, Loader } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast, ToastContainer } from "../components/common/Toast";
import { createSOS } from "../api/requests";

const SOS = () => {
  const navigate = useNavigate();
  const { user, token } = useAuth();
  const { showToast, toasts, removeToast } = useToast();

  const [formData, setFormData] = useState({
    name: user?.name || "",
    phone: "",
    type: "Accident",
    symptoms: "",
  });
  const [loading, setLoading] = useState(false);
  const [gettingLocation, setGettingLocation] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const getLocation = () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error("Geolocation not supported"));
        return;
      }
      setGettingLocation(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setGettingLocation(false);
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          setGettingLocation(false);
          reject(error);
        }
      );
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      showToast("Getting your GPS location...", "info");
      const location = await getLocation();
      showToast(`Location found: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`, "success", 2000);

      const API = import.meta.env.VITE_API_BASE;
      const res = await fetch(`${API}/sos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          patientName: formData.name,
          location,
          symptoms: formData.symptoms,
          type: formData.type
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        showToast(data.message || "Failed to send SOS", "error");
        return;
      }

      sessionStorage.setItem("requestId", data._id);
      showToast("SOS sent! Connecting you to help...", "success");

      setTimeout(() => navigate("/track"), 1200);

      setFormData({ name: user?.name || "", phone: "", type: "Accident", symptoms: "" });
    } catch (error) {
      console.error(error);
      if (error.code === 1) {
        showToast("Location access denied. Please allow GPS.", "error");
      } else {
        showToast("Failed to send SOS. Check your connection.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-rose-50 py-12 px-4 flex justify-center items-center">
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 border-t-4 border-red-500">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" />
          </div>
          <h2 className="text-3xl font-extrabold text-gray-900">Emergency SOS</h2>
          <p className="mt-2 text-sm text-gray-500">
            Your GPS location will be auto-detected. Help is on the way.
          </p>
        </div>

        {/* GPS Status */}
        {gettingLocation && (
          <div className="mb-4 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm border border-blue-200">
            <Loader className="w-4 h-4 animate-spin" />
            Detecting your location...
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm"
              placeholder="John Doe"
              required
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm"
              placeholder="+91 98765 43210"
              required
            />
          </div>

          {/* Emergency Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Emergency Type</label>
            <select
              id="type"
              value={formData.type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm"
            >
              <option>Accident</option>
              <option>Chest Pain</option>
              <option>Fever</option>
              <option>Stroke</option>
              <option>Breathing Difficulty</option>
              <option>Other</option>
            </select>
          </div>

          {/* Symptoms */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
            <textarea
              id="symptoms"
              rows={3}
              value={formData.symptoms}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-red-300 text-sm resize-none"
              placeholder="Describe the current condition..."
            />
          </div>

          {/* Location note */}
          <div className="flex items-center gap-2 text-xs text-gray-400 bg-gray-50 px-3 py-2 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            GPS location automatically attached when you submit
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-bold bg-red-500 hover:bg-red-600 transition disabled:opacity-60 shadow-lg shadow-red-200 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" /> Sending SOS...</>
            ) : (
              <>Send SOS Request</>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SOS;