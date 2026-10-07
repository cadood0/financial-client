# FinAdmin

Next.js frontend for the Financial Contribution Management System. Administrators sign in, review collections, and manage members, charges, and payments against an existing Go API.

The browser never calls the API origin directly. Requests go to `/api/v1` on this app, and Next.js rewrites them to the backend.

## Features

| Area | Route | What it does |
| --- | --- | --- |
| Dashboard | `/dashboard` | Totals, monthly revenue, revenue by city and fee type, recent payments |
| Members | `/members` | Search, filter by city, create, edit, and soft-delete members |
| Member detail | `/members/[id]` | Charges and payments for one member, with record-payment |
| Payments | `/payments` | Immutable ledger and a record-payment wizard with a live balance |
| Payment history | `/payments/history` | Newest payments first |
| Monthly charges | `/monthly-charges` | Recurring fees per member and fee type |
| Cities | `/cities` | City and region records |
| Fee types | `/fee-types` | Active and inactive fee types |
| Users | `/users` | Staff accounts (create uses register) |

Sign-in is at `/login`. Authenticated routes require a JWT; a `401` clears the token and returns to login. Amounts from the API are integer cents and are shown as currency in the UI.

## Stack

- [Next.js](https://nextjs.org) 16 (App Router) and React 19
- TypeScript
- Tailwind CSS 4 and [shadcn/ui](https://ui.shadcn.com)
- TanStack Query, Axios
- React Hook Form and Zod
- Recharts, Lucide, Sonner

The backend is a separate Go service (Gin + PostgreSQL). This repo only consumes its REST API under `/api/v1`.

## Requirements

- Node.js 22
- npm
- A running API, by default at `http://localhost:8080`

## Local development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For local `next dev`, leave the proxy pointed at the host API:

```env
NEXT_PUBLIC_API_BASE_URL=/api/v1
API_PROXY_TARGET=http://localhost:8080
```

`API_PROXY_TARGET` is read when the Next.js process starts. Restart `npm run dev` after you change it.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` | Production build (`output: "standalone"`) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Environment

| Variable | When | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | Build | Browser base path. Keep `/api/v1` so calls stay same-origin. |
| `API_PROXY_TARGET` | Build (Docker) / startup (dev) | Origin Next.js forwards `/api/v1/*` to. |
| `FRONTEND_PORT` | Compose | Host port mapped to the container (`3000`). |

Typical targets:

| Setup | `API_PROXY_TARGET` |
| --- | --- |
| API on your machine | `http://localhost:8080` |
| API published on the VPS host | `http://host.docker.internal:8080` |
| API container named `api` on the same Docker network | `http://api:8080` |
| Public API | `https://api.example.com` |

In Docker, both `NEXT_PUBLIC_*` and `API_PROXY_TARGET` are baked in at image build time. Change them, then rebuild.

The API must allow this app’s origin (`FRONTEND_ORIGIN` on the backend), for example `http://localhost:3000`.

## Project layout

```text
app/            Routes (auth and dashboard)
modules/        Feature screens (dashboard, members, payments, …)
components/     Shared UI, layout, and auth guards
services/       Axios calls, one file per resource
hooks/          Query and form helpers
providers/      Auth, React Query, layout
layouts/        Dashboard and auth shells
types/          API types
constants/      Routes, navigation, endpoints
lib/            Axios client, token storage, query client
utils/          Currency, dates, API errors
```

## Docker

On a server that already serves the API on port `8080`:

```bash
cp .env.example .env
docker compose up -d --build
```

The app listens on `FRONTEND_PORT` (default `3000`). Full VPS steps, Nginx, and HTTPS are in [docs/deploy-vps.md](docs/deploy-vps.md).

```text
Browser → :3000 FinAdmin (Next.js)
              └── rewrite /api/v1/* → API_PROXY_TARGET (Go API :8080)
                                          └── PostgreSQL
```
