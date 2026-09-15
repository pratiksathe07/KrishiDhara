# 🌾 KrishiDhara

**KrishiDhara** is a production-grade agricultural services platform connecting Farmers, Agricultural Labor, and Dealers across India. Built on the MERN stack with passwordless OTP-based authentication.

---

## Features

- **Passwordless OTP Authentication** — email-based, no passwords
- **3 User Roles** — Farmer, Labor, Dealer
- **Secure OTP Flow** — crypto CSPRNG, bcrypt-hashed, 5-min expiry, 5-attempt limit, 60s resend cooldown
- **3-Step Registration** — personal info → OTP verify → role-specific profile
- **Cascading Location Selector** — State → District → Taluka → Village (Farmer)
- **Labor Skills** — 36 selectable agricultural skills
- **Dealer Products** — 59 searchable agricultural products
- **JWT Authentication** — HTTP-only Secure cookies, never localStorage
- **Role-Based Authorization** — server-enforced, 403 for unauthorized roles
- **Rate Limiting** — per-IP OTP request and verification limits
- **Resend Email** — professional HTML OTP emails via Resend SDK
- **Mobile-First UI** — Tailwind CSS, Inter font, responsive on all screen sizes

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + Vite + Tailwind CSS v3 |
| Routing | React Router v6 |
| Forms | React Hook Form |
| HTTP Client | Axios (with credentials) |
| Notifications | react-hot-toast |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Authentication | JWT + HTTP-only cookies |
| Email | Resend SDK |
| OTP | crypto.randomInt + bcryptjs |
| Security | helmet, cors, express-rate-limit |

---

## Project Structure

```
KrishiDhara/
├── client/                         ← Vite React frontend
│   └── src/
│       ├── components/
│       │   ├── ui/                 ← Input, Select, Button, OTPInput, StepIndicator
│       │   ├── LocationSelector.jsx
│       │   ├── SkillSelector.jsx
│       │   ├── ProductSelector.jsx
│       │   └── ProtectedRoute.jsx
│       ├── context/
│       │   └── AuthContext.jsx     ← Global auth state (cookie-based)
│       ├── pages/
│       │   ├── auth/               ← Login, Register (3 steps × 3 roles)
│       │   ├── farmer/             ← FarmerDashboard
│       │   ├── labor/              ← LaborDashboard
│       │   └── dealer/             ← DealerDashboard
│       ├── services/               ← api.js, authService.js, locationService.js
│       └── constants/              ← roles.js, laborSkills.js, dealerProducts.js
│
└── server/                         ← Express backend
    ├── config/                     ← db.js, env.js
    ├── constants/                  ← roles.js, laborSkills.js, dealerProducts.js
    ├── controllers/                ← authController.js, locationController.js
    ├── data/                       ← locations.json (India location data)
    ├── middleware/                 ← authenticate.js, authorize.js, errorHandler.js
    ├── models/                     ← User.js, OtpVerification.js
    ├── routes/                     ← authRoutes.js, locationRoutes.js
    ├── services/                   ← emailService.js (Resend)
    └── utils/                      ← otp.js, jwt.js, AppError.js
```

---

## Prerequisites

- Node.js v18+
- MongoDB Atlas account (or local MongoDB)
- Resend account + API key

---

## Environment Setup

### Server (`server/.env`)

Copy `server/.env.example` and fill in values:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/krishidhara
JWT_SECRET=your_minimum_32_char_jwt_secret_here
JWT_EXPIRES_IN=7d
VERIFICATION_TOKEN_SECRET=another_minimum_32_char_secret_here
VERIFICATION_TOKEN_EXPIRES_IN=10m
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=KrishiDhara <noreply@yourdomain.com>
NODE_ENV=development
PORT=5000
CLIENT_URL=http://localhost:5173
```

### Client (`client/.env`) — Optional in development

```env
# Leave empty in dev (Vite proxy handles /api → backend)
# Set in production:
# VITE_API_URL=https://api.yourdomain.com/api
```

---

## Running the Project

### Backend

```bash
cd server
cp .env.example .env   # Fill in your values
npm install
npm run dev            # nodemon — auto-restarts on changes
```

### Frontend

```bash
cd client
npm install
npm run dev            # Vite dev server at http://localhost:5173
```

The Vite dev server proxies `/api` requests to `http://localhost:5000`, so no CORS setup needed in development.

