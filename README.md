<div align="center">
  <img src="frontend/src/assets/logo.png" alt="IEEE GEHU" width="120" />
  <h2>IEEE Student Branch — GEHU Dehradun</h2>
  <p>The official web platform of the IEEE Student Branch at Graphic Era Hill University, Dehradun.</p>
  <p>
    <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions/workflows/ci.yml">
      <img src="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions/workflows/ci.yml/badge.svg" alt="CI" />
    </a>
    <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/blob/main/LICENSE">
      <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
    </a>
    <img src="https://img.shields.io/badge/node-%3E%3D18-green" alt="Node.js version" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs welcome" />
  </p>
  <p>
    <a href="https://ieee-gehu.vercel.app"><strong>Live Site</strong></a> ·
    <a href="#getting-started"><strong>Getting Started</strong></a> ·
    <a href="#api-reference"><strong>API Docs</strong></a> ·
    <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/issues"><strong>Issues</strong></a>
  </p>
</div>

---

## Overview

This repository contains the complete source code for the IEEE Student Branch GEHU website — a full-stack web application consisting of a public-facing portal and a secure administrative dashboard.

The frontend is built with **React 19** and **Tailwind CSS v4**, featuring server-side paginated event browsing, animated UI components, and a fully responsive layout. The backend is a **Node.js/Express** REST API connected to **MongoDB Atlas**, with **Cloudinary** handling persistent media storage and **JWT** authentication securing the admin panel.

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### Public Portal

- **Landing Page** — Animated hero section, faculty showcase, events preview, and contact form
- **Events Archive** — Fully searchable, category-filtered, and server-side paginated event history
- **Responsive Design** — Mobile-first layouts that adapt across all screen sizes
- **Smooth Animations** — Framer Motion powered staggered reveals and page transitions

### Admin Dashboard

- **Authentication** — JWT-secured login with auto-initialized default admin on first run
- **Events Management** — Create, update, and delete events with Cloudinary image uploads
- **Team Management** — Manage team members, roles, and profile photos
- **Security** — Rate limiting via `express-rate-limit` to mitigate brute force and DoS attacks

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas (via Mongoose) |
| **Media Storage** | Cloudinary |
| **Authentication** | JSON Web Tokens (JWT) |
| **Testing** | Vitest, React Testing Library |
| **CI/CD** | GitHub Actions |
| **Deployment** | Vercel (frontend), Render (backend) |

---

## Project Structure

```
ieee.web/
├── .github/
│   └── workflows/
│       └── ci.yml                  # Runs frontend tests on every push
│
├── frontend/
│   ├── src/
│   │   ├── assets/                 # Static assets (logo, illustrations)
│   │   ├── components/
│   │   │   ├── animations/         # Reveal and scroll-based animation wrappers
│   │   │   ├── ArchiveNavbar.jsx   # Minimal floating navbar for archive pages
│   │   │   ├── Navbar.jsx          # Full-featured landing page navbar
│   │   │   └── Footer.jsx
│   │   ├── pages/
│   │   │   ├── Home.jsx            # Public landing page
│   │   │   ├── EventsArchive.jsx   # Paginated events archive
│   │   │   └── admin/              # JWT-protected admin dashboard pages
│   │   ├── test/                   # Vitest unit tests
│   │   ├── config.js               # API base URL (reads from VITE_API_URL)
│   │   └── index.css               # Global CSS design tokens and utilities
│   └── vite.config.js
│
└── backend/
    ├── config/
    │   ├── cloudinary.js           # Cloudinary SDK setup
    │   └── db.js                   # MongoDB Atlas connection
    ├── models/
    │   ├── Admin.js                # Admin schema with bcrypt password hashing
    │   ├── Event.js                # Event schema
    │   └── Team.js                 # Team member schema
    ├── routes/
    │   ├── api.js                  # Public API routes (events, team, contact)
    │   └── auth.js                 # Protected admin routes (CRUD + login)
    └── server.js                   # App entry point (rate limiter, DB init)
```

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) `>= 18.x`
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Cloudinary](https://cloudinary.com) account

### Installation

**1. Clone the repository**

```bash
git clone https://github.com/IEEE-Student-Branch-GEHU/ieee.web.git
cd ieee.web
```

**2. Install dependencies**

```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

**3. Configure environment variables**

Create a `.env` file inside `backend/`:

```env
# MongoDB Atlas connection string
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ieee-gehu

# Cloudinary credentials (from your Cloudinary dashboard)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT secret key (use a strong, random string)
JWT_SECRET=your_jwt_secret
```

> **Note:** Never commit `.env` files. The file is already listed in `.gitignore`.

**4. Start the development servers**

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm start

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## Running Tests

Tests are written with **Vitest** and **React Testing Library** and are automatically run in CI on every push.

```bash
cd frontend
npm test
```

The test suite validates core functionality of the `EventsArchive` component: render correctness, server-side pagination, search filtering, category filtering, error states, and unexpected data handling.

---

## API Reference

### Public Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/events` | Returns paginated events. Accepts `?page`, `?limit`, `?search`, `?category` |
| `GET` | `/api/team` | Returns all team members sorted by `order` |
| `POST` | `/api/contact` | Accepts a contact form submission |

### Protected Endpoints

All protected routes require an `Authorization: Bearer <token>` header obtained from `/api/auth/login`.

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Validates credentials and returns a JWT |
| `POST` | `/api/auth/events` | Creates a new event |
| `PUT` | `/api/auth/events/:id` | Updates an event |
| `DELETE` | `/api/auth/events/:id` | Deletes an event |
| `POST` | `/api/auth/team` | Adds a team member |
| `PUT` | `/api/auth/team/:id` | Updates a team member |
| `DELETE` | `/api/auth/team/:id` | Removes a team member |

---

## Deployment

| Service | Platform | Notes |
| :--- | :--- | :--- |
| Frontend | [Vercel](https://vercel.com) | Set the `VITE_API_URL` environment variable to your backend URL |
| Backend | [Render](https://render.com) | Add all backend `.env` variables via the Render dashboard |

---

## Contributing

Contributions are welcome. To get started:

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes using [Conventional Commits](https://www.conventionalcommits.org): `git commit -m "feat: add new feature"`
4. Push to your fork: `git push origin feat/your-feature`
5. Open a pull request against the `main` branch

All pull requests must pass the CI pipeline before merging. Branch protection is enforced on `main`.

---

## License

Distributed under the MIT License. See [`LICENSE`](LICENSE) for details.

---

<div align="center">
  <sub>IEEE Student Branch — Graphic Era Hill University, Dehradun</sub><br/>
  <sub><em>Advancing Technology for Humanity</em></sub>
</div>
