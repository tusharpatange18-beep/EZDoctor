import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, MapPin, Loader, WifiOff, Phone } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast, ToastContainer } from "../components/common/Toast";
import { createSOS } from "../api/requests";
import { enqueueSOS } from "../offline/db";
import { SOS_SENT_EVENT } from "../offline/sosQueue";

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
  const [queued, setQueued] = useState(false);

  // A queued SOS is sent automatically when the connection returns (see OfflineBanner)
  useEffect(() => {
    const onSent = () => navigate("/track");
    window.addEventListener(SOS_SENT_EVENT, onSent);
    return () => window.removeEventListener(SOS_SENT_EVENT, onSent);
  }, [navigate]);

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

    let location;
    try {
      showToast("Getting your GPS location...", "info");
      location = await getLocation();
      showToast(`Location found: ${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}`, "success", 2000);
    } catch (error) {
      showToast(error.code === 1 ? "Location access denied. Please allow GPS." : "Could not get your location. Please try again.", "error");
      setLoading(false);
      return;
    }

    const payload = {
      patientName: formData.name,
      location,
      symptoms: formData.symptoms,
      type: formData.type,
    };

    // No connection: keep the SOS on the device and send it on reconnect
    const queueForLater = async () => {
      await enqueueSOS(payload, token);
      setQueued(true);
    };

    try {
      if (!navigator.onLine) {
        await queueForLater();
        return;
      }

      const { ok, data } = await createSOS(payload, token);

      if (!ok) {
        showToast(data.message || "Failed to send SOS", "error");
        return;
      }

      sessionStorage.setItem("requestId", data._id);
      showToast("SOS sent! Connecting you to help...", "success");

      setTimeout(() => navigate("/track"), 1200);

      setFormData({ name: user?.name || "", phone: "", type: "Accident", symptoms: "" });
    } catch {
      // fetch throws only on network failure
      await queueForLater();
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
            <AlertCircle className="w-8 h-8 text-red-500 animate-pulse" aria-hidden="true" />
          </div>
          <h1 className="text-3xl font-extrabold text-gray-900">Emergency SOS</h1>
          <p className="mt-2 text-sm text-gray-500">
            Your GPS location will be auto-detected. Help is on the way.
          </p>
        </div>

        {/* GPS Status */}
        {gettingLocation && (
          <div role="status" className="mb-4 flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-3 rounded-xl text-sm border border-blue-200">
            <Loader className="w-4 h-4 animate-spin" aria-hidden="true" />
            Detecting your location...
          </div>
        )}

        {queued ? (
          <div role="alert" className="space-y-4 text-center">
            <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
              <WifiOff className="w-7 h-7 text-gray-700" aria-hidden="true" />
            </div>
            <h2 className="text-lg font-bold text-gray-900">No connection: SOS saved</h2>
            <p className="text-sm text-gray-600">
              Your SOS and GPS location are saved on this device and will be sent automatically
              the moment you're back online. Keep this page open.
            </p>
            <a
              href="tel:108"
              className="w-full py-3 rounded-xl text-white font-bold bg-red-600 hover:bg-red-700 transition flex items-center justify-center gap-2"
            >
              <Phone className="w-4 h-4" aria-hidden="true" /> Life-threatening? Call 108 now
            </a>
          </div>
        ) : (
        <form className="space-y-5" onSubmit={handleSubmit}>
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Patient Name</label>
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
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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
            <label htmlFor="type" className="block text-sm font-medium text-gray-700 mb-1">Emergency Type</label>
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
            <label htmlFor="symptoms" className="block text-sm font-medium text-gray-700 mb-1">Symptoms</label>
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
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg">
            <MapPin className="w-3.5 h-3.5 text-red-400" aria-hidden="true" />
            GPS location automatically attached when you submit
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 rounded-xl text-white font-bold bg-red-600 hover:bg-red-700 transition disabled:opacity-60 shadow-lg shadow-red-200 text-sm flex items-center justify-center gap-2"
          >
            {loading ? (
              <><Loader className="w-4 h-4 animate-spin" aria-hidden="true" /> Sending SOS...</>
            ) : (
              <>Send SOS Request</>
            )}
          </button>
        </form>
        )}
      </div>
    </div>
  );
};

export default SOS;