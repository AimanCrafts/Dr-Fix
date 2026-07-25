# Dr. Fix

**A smart home service management platform** — connecting homeowners in Dhaka with verified electricians, plumbers, cleaners, carpenters, painters, and AC technicians.

> Reliable help, dispatched to your door.

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
├── assets/                  # logos, icons, mockups
├── docs/                    # ER diagram, schema, API docs
├── client/                  # React frontend (this app)
│   ├── public/
│   │   ├── favicon.svg
│   │   └── icons.svg
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── Footer.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── ScrollToTop.jsx
│       │   └── dashboard/
│       │       ├── DashboardLayout.jsx
│       │       ├── DashboardSidebar.jsx
│       │       ├── DashboardTopbar.jsx
│       │       └── StatusBadge.jsx
│       ├── pages/
│       │   ├── Landing.jsx
│       │   ├── Login.jsx
│       │   ├── Register.jsx
│       │   ├── ForgotPassword.jsx
│       │   ├── Services.jsx
│       │   ├── BookService.jsx
│       │   ├── NotFound.jsx
│       │   └── dashboard/
│       │       ├── Overview.jsx
│       │       ├── Bookings.jsx
│       │       └── ComingSoon.jsx
│       ├── data/
│       │   └── placeholder.js   # mock categories, services, bookings, notifications
│       ├── lib/
│       │   └── auth.js          # mock localStorage-based auth
│       ├── App.jsx
│       ├── main.jsx
│       └── index.css            # design tokens + shared component classes
└── server/                  # Laravel backend (not started)
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

```bash
cd client
npm install
npm run dev       # start dev server
npm run build      # production build
npm run preview    # preview the production build
npm run lint        # run ESLint
```

## Design System

- **Colors:** ink navy `#0f2546`, amber `#f68d18`, teal `#2EBAAA`, on a light paper background
- **Type:** Space Grotesk (headings), Inter (body), JetBrains Mono (labels, prices, IDs)
- **Signature motif:** everything reads like a service dispatch ticket — perforated section dividers, notched card corners, and mono "job tag" labels (`#DF‑0417`, `SVC‑211`)

## Git Workflow

- Branches: `main` → `develop` → `feature/*`, `bugfix/*`
- Commit prefixes: `feat:`, `fix:`, `docs:`, `style:`, `refactor:`, `test:`, `build:`, `chore:`
- Work happens from the repository root (`dr-fix/`), not inside `client/` or `server/` individually, so Git, Docker, and docs stay under one workspace

## Roadmap

| Phase | Status |
|---|---|
| Dev environment & GitHub setup | Done |
| React frontend (mock data) | Done |
| Laravel backend | Not started |
| Database (MySQL, migrations, seeders) | Not started |
| Real authentication (replacing mock localStorage auth) | Not started |
| Docker + VPS deployment | Not started |
| Payments, real-time notifications, provider-side app, admin panel | Not started |

## Course Context

Built for **CSE‑3100 — Web Application Development with DevOps**, AUST, alongside two other project ideas (TrekWise, KrishiBondhu) proposed for the Database Lab course.
