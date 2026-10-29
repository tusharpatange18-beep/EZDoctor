# EZDoctor




[![CI](https://github.com/tusharpatange18-beep/EZDoctor/actions/workflows/ci.yml/badge.svg)](https://github.com/tusharpatange18-beep/EZDoctor/actions/workflows/ci.yml)

A full-stack emergency medical assistance web app for rural areas: one-tap SOS with GPS location, AI-assisted triage, automatic ambulance assignment, live tracking on a map, and doctor discovery with appointment booking.

**Live demo:** [ezdoctor.vercel.app](https://ezdoctor.vercel.app)

---







## Features

### 🚨 Emergency SOS
- One-tap SOS that sends the patient's GPS location and symptoms
- **AI triage with Google Gemini**: each SOS is classified as high, medium or low priority with a short label, so doctors see the most urgent cases first (falls back gracefully when no API key is set)
- Automatic assignment of the nearest available ambulance (Haversine great-circle distance) when a doctor accepts the request
- Request lifecycle: `pending → accepted → on_the_way → arrived → completed`; the ambulance is released when the request completes

### 🗺️ Real-Time Tracking
- Socket.io pushes request and location updates to every connected client instantly
- Patients follow the doctor and ambulance on a live Leaflet map
- Doctor movement can be simulated from the dashboard for demos

### 🏥 Doctors and Appointments
- Browse doctors, search by name, specialization or location, and filter by specialization
- Doctor profiles with ratings and availability
- Book appointments, view your appointment history, and cancel bookings

### 📶 Works on Weak or No Signal
- Installable PWA: the app shell is precached by a Workbox service worker, so pages open with no network
- An SOS made offline is saved in IndexedDB with its GPS fix and **sent automatically when the signal returns**, then live tracking opens (offers a `tel:108` call link meanwhile)
- The last doctor list is kept in IndexedDB for offline browsing; recent SOS status and map tiles are cached
- Optimistic booking and cancellation: the UI updates instantly and rolls back if the server fails

### 👤 Users and Roles
- Register and log in with JWT authentication; passwords hashed with bcrypt
- Three roles (Patient, Doctor, Admin), each with its own protected routes and dashboard
- Admin panel listing all emergency requests with live status updates

---

## Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, React Router 7, React Leaflet, Socket.io-client, Lucide icons |
| Backend | Node.js, Express 5, Socket.io, JWT, bcryptjs |
| Database | MongoDB Atlas with Mongoose |
| AI | Google Gemini (`@google/generative-ai`) for emergency triage |
| Offline | vite-plugin-pwa (Workbox service worker), IndexedDB via `idb` |
| Testing | Vitest, React Testing Library, Playwright, axe-core, GitHub Actions |
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## Performance and Accessibility

Lighthouse 12, mobile emulation, production build, median of 3 runs per page.

| Page | Performance | Accessibility | Best Practices | SEO |
|---|---|---|---|---|
| Home | 73 → **98** | 75 → **100** | 96 → **100** | 82 → **100** |
| Login | 92 → **98** | 75 → **100** | 96 → **100** | 82 → **100** |
| Register | 96 → **98** | 75 → **100** | 96 → **100** | 82 → **100** |
| Doctors | 97 → **97** | 74 → **100** | 96 → **100** | 82 → **100** |

- **Layout shift (CLS) on Home: 0.903 → 0.** The session was read in an effect, so the first render was empty and the footer jumped; it is now read synchronously.
- **JavaScript on first load: 520 KB → about 270 KB** (149 KB → 91 KB transferred). Every route is lazy-loaded; Leaflet (154 KB) and socket.io-client (41 KB) only download on the map pages. `ANALYZE=1 npm run build` writes a bundle treemap to `dist/stats.html`.
- Removed an unused render-blocking Google Font (about 840 ms) and unused assets.
- Accessibility: skip link, landmarks, visible focus, labelled inputs and icon buttons, an accessible booking dialog (focus trap entry, Escape, focus return), live regions for SOS status and toasts, focus moved to the page on route change, WCAG AA colour contrast, reduced-motion support. axe-core reports no WCAG 2.1 A/AA violations on the 4 audited pages (Home, Login, Register, Doctors).

---

## Testing

```bash
npm run lint         # ESLint
npm test             # Vitest + React Testing Library (33 tests)
npm run test:e2e     # Playwright end-to-end + accessibility (10 tests)
npm run test:visual  # Playwright visual regression (4 page snapshots)
```

- **Component tests** cover login and its errors, role-based routing, the SOS form with mocked GPS, live tracking with a mocked Socket.io client, doctor search and the booking dialog, real-time dashboard updates, the offline SOS queue (fake IndexedDB), optimistic booking rollback, and the Haversine helpers.
- **End-to-end tests** start the real Express + Socket.io backend on an in-memory MongoDB (`e2e/test-backend.cjs`) and drive two browsers: a patient sends an SOS and a doctor accepts, moves and closes it while the patient watches every status change live. They also cover offline reload, an SOS queued offline and sent on reconnect, the "waking up the server" notice, a keyboard-only SOS, and an axe scan of the 4 public pages.
- **Visual regression** baselines were made on Windows; font rendering differs on Linux, so CI runs the functional and accessibility suites. Refresh baselines with `npm run test:visual -- --update-snapshots`.
- **CI** (GitHub Actions) runs lint, unit tests, the production build and the Playwright end-to-end and accessibility tests on every push. Visual regression snapshots run locally.

---

## Project Structure

```
EZDoctor/
├── src/                      # React frontend
│   ├── api/                  # API calls (auth, requests)
│   ├── components/           # common/ (Navbar, Toast, ProtectedRoute) and ui/
│   ├── constants/            # status config, static data
│   ├── context/              # AuthContext
│   ├── hooks/                # useSocket, useOnlineStatus
│   ├── offline/              # IndexedDB store and offline SOS queue
│   ├── pages/                # Home, SOS, PatientTracking, Doctors, MyAppointments,
│   │                         # DoctorDashboard, AdminPanel, Login, Register (+ *.test.jsx)
│   └── test/                 # Vitest setup and render helpers
├── e2e/                      # Playwright specs, visual baselines, test backend
├── ezdoc-backend/            # Express backend
│   ├── config/               # MongoDB connection
│   ├── controllers/          # auth, doctors, appointments, SOS requests
│   ├── middleware/           # JWT auth
│   ├── models/               # User, Doctor, Appointment, Request, Ambulance
│   ├── routes/
│   ├── scripts/              # seed and maintenance scripts
│   ├── utils/                # Haversine distance, nearest-ambulance lookup
│   └── server.js             # Express + Socket.io server
└── package.json              # frontend
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- A MongoDB Atlas cluster (or a local MongoDB)
- Optional: a Google Gemini API key for AI triage

### 1. Clone
```bash
git clone https://github.com/tusharpatange18-beep/EZDoctor.git
cd EZDoctor
```

### 2. Backend
```bash
cd ezdoc-backend
npm install
cp .env.example .env      # then fill in your values
node seed.js              # optional: seed sample data
npm run dev               # http://localhost:5000
```

### 3. Frontend
```bash
cd ..
npm install
cp .env.example .env
npm run dev               # http://localhost:5173
```

---

## Environment Variables

**Backend (`ezdoc-backend/.env`)**
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbname>
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key   # optional; triage is skipped without it
```

**Frontend (`.env`)**
```env
VITE_API_BASE=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## API Endpoints

```
Auth
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                         (JWT)

Doctors
GET    /api/doctors
GET    /api/doctor/:id
POST   /api/doctor
PATCH  /api/doctor/:id/availability

Appointments                                (JWT)
POST   /api/appointments
GET    /api/appointments/my
PATCH  /api/appointments/:id/cancel

Emergency SOS
POST   /api/sos
GET    /api/requests
GET    /api/request/:id
PUT    /api/request/:id                     accept + assign nearest ambulance
PUT    /api/request/:id/location            doctor location update
PUT    /api/request/:id/ambulance-location
PUT    /api/request/:id/status
```

Socket.io events emitted by the server: `requestUpdate`, `locationUpdate`.

---

## How the SOS Flow Works

1. The patient presses SOS; the browser reads their GPS location.
2. The backend sends the emergency type and symptoms to Gemini, which returns a priority level and label.
3. The request is saved as `pending` and broadcast to every open doctor and admin dashboard over Socket.io. (If the phone is offline, the SOS waits in IndexedDB and is sent on reconnect.)
4. A doctor accepts; the backend picks the nearest `available` ambulance by Haversine distance, marks it `busy` and attaches it to the request.
5. Location updates are broadcast as they arrive, and the patient's map moves in real time.
6. When the request is `completed`, the ambulance becomes `available` again.

---

## Hosting Note

The backend runs on Render's free plan, which sleeps after 15 minutes idle and takes about 20-30 seconds to wake. The app pings the backend on load and shows a "waking up the server" notice if it is slow. To keep it awake, point a free uptime monitor (for example UptimeRobot) at `https://ezdoctor.onrender.com/` every 5 minutes.

---

## Future Improvements

- Real GPS streaming from the ambulance or driver device
- SMS alerts for SOS events
- Appointment rescheduling and reviews
- Video consultation and multi-language support

---

## Author

**Tushar Patange**
- GitHub: [tusharpatange18-beep](https://github.com/tusharpatange18-beep)
- LinkedIn: [tushar-patange](https://www.linkedin.com/in/tushar-patange-3851aa327/)
- Email: tusharpatange18@gmail.com
