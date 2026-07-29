# EZDoctor

A full-stack healthcare web application with emergency SOS, real-time ambulance tracking, doctor discovery, and appointment booking.

**Live**: [Frontend](https://ezdoctor.vercel.app) | [Backend](https://ezdoctor-api.onrender.com)

---

## Features

### 🚨 Emergency Management
- One-tap SOS with GPS location
- Real-time ambulance tracking via Socket.io
- Smart ambulance assignment using Haversine algorithm
- Live map updates
- Emergency history tracking

### 🏥 Doctor Discovery & Booking
- Search and filter doctors by specialty, location, ratings
- View detailed doctor profiles
- Browse available time slots and book appointments
- Reschedule and cancel appointments
- Patient reviews and ratings

### 👤 User Management
- Role-based access (Patient, Doctor, Admin)
- Secure JWT authentication
- Profile management
- Multi-device login support

### 📊 Admin Dashboard
- Real-time analytics and statistics
- User and appointment management
- Emergency incident tracking
- System monitoring

### 🔔 Notifications
- Toast notifications for actions
- Email confirmations and alerts
- Real-time ambulance status updates

---

## Tech Stack

**Frontend**
- React 18+ (Vite)
- Tailwind CSS
- React Router
- Axios
- Socket.io-client
- React Leaflet

**Backend**
- Node.js + Express.js
- MongoDB with Mongoose
- Socket.io
- JWT authentication
- Nodemailer

**Deployment**
- Frontend: Vercel
- Backend: Render
- Database: MongoDB Atlas

---

## Project Structure

```
ezdoctor/
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/            # Route pages
│   │   ├── services/         # API & Socket handlers
│   │   ├── hooks/            # Custom hooks
│   │   ├── context/          # State management
│   │   └── utils/            # Helper functions
│   └── package.json
│
├── backend/
│   ├── models/               # MongoDB schemas
│   ├── routes/               # API routes
│   ├── middleware/           # Express middleware
│   ├── services/             # Business logic
│   ├── socket/               # Socket.io handlers
│   ├── config/               # Configuration
│   └── package.json
│
└── README.md
```

---

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB account
- Git

### Setup

**1. Clone the repo**
```bash
git clone https://github.com/yourusername/ezdoctor.git
cd ezdoctor
```

**2. Backend Setup**
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your credentials
npm run dev
```

**3. Frontend Setup**
```bash
cd ../frontend
npm install
cp .env.example .env
# Edit .env with API URL
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ezdoctor

# Authentication
JWT_SECRET=your_secret_key_min_32_chars
JWT_REFRESH_SECRET=your_refresh_secret
JWT_EXPIRE=7d

# Email Service
EMAIL_SERVICE=gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-app-password

# CORS
CORS_ORIGIN=http://localhost:5173,https://yourdomain.com
```

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## API Endpoints

```
Authentication
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh-token

Doctors
GET    /api/doctors
GET    /api/doctors/:id
GET    /api/doctors/search

Appointments
POST   /api/appointments
GET    /api/appointments
PUT    /api/appointments/:id
DELETE /api/appointments/:id

Emergency
POST   /api/emergency/sos
GET    /api/emergency/:id
PUT    /api/emergency/:id/status

Admin
GET    /api/admin/dashboard
GET    /api/admin/users
POST   /api/admin/users
DELETE /api/admin/users/:id
```

---

## How It Works

### Emergency SOS
1. User clicks SOS button
2. Browser gets GPS location
3. Backend finds nearest ambulance using Haversine algorithm
4. Ambulance location tracked in real-time via Socket.io
5. Live map shows ambulance approaching

### Doctor Booking
1. User searches for doctors
2. Filters by specialty, location, ratings
3. Views available time slots
4. Books appointment
5. Gets email confirmation

### Real-Time Updates
- Socket.io maintains persistent connection
- Ambulance location updates every 2 seconds
- Appointment status changes sent instantly
- Admin dashboard updates in real-time

---

## Deployment

### Frontend (Vercel)
```bash
vercel link
vercel deploy --prod
```

### Backend (Render)
- Connect GitHub repository
- Set root directory to `backend`
- Add environment variables
- Build: `npm install`
- Start: `npm start`

### Database (MongoDB Atlas)
- Create a free cluster
- Whitelist your IP address
- Get connection URI and add to `.env`

---

## Future Improvements

- Video consultation feature
- AI-powered symptom checker
- Mobile app (React Native)
- Payment integration (Stripe)
- Prescription management
- Multi-language support

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## License

MIT License - feel free to use this for personal and commercial projects.

---

## Author

**Your Name**
- GitHub: [tusharpatange18-beep](https://github.com/tusharpatange18-beep)
- Email: [EMAIL_ADDRESS](tusharpatange18@gmail.com)
- LinkedIn: [https://www.linkedin.com/in/yourprofile](https://www.linkedin.com/in/tushar-patange-3851aa327/)

---

## Support

Have questions or found an issue? Open an issue on GitHub or email me.

---

Made with ❤️ by [Tushar Patange](https://github.com/tusharpatange18-beep)
