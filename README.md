# SecureConnect

A full-stack social networking platform with enhanced privacy controls — built as an HND final year project.

## Tech Stack

- **Frontend:** React (Vite) + Tailwind CSS + Zustand + Axios
- **Backend:** Node.js + Express + MongoDB/Mongoose + JWT
- **Security:** bcrypt, speakeasy (TOTP MFA), libsodium-wrappers (E2EE)
- **Storage:** Supabase Storage (media)
- **Email:** Brevo API
- **Hosting:** Render (backend), Vercel (frontend)

## Features

1. **Authentication & MFA** — Register/login with bcrypt, email verification, JWT access/refresh tokens, TOTP-based MFA
2. **Role-Based Access Control (RBAC)** — User, moderator, admin roles with route-level guards
3. **Privacy Controls** — Per-post visibility (public/friends/custom/only me), block list, profile-level privacy settings, data download & account deletion
4. **End-to-End Encrypted Messaging** — libsodium box encryption, private key stored client-side in IndexedDB
5. **Social Features** — Friend requests, news feed with server-enforced visibility, likes/comments, content reporting
6. **Security Hardening** — Helmet, rate limiting, input validation, audit logging, account lockout
7. **Admin Dashboard** — Report queue, user suspension, audit logs, usage stats

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB Atlas cluster
- Supabase project (Storage bucket)
- Brevo API key

### Backend Setup
```bash
cd backend
cp .env.example .env
# Fill in your MONGO_URI, JWT secrets, BREVO_API_KEY, SUPABASE_URL, SUPABASE_SERVICE_KEY
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies `/api` requests to the backend on `http://localhost:5000`.

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/auth/mfa/verify | Verify MFA code |
| POST | /api/auth/refresh | Refresh access token |
| POST | /api/auth/logout | Logout |
| GET | /api/posts/feed | Get news feed |
| POST | /api/posts | Create post |
| POST | /api/posts/:id/like | Like/unlike post |
| POST | /api/posts/:id/comments | Add comment |
| POST | /api/friends/request/:id | Send friend request |
| POST | /api/messages/:userId | Send encrypted message |
| GET | /api/messages/:userId | Get conversation |
| POST | /api/reports | Report content |
| GET | /api/admin/reports | View reports (mod/admin) |
| PATCH | /api/admin/users/:id/suspend | Suspend user (admin) |

## Testing (Simulated Attacks)

- Brute-force login: Rate limiter blocks after 5 attempts
- Visibility bypass: Direct API calls to friends-only posts return 403
- XSS: Content sanitized via mongoose + React escaping
- RBAC: Normal users get 403 on `/api/admin/*`
- E2EE: Messages stored as ciphertext only
- Password reset: Token invalidated after use
