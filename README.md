# Dr. Fix

**A smart home service management platform** — connecting homeowners in Dhaka with verified electricians, plumbers, cleaners, carpenters, painters, and AC technicians. Built for CSE‑3100 (Web Application Development with DevOps) at Ahsanullah University of Science and Technology.

---

## Table of Contents

- [Overview](#overview)
- [Team](#team)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Features Built So Far](#features-built-so-far)
- [Getting Started](#getting-started)
- [Design System](#design-system)
- [Git Workflow](#git-workflow)
- [Roadmap](#roadmap)
- [Course Context](#course-context)
- [Related Documentation](#-related-documentation)

---

## Overview

Finding a reliable home service professional in Dhaka usually means asking around and hoping for the best — no organized booking, no way to verify quality, no way to track a job in progress. Dr. Fix fixes that with:

- **Verified providers** across common home-service categories
- **A live "job ticket" booking flow** — request, dispatch, track, close
- **A customer dashboard** for bookings, notifications, and history
- Foundations for **ratings, payments, and a provider-side app** as the project grows

The frontend currently runs entirely on placeholder/mock data — there is no backend or real authentication yet (see [Roadmap](#roadmap)).

## Team

| Name | Role |
|---|---|
| Abdur Rahman Aiman | Project Lead — Frontend, Architecture, GitHub, Documentation |
| Munawar Mahtab Moon | Backend — Laravel, API |
| Raisul Islam Sifat | Database, Testing, Documentation |

## Tech Stack

**Frontend (built)**
- React 19 + Vite
- Tailwind CSS v4 (`@tailwindcss/vite`)
- React Router v7
- Lucide React (icons)

**Backend (planned, not started)**
- Laravel (PHP 8.5)
- MySQL

**DevOps (planned)**
- Docker + Docker Compose
- Nginx
- VPS deployment

## Project Structure

```
dr-fix/
├── package.json                 # Root workspace configuration
├── docker-compose.yml           # Docker orchestration
├── BRANCH_STRATEGY.md           # Team workflow guide
├── docs/
│   ├── API-Docs.md              # API endpoints documentation
│   └── ER-Diagram.md            # Database schema diagram
├── packages/
│   ├── frontend/                # React frontend
│   │   ├── Dockerfile
│   │   ├── package.json
│   │   ├── .dockerignore
│   │   └── src/
│   │       ├── components/
│   │       │   ├── Navbar.jsx
│   │       │   ├── Footer.jsx
│   │       │   ├── ProtectedRoute.jsx
│   │       │   ├── ScrollToTop.jsx
│   │       │   └── dashboard/
│   │       │       ├── DashboardLayout.jsx
│   │       │       ├── DashboardSidebar.jsx
│   │       │       ├── DashboardTopbar.jsx
│   │       │       └── StatusBadge.jsx
│   │       ├── pages/
│   │       │   ├── Landing.jsx
│   │       │   ├── Login.jsx
│   │       │   ├── Register.jsx
│   │       │   ├── ForgotPassword.jsx
│   │       │   ├── Services.jsx
│   │       │   ├── BookService.jsx
│   │       │   ├── NotFound.jsx
│   │       │   └── dashboard/
│   │       │       ├── Overview.jsx
│   │       │       ├── Bookings.jsx
│   │       │       └── ComingSoon.jsx
│   │       ├── data/
│   │       │   └── placeholder.js    # mock categories, services, bookings, notifications
│   │       ├── lib/
│   │       │   └── auth.js           # mock localStorage-based auth
│   │       ├── App.jsx
│   │       ├── main.jsx
│   │       └── index.css             # design tokens + shared component classes
│   ├── backend/                 # Laravel backend
│   │   ├── Dockerfile
│   │   ├── composer.json
│   │   ├── nginx.conf
│   │   ├── .env.example
│   │   └── .dockerignore
│   ├── database/                # Database migrations
│   │   └── migrations/
│   │       ├── 2026_08_01_create_users_table.sql
│   │       ├── 2026_08_01_create_services_table.sql
│   │       ├── 2026_08_01_create_bookings_table.sql
│   │       └── 2026_08_01_create_reviews_table.sql
│   └── shared/                  # Shared types, constants, utilities
│       ├── package.json
│       └── src/
│           ├── types/
│           ├── constants/
│           └── utils/
└── assets/                      # logos, icons, mockups
```

## Features Built So Far

**Landing page**
- Hero with search bar and live-style stats
- Interactive category "toolbelt" — selecting a category swaps a detail card and image
- "How it works" — four-step job ticket flow
- Popular services grid, testimonials, provider sign-up CTA

**Auth pages**
- Login, Register (customer/provider role toggle), Forgot Password
- Mock authentication via `localStorage` (`src/lib/auth.js`) — stands in for the real Laravel API

**Services**
- Searchable, category-filterable service grid pulling from placeholder data

**Booking flow**
- Service detail → address/date/notes form → confirmation screen
- Redirects to login first if the visitor isn't authenticated

**Customer dashboard** (protected route, nested under `/dashboard`)
- Sidebar navigation + topbar with notification dropdown and user menu
- Overview: stats cards + popular services
- Bookings: tab-filterable table with status badges (Completed / Pending / In Progress / Cancelled)
- Messages, Payments, Reviews, Settings: stubbed with a "coming soon" placeholder

**Design system**
- Unified navy / amber / teal palette with a "dispatch ticket" visual motif (perforated dividers, notched cards, monospace job tags)
- Shared button, card, input, and badge classes defined once in `index.css`

## Getting Started

### Prerequisites
- Node.js (v20+)
- Docker & Docker Compose (optional)
- PHP 8.2+ (for backend development)

### Installation

```bash
# Clone the repository
git clone https://github.com/AimanCrafts/Dr-Fix.git
cd Dr-Fix

# Install root dependencies
npm run setup
```

### Development

```bash
# Start frontend only
npm run dev:frontend

# Start backend (when implemented)
npm run dev:backend

# Start all services
npm run dev
```

### Docker Setup

```bash
# Start all services with Docker
docker-compose up -d

# Access services
# Frontend: http://localhost:5173
# Backend: http://localhost:8000
# Database: localhost:3306

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## Design System

- **Colors:** ink navy `#0f2546`, amber `#f68d18`, teal `#2EBAAA`, on a light paper background
- **Type:** Space Grotesk (headings), Inter (body), JetBrains Mono (labels, prices, IDs)
- **Signature motif:** everything reads like a service dispatch ticket — perforated section dividers, notched card corners, and mono "job tag" labels (`#DF‑0417`, `SVC‑211`)

## Git Workflow

- Branches: `main` → `develop` → `feature/*`, `bugfix/*`
- Commit prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `build:`, `chore:`
- Work happens from the repository root (`dr-fix/`), not inside `packages/` individually, so Git, Docker, and docs stay under one workspace

See [BRANCH_STRATEGY.md](./BRANCH_STRATEGY.md) for the detailed workflow.

## Roadmap

| Phase | Status |
|---|---|
| Dev environment & GitHub setup | ✅ Done |
| React frontend (mock data) | ✅ Done |
| Monorepo structure | ✅ Done |
| Docker configuration | ✅ Done |
| Database migrations | ✅ Done |
| Laravel backend | ⏳ In Progress |
| Real authentication | ⏳ In Progress |
| Frontend integration | ⏳ In Progress |
| VPS deployment | ⏳ Not Started |
| Payments, real-time notifications, provider-side app, admin panel | ⏳ Not Started |

## Course Context

Built for **CSE‑3100 — Web Application Development with DevOps**, AUST, alongside two other project ideas (TrekWise, KrishiBondhu) proposed for the Database Lab course.

---

## 📦 Monorepo Commands

| Command | Description |
|---------|-------------|
| `npm run setup` | Install all dependencies |
| `npm run dev:frontend` | Start frontend only |
| `npm run dev:backend` | Start backend only |
| `npm run dev` | Start all services |
| `npm run build` | Build all packages |
| `npm run lint` | Lint all packages |

---

## 📚 Related Documentation

- [API Documentation](./docs/API-Docs.md)
- [Database ER Diagram](./docs/ER-Diagram.md)
- [Branch Strategy](./BRANCH_STRATEGY.md)
