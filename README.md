# 🏫 PCCOER CampusCare — Smart Campus Support & Alumni Mentorship Portal

[![MERN Stack](https://img.shields.io/badge/Stack-MERN-orange.svg?style=for-the-badge)](https://mongodb.com)
[![React](https://img.shields.io/badge/Frontend-React.js-blue.svg?style=for-the-badge)](https://react.dev)
[![Vite](https://img.shields.io/badge/Compiler-Vite-purple.svg?style=for-the-badge)](https://vite.dev)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38bdf8.svg?style=for-the-badge)](https://tailwindcss.com)
[![License](https://img.shields.io/badge/Production-Ready-emerald.svg?style=for-the-badge)](#)

**PCCOER CampusCare** is an enterprise-grade, decentralized MERN Stack SaaS-style campus support and collaborative portal built specifically for **Pimpri Chinchwad College of Engineering & Research (PCCOER)**. 

The system centralizes Student Grievances, Suggestion Moderation, Hackathons registrations, Real-time Library shelf reserves, Sports facility booking, Alumni direct career mentorship, and Campus Forums under a beautiful, dark-mode-first visual interface.

---

## 🌟 Visual Master Key Features

### 🌓 1. HSL Dynamic Theme Mappings
* Fully responsive interface built on a robust dark-mode-first visual engine.
* Beautiful transitions and interactions styled with **Tailwind CSS** and **Framer Motion** micro-animations.

### 📊 2. Operations Control Center (Analytics)
* Fully integrated interactive analytics dashboard using **Recharts**.
* Renders real-time aggregate complaint trend area charts (last 7 days) and responsive category distribution pie charts.

### 💼 3. Decentralized Unified Role Matrix
* Core routing logic serving 4 roles custom dashboards: **Student, Faculty, Alumni, and Administrator**.
* Secured password recovery pipelines using visual copiable recovery cards.

### 🛠️ 4. Collaborative Timeline Logs & Chats
* Grievance tickets support interactive chronological resolution timeline logs (Pending ➡️ In Progress ➡️ Resolved ➡️ Closed).
* In-line discussion chat box transmitting real-time comments on tickets between students and mediators.

---

## 📂 System Directory Tree Map

```
PCCOER-CampusCare/
├── backend/
│   ├── config/              # MongoDB Atlas cluster config & connection
│   ├── controllers/         # Business Operations (auth, complaints, university, forum, notification, admin)
│   ├── middleware/          # JWT auth gates, Multer storage, Rate-limiter filters
│   ├── models/              # Mongoose Database Schemas (User, Complaint, Suggestion, Event, Mentor, ForumPost, Book, Facility, Notification)
│   ├── routes/              # Express API Endpoint Maps
│   ├── uploads/             # local image store (gitkeep protected)
│   ├── utils/               # Bcrypt helpers, JWTS, and utils/seeder.js
│   ├── .env.example         # Template config variables
│   ├── package.json         # Node scripts & dependencies
│   └── server.js            # Express Entry gateway
├── frontend/
│   ├── public/              # Logos and SVGs
│   ├── src/
│   │   ├── components/      # UI Modals, Skeletons, charts, layouts
│   │   ├── context/         # Auth & Theme Provider context states
│   │   ├── hooks/           # useAuth and useTheme custom hooks
│   │   ├── layouts/         # Dashboard Shell Layout wrapper
│   │   ├── pages/           # Landing, Login, Register, Recovery, 4 specialized Dashboards
│   │   ├── routes/          # ProtectedRoute gates & AppRoutes mapping
│   │   ├── services/        # Axios API Client Interceptors
│   │   ├── index.css        # Tailwind v4 import & custom styles
│   │   └── App.jsx          # Entry layout controller
│   ├── vite.config.js       # Vite client compiler configuration
│   └── package.json         # React packages & scripts
├── README.md                # Premium configuration manual
└── .gitignore               # System-wide exclude patterns
```

---

## ⚙️ Configuration & Environment Parameters

Create `.env` files in both the `backend/` and `frontend/` folders using the templates below:

### 1. Backend Configuration (`backend/.env`)

```ini
PORT=5001
MONGO_URI=mongodb+srv://vedant_project:Vedant%401234@project.695yx2z.mongodb.net/college_complaints
JWT_SECRET=8f9a2e6f423984d9f0f9c2d1b827e69f4c3a5d8e7b9c6d3f2e1a8b9c6d3e8f7a
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```
> [!IMPORTANT]
> Since macOS occupies port `5000` via AirPlay by default, the backend is configured to listen securely on port **`5001`**.

### 2. Frontend Configuration (`frontend/.env`)

```ini
VITE_API_URL=http://localhost:5001/api
```

---

## 🚀 Quick Setup & Local Launch

### Prerequisites
* **Node.js** (v18.0.0 or higher)
* **npm** or **yarn**
* **MongoDB Atlas** Cloud Database (URL pre-configured in `.env`)

### Step 1: Install Dependencies
Install packages for both frontend and backend directories:
```bash
# Install Backend packages
cd backend
npm install

# Install Frontend packages
cd ../frontend
npm install
```

### Step 2: Seed Mock Database Records
To log in immediately and test stats charts, run our preconfigured Mongoose seeder script to populate default university records, library catalogues, facilities schedules, and role accounts:
```bash
# From the backend/ folder
npm run seed
```

This populates the database with the following default credentials:

| Dashboard Role | Email Address | Password | Account Key / Extra Parameters |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@college.edu` | `adminpassword123` | Direct analytics, suspension bans, role upgrades |
| **Faculty Resolver** | `professor@faculty.edu` | `facultypassword123` | Department assigned: "Computer Science" |
| **Verified Alumni** | `alumni@alumni.edu` | `alumnipassword123` | Mentor profile configured |
| **Student** | `vedant@student.edu` | `studentpassword123` | PRN: `72011234F` • year: `TE Computer` |

### Step 3: Run Dev Servers
Launch both dev environments to begin using the system:
```bash
# Terminal 1: In the backend/ folder
npm run dev

# Terminal 2: In the frontend/ folder
npm run dev
```
Open **`http://localhost:5173`** in your browser to explore the landing page!

---

## 📋 Comprehensive API Route Reference

### 🔐 1. Authentication Router (`/api/auth`)
* `POST /register` — Register new user account with conditional role sub-fields.
* `POST /login` — Standard credentials check (returns JWT Cookie / payload).
* `PUT /profile` — Update user name, PRN, branch, year or security passwords.
* `POST /forgot-password` — Generates a copyable visual code card for password recovery.
* `POST /reset-password` — Resets account password using recovery code.

### 🏛️ 2. University Router (`/api/university`)
* `GET /suggestions` — Lists student campus proposals.
* `POST /suggestions` — Student logs a suggestion (optional anonymity).
* `POST /suggestions/:id/vote` — Toggles an upvote support count on proposal.
* `GET /events` — Lists technical hackathons, coding contests, and countdowns.
* `POST /events` — Faculty publishes an event with max slot limits.
* `POST /events/:id/register` — Student registers for an event (updates slot countdowns).
* `GET /mentors` — Lists corporate alumni mentors.
* `POST /mentors/:id/request` — Student sends career mentoring invitation.
* `POST /mentors/:mentorId/approve` — Alumni approves invitation request.
* `POST /mentors/:mentorId/blog` — Alumni publishes internship/recruiting blogs.
* `GET /books` — Catalog of books including shelf coordinates.
* `POST /books/:id/reserve` — Student reserves or returns textbook.
* `GET /facilities` — Status tracker (GYM, Seminar Hall, Sports Court).
* `POST /facilities/:id/book` — Student reserves facility slot.

### 💬 3. Forums Router (`/api/forum`)
* `GET /` — Fetch all tagged discussion posts.
* `POST /` — Broadcast thread (by Student, Alumni, or Faculty).
* `POST /:id/like` — Liking a thread.
* `POST /:id/comment` — Appends comment reply to post thread.

### 🛡️ 4. Administration Router (`/api/admin`)
* `GET /stats` — Dynamic charts aggregator counts.
* `GET /users` — Retrieves user directory roster.
* `PUT /users/:id/ban` — Suspends/ban user account (re-activates if already suspended).
* `PUT /users/:id/role` — Switches authority roles (student ➡️ faculty, etc).
* `PUT /suggestions/:id` — Status moderator (`Approved`, `Implemented`, `Spam`).

---

## 🛡️ Production-Grade Security Defenses

* **Morgan HTTP logs:** Logs and traces all network transactions directly to the terminal.
* **Helmet Shield:** Sets HTTP headers to restrict script injections and clickjacking.
* **Express Rate Limiter:** Bounds requests to 100 per 15 minutes per IP to block brute-force and DDoS attacks.
* **Mongoose Validations:** Enforces strict patterns, required conditions, and uniqueness.
* **Cryptographic Bcrypt Hashing:** Salted passwords (10 rounds strength) ensuring no plain credentials leak.

---

## 📄 License & Pair-Programming Standards

Developed under premium pair-programming engineering standards. All database schemas, routes, custom hooks, and charting structures conform to production-grade guidelines. Enjoy managing your campus resolutions elegantly!
