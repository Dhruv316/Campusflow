# CampusFlow

[![Node.js](https://img.shields.io/badge/Node.js-18+-339933?logo=node.js&logoColor=white)](https://nodejs.org)
[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15+-4169E1?logo=postgresql&logoColor=white)](https://postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?logo=prisma&logoColor=white)](https://prisma.io)
[![Vercel](https://img.shields.io/badge/Frontend-Vercel-000000?logo=vercel&logoColor=white)](https://vercel.com)
[![Railway](https://img.shields.io/badge/Backend-Railway-0B0D0E?logo=railway&logoColor=white)](https://railway.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

> The all-in-one college events management platform — built for students to discover events, admins to manage them, and everyone to grow together.

---

## Features

### For Students
- 🔍 Browse and filter events by category, date, and keyword
- 📝 One-click registration with automatic QR ticket generation
- 🎫 View, download, and print your entry QR code
- 🏅 Download verified PDF participation certificates
- 🔔 Live notifications for approvals, new events, and certificates
- ⭐ Rate and review events after attending

### For Admins
- 📅 Full event CRUD — create, publish, cancel, and delete events
- 👥 Approve, reject, or waitlist registrations with auto-promotion
- ✅ QR check-in flow to mark students as attended
- 📜 Issue PDF certificates to attended students
- 📊 Analytics dashboard with 30-day registration trends
- 📣 Broadcast announcements to all students or event attendees
- 🔐 Activate/deactivate user accounts

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, Tailwind CSS, React Router v6 |
| State | TanStack Query v5, React Context |
| Backend | Node.js, Express 4 |
| Database | PostgreSQL, Prisma ORM |
| Auth | JWT (access 15 min + refresh 7 d), bcrypt |
| QR Codes | `qrcode` (server-side PNG) |
| PDFs | `html-pdf-node` (certificate generation) |
| Logging | Winston |
| Security | Helmet, express-rate-limit, input sanitization |
| Deploy | Vercel (frontend), Railway (backend + DB) |

---

## Local Development

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally
- npm or pnpm

### 1 — Clone

```bash
git clone https://github.com/your-org/campusflow.git
cd campusflow
```

### 2 — Install dependencies

```bash
cd server && npm install
cd ../client && npm install
```

### 3 — Environment variables

```bash
# Backend
cd server
cp .env.example .env          # fill in DATABASE_URL and JWT secrets

# Frontend
cd ../client
cp .env.example .env          # set VITE_API_URL=http://localhost:5000
```

Minimum `server/.env`:

```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/campusflow
JWT_ACCESS_SECRET=any-long-random-string-min-64-chars
JWT_REFRESH_SECRET=different-long-random-string
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 4 — Database setup

```bash
cd server
npx prisma migrate dev --name init   # create tables
npx prisma generate                  # generate client
npm run db:seed                      # seed admin + sample events
```

Seed credentials: **admin@campusflow.app** / **Admin@123**

### 5 — Run dev servers

```bash
# Terminal 1 — API (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — UI (http://localhost:5173)
cd client && npm run dev
```

---

## Deployment

### Backend → Railway

1. Create a project at [railway.app](https://railway.app), add a **PostgreSQL** plugin.
2. Connect your repo; set **Root Directory** = `server`.
3. Railway reads `railway.json` and runs:
   ```
   npx prisma migrate deploy && node server.js
   ```
4. Set environment variables in the Railway dashboard (see `server/.env.production.example`):

| Variable | Notes |
|----------|-------|
| `DATABASE_URL` | Auto-set by Railway PostgreSQL plugin |
| `JWT_ACCESS_SECRET` | 64+ char random string |
| `JWT_REFRESH_SECRET` | Different 64+ char random string |
| `CLIENT_URL` | Your Vercel URL, e.g. `https://campusflow.vercel.app` |
| `NODE_ENV` | `production` |

### Frontend → Vercel

1. New Project → import repo → set **Root Directory** = `client`.
2. Vercel auto-detects Vite; no extra build config needed.
3. Add one environment variable:

| Variable | Value |
|----------|-------|
| `VITE_API_URL` | Your Railway URL, e.g. `https://campusflow.railway.app` |

`client/vercel.json` handles SPA routing rewrites automatically.

---

## Project Structure

```
campusflow/
├── client/                     # React + Vite frontend
│   ├── src/
│   │   ├── api/                # Axios service files (6)
│   │   ├── components/
│   │   │   ├── events/         # EventCard, EventFilters
│   │   │   ├── layout/         # Layouts, Sidebars, TopBar
│   │   │   ├── registrations/  # RegistrationRow
│   │   │   └── ui/             # 15+ UI primitives + ErrorBoundary, Skeleton
│   │   ├── context/            # AuthContext
│   │   ├── hooks/              # useAuth, useDebounce, useLocalStorage, useMediaQuery
│   │   ├── pages/
│   │   │   ├── admin/          # 8 admin pages
│   │   │   ├── auth/           # Login, Register
│   │   │   └── student/        # 8 student pages
│   │   ├── routes/             # Route guards
│   │   └── utils/              # helpers.js
│   └── vercel.json
│
└── server/                     # Express API
    ├── prisma/
    │   ├── schema.prisma       # 6 Prisma models
    │   └── seed.js
    ├── src/
    │   ├── controllers/        # 6 controllers (auth, event, registration…)
    │   ├── middleware/         # auth, error, validate, rateLimiter
    │   ├── routes/             # 8 route files
    │   └── utils/              # prisma, jwt, ApiError, logger
    ├── logs/                   # Winston logs (gitignored)
    └── railway.json
```

---

## API Reference

Base URL: `/api/v1`

### Auth
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/auth/register` | — | Register student |
| POST | `/auth/login` | — | Login, returns tokens |
| POST | `/auth/logout` | ✓ | Invalidate refresh token |
| POST | `/auth/refresh` | — | Refresh access token |
| GET  | `/auth/me` | ✓ | Current user |

### Events
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/events` | — | List (paginated, filterable) |
| GET | `/events/:id` | — | Single event + student's registration |
| POST | `/events` | Admin | Create |
| PUT | `/events/:id` | Admin | Update |
| DELETE | `/events/:id` | Admin | Delete |
| PATCH | `/events/:id/status` | Admin | Change status |

### Registrations
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/registrations` | Student | Register for event |
| GET | `/registrations/my` | Student | Own registrations |
| DELETE | `/registrations/:id` | Student | Cancel |
| POST | `/registrations/:id/feedback` | Student | Submit rating + feedback |
| GET | `/registrations/event/:id` | Admin | Registrations for event |
| PATCH | `/registrations/:id/status` | Admin | Approve/reject/waitlist |
| POST | `/registrations/:id/checkin` | Admin | Check in |

### Users
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/users` | Admin | All users |
| GET | `/users/:id` | Admin | Single user |
| PATCH | `/users/:id/status` | Admin | Toggle active |
| PUT | `/users/profile` | ✓ | Update profile |
| POST | `/users/change-password` | ✓ | Change password |
| GET | `/users/my-stats` | Student | Own event stats |

### Certificates
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/certificates/issue/:registrationId` | Admin | Issue certificate |
| GET | `/certificates/admin` | Admin | All certificates |
| GET | `/certificates/my` | Student | Own certificates |
| GET | `/certificates/:id/download` | Student | Download PDF |

### Notifications
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| POST | `/notifications/announce` | Admin | Send announcement |
| GET | `/notifications/admin` | Admin | Admin inbox |
| GET | `/notifications/my` | ✓ | Own notifications |
| PATCH | `/notifications/read-all` | ✓ | Mark all read |
| PATCH | `/notifications/:id/read` | ✓ | Mark one read |

### Analytics & Health
| Method | Path | Auth | Description |
|--------|------|:----:|-------------|
| GET | `/analytics/overview` | Admin | Overview stats |
| GET | `/analytics/events` | Admin | Per-event breakdown |
| GET | `/analytics/trends` | Admin | 30-day trend data |
| GET | `/health` | — | Health check |

---

## Contributing

1. Fork the repo and create a branch: `git checkout -b feat/your-feature`
2. Commit using [Conventional Commits](https://conventionalcommits.org): `git commit -m 'feat: add feature'`
3. Push and open a Pull Request

---

## License

[MIT](LICENSE) — made with ♥ for students everywhere.