---

## API Endpoints

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/request-otp` | Step 1: Validate + send OTP |
| POST | `/api/auth/verify-otp` | Step 2: Verify OTP, get verificationToken |
| POST | `/api/auth/register` | Step 3: Final registration |
| POST | `/api/auth/login/request-otp` | Login Step 1: Send OTP to registered email |
| POST | `/api/auth/login/verify-otp` | Login Step 2: Verify OTP, issue auth cookie |
| POST | `/api/auth/logout` | Clear auth cookie |
| GET | `/api/auth/me` | Get current authenticated user |

### Location

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/locations/states` | All states |
| GET | `/api/locations/states/:stateId/districts` | Districts for a state |
| GET | `/api/locations/districts/:districtId/talukas` | Talukas for a district |
| GET | `/api/locations/talukas/:talukaId/villages` | Villages for a taluka |

---

## Registration Flow

```
Step 1 → POST /api/auth/request-otp
  - Validate all Step 1 fields server-side
  - Check no duplicate email/mobile
  - Generate CSPRNG 6-digit OTP (crypto.randomInt)
  - Hash OTP with bcrypt (never store plaintext)
  - Send professional HTML email via Resend
  - Return: { email }

Step 2 → POST /api/auth/verify-otp
  - Verify OTP hash, expiry (5 min), attempts (max 5)
  - Mark OTP session as verified
  - Return: { verificationToken } (signed JWT, 10 min)

Step 3 → POST /api/auth/register
  - Verify verificationToken (backend enforced — cannot skip Step 2)
  - Validate role-specific data
  - Create User document in MongoDB
  - Issue auth JWT via HTTP-only cookie
  - Return: safe user data
```

---

## OTP Security

| Property | Value |
|---|---|
| Length | 6 digits |
| Generation | `crypto.randomInt` (CSPRNG) |
| Storage | bcrypt hash only |
| Expiry | 5 minutes |
| Max attempts | 5 |
| Resend cooldown | 60 seconds |
| Rate limit (request) | 5 per 15 min per IP |
| Rate limit (verify) | 10 per 15 min per IP |
| OTP in response | Never |
| OTP in logs | Never |
| OTP in localStorage | Never |

---

## Role Authorization

Backend enforces authorization — frontend routes are a UX convenience only.

```js
// Protect a route to Farmer only:
router.get("/farmer-data", authenticateUser, authorizeRoles("farmer"), handler);

// Allow multiple roles:
router.get("/shared", authenticateUser, authorizeRoles("farmer", "dealer"), handler);
```

Unauthorized access returns `403 Forbidden`.

---

## Security Checklist

- [x] Helmet HTTP security headers
- [x] CORS restricted to CLIENT_URL
- [x] Global + OTP-specific rate limiting
- [x] Input validation (express validator + Mongoose)
- [x] OTP hashed with bcrypt
- [x] JWT in HTTP-only, Secure, SameSite=Strict cookie
- [x] No secrets in source code
- [x] Stack traces hidden in production
- [x] Duplicate email/mobile checks
- [x] Verification token enforces OTP completion
- [x] Role validated server-side (never trust frontend)
- [x] Inactive accounts blocked
- [x] Skills/products validated against authoritative backend lists
- [x] TTL index auto-deletes OTP sessions after 30 minutes

---

## Production Deployment

### Frontend (Vercel)

1. Push `client/` to GitHub
2. Import to Vercel
3. Set environment variable: `VITE_API_URL=https://api.yourdomain.com/api`
4. Deploy

### Backend (Render / Railway)

1. Push `server/` to GitHub
2. Set all environment variables from `.env.example`
3. Start command: `npm start`
4. Set `NODE_ENV=production`
5. Update `CLIENT_URL` to your Vercel frontend URL

### Database (MongoDB Atlas)

1. Create cluster
2. Create database user
3. Whitelist backend server IP
4. Copy connection string to `MONGO_URI`

### Email (Resend)

1. Create account at resend.com
2. Add and verify your domain
3. Create API key
4. Set `RESEND_API_KEY` and `EMAIL_FROM`

---

## MongoDB Indexes

The following indexes are created automatically:
- `users.email` — unique
- `users.mobile` — unique
- `otpverifications.email + type` — compound lookup index
- `otpverifications.createdAt` — TTL index (auto-delete after 30 min)

---

## License

MIT
