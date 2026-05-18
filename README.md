# UniResolve — Smart Complaint Management System for College Campus

**UniResolve** is a highly optimized, production-ready, full-stack campus ticket administration system. Built on a modern SaaS architecture, it empowers college students to register facility, internet, classroom, or utility complaints with optional image uploads, track ticket progress in real-time, and enables administrators to monitor trends, update statuses with progress commentary, and filters spam complaints efficiently.

---

## 🌟 Visual Core Features

- 🌓 **Dynamic Theme Integration:** Auto-adaptive Light and Dark modes with HSL theme mappings.
- 📊 **Administrative Insights:** Live trends tracking, daily area curves, and category pie charts powered by Recharts.
- 🔒 **Secure Authorization Gateway:** Cryptographically signed session tokens (JWT) and Bcrypt salted passwords.
- 📑 **Advanced Datatables:** Full pagination, real-time query searching, multi-filter categorizations, and sorting.
- ⏳ **Chronological Status Audits:** Detail timelines documenting changes, who committed the action, and administrative comments.
- ⚡ **Spectacular Micro-Animations:** Fluid, responsive state animations utilizing Framer Motion and pulsating loading skeletons.

---

## 📂 System Folder Architecture

```
uni-resolve/
├── backend/
│   ├── config/              # Mongoose DB connector config
│   ├── controllers/         # API business logics (auth, complaints, stats)
│   ├── middleware/          # JWT protection, uploads, and error parsers
│   ├── models/              # Mongoose MongoDB Schemas
│   ├── routes/              # Express endpoint routers
│   ├── uploads/             # local image store (gitkeep protected)
│   ├── utils/               # Token generators & DB Seeders
│   ├── .env.example         # Template config variables
│   ├── package.json         # Node scripts & tools
│   └── server.js            # Express server main entrance
├── frontend/
│   ├── public/              # Icons and SVGs assets
│   ├── src/
│   │   ├── assets/          # Static layout images
│   │   ├── components/      # Reusable overlays, Skeletons, Modals
│   │   ├── context/         # Auth & Theme Global Providers
│   │   ├── hooks/           # useAuth and useTheme custom hooks
│   │   ├── layouts/         # Dashboard Shell Layouts
│   │   ├── pages/           # Landing, Login, Register, Dashboards
│   │   ├── routes/          # ProtectedRoute gates & Route mappings
│   │   ├── services/        # Axios configurations & Interceptors
│   │   ├── index.css        # Tailwind v4 import & custom styles
│   │   └── App.jsx          # Entry layout controller
│   ├── postcss.config.js    # Compile styling config
│   ├── tailwind.config.js   # Class-driven tailwind properties
│   ├── vite.config.js       # Vite client compiler configuration
│   └── package.json         # React packages & scripts
├── .gitignore               # System-wide exclude patterns
└── README.md                # Premium configuration manual
```

---

## ⚙️ Configuration & Environment Parameters

Create `.env` files in both the `backend/` and `frontend/` folders using the templates below:

### 1. Backend Config (`backend/.env`)

```ini
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/uni_resolve?retryWrites=true&w=majority
JWT_SECRET=your_cryptographically_signed_super_secret_jwt_key_here
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
```

### 2. Frontend Config (`frontend/.env`)

```ini
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Quick Setup & Local Launch

Follow these steps to spin up the application on your local machine:

### Prerequisites
- Node.js (v18.0.0 or higher)
- npm or yarn
- Active local MongoDB instance or MongoDB Atlas cluster

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
To log in immediately and test stats charts, seed standard students and admin credentials:
```bash
# From the backend/ folder
npm run seed
```

This populates the database with the following default credentials:

| Account Type | Email Address | Password |
| :--- | :--- | :--- |
| **Administrator** | `admin@college.edu` | `adminpassword123` |
| **Student** | `vedant@student.edu` | `studentpassword123` |
| **Student** | `aditya@student.edu` | `studentpassword123` |

### Step 3: Run Dev Servers
Launch both dev environments to begin using the system:
```bash
# In the backend/ folder
npm run dev

# In a separate terminal, from the frontend/ folder
npm run dev
```
Open **`http://localhost:5173`** in your browser to explore the landing page!

---

## ☁️ Deployment Blueprints

### A. Database (MongoDB Atlas)
1. Sign up on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2. Create a free M0 Cluster and configure Network Access to accept connections from anywhere (`0.0.0.0/0`).
3. Under Database Access, create a user and copy the connection URI string.
4. Replace `MONGO_URI` in `backend/.env` with this string.

### B. Backend (Render)
1. Sign up on [Render](https://render.com).
2. Create a new **Web Service** and link your Git repository.
3. Configure the following attributes:
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
4. Add all Backend environment variables from `backend/.env` in the "Environment Variables" section.
5. In **Advanced Settings**, ensure the server does not sleep by setting up a health check endpoint, or mapping disk mounts for the `uploads/` directory if persistent storage is desired.

### C. Frontend (Vercel)
1. Sign up on [Vercel](https://vercel.com).
2. Create a new Project and link the `frontend` folder of your Git repository.
3. Set the build parameters:
   - **Framework Preset:** `Vite`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add the frontend environment variable:
   - `VITE_API_URL`: Set this to your deployed Render URL (e.g. `https://your-service.onrender.com/api`).
5. Click **Deploy**. Vercel will build and serve your premium interface on a secure SSL URL.

---

## 🛡️ Standard Security Features

- **Morgan Logs:** Monitors and prints all incoming HTTP requests to the console.
- **Helmet Security:** Injects HTTP response headers to defend against cross-site scripting and resource loaders blocks.
- **Express Rate Limiter:** Protects endpoints from DDoS and dictionary brute-force attacks by limiting requests to 100 per 15 minutes per IP.
- **Password Hashing:** Salted passwords using Bcrypt (10 rounds strength) preventing leaks even in standard database dump files.

---

## 📄 License & Standards

This project has been developed under premium pair-programming engineering standards. All database models, custom components, filters, and animations comply with production-ready guidelines. Enjoy managing your campus resolutions elegantly!
# Student-Support-Portal---PCCOER
