# EZDoctor

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
| Deployment | Vercel (frontend), Render (backend), MongoDB Atlas |

---

## Project Structure

```
EZDoctor/
├── src/                      # React frontend
│   ├── api/                  # API calls (auth, requests)
│   ├── components/           # common/ (Navbar, Toast, ProtectedRoute) and ui/
│   ├── constants/            # status config, static data
│   ├── context/              # AuthContext
│   ├── hooks/                # useSocket
│   └── pages/                # Home, SOS, PatientTracking, Doctors, MyAppointments,
│                             # DoctorDashboard, AdminPanel, Login, Register
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
3. The request is saved as `pending` and broadcast to doctors over Socket.io.
4. A doctor accepts; the backend picks the nearest `available` ambulance by Haversine distance, marks it `busy` and attaches it to the request.
5. Location updates are broadcast as they arrive, and the patient's map moves in real time.
6. When the request is `completed`, the ambulance becomes `available` again.

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
