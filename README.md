<div align="center">
  <img src="frontend/src/assets/logo.png" alt="IEEE GEHU" width="110" />
  <h2>IEEE Student Branch — GEHU Dehradun</h2>
  <p><em>Advancing Technology for Humanity</em></p>

  <p>
    <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions/workflows/ci.yml">
      <img src="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions/workflows/ci.yml/badge.svg" alt="CI" />
    </a>
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
    <img src="https://img.shields.io/badge/node-%3E%3D18-green" alt="Node.js" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" />
  </p>

  <p>
    <a href="https://ieee-gehu.vercel.app"><strong>Live Site</strong></a> ·
    <a href="SETUP.md"><strong>Setup Guide</strong></a> ·
    <a href="#api-reference"><strong>API Reference</strong></a> ·
    <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/issues"><strong>Issues</strong></a>
  </p>
</div>

---

## Overview

Official web platform of the **IEEE Student Branch at Graphic Era Hill University, Dehradun**. A production-grade full-stack application with a public events portal, animated landing page, and a JWT-secured admin dashboard for live content management.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | React 19, Vite, Tailwind CSS v4, Framer Motion |
| Backend | Node.js, Express.js, Mongoose |
| Database | MongoDB Atlas |
| Storage | Cloudinary |
| Auth | JSON Web Tokens (JWT) |
| Testing | Vitest, React Testing Library |
| CI/CD | GitHub Actions |
| Deployment | Vercel (frontend) · Render (backend) |

---

## Features

**Public Portal**
- Animated landing page with faculty, events, and contact sections
- Events Archive — searchable, filterable, server-side paginated
- Responsive across all devices

**Admin Dashboard**
- Secure JWT login with auto-initialized admin account
- Full CRUD for Events and Team Members with Cloudinary image uploads
- Rate limiting via `express-rate-limit`

---

## Project Structure

```
ieee.web/
├── frontend/               # React 19 application
│   └── src/
│       ├── components/     # Navbar, ArchiveNavbar, Footer, animations
│       ├── pages/          # Home, EventsArchive, Admin (protected)
│       └── test/           # Vitest unit tests
│
├── backend/                # Node.js / Express REST API
│   ├── models/             # Admin, Event, Team schemas
│   ├── routes/             # api.js (public), auth.js (protected)
│   └── server.js           # Entry point
│
└── .github/workflows/      # CI pipeline
```

---

## API Reference

### Public

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/events` | Paginated events (`?page`, `?limit`, `?search`, `?category`) |
| GET | `/api/team` | All team members |
| POST | `/api/contact` | Contact form submission |

### Protected *(Bearer token required)*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/auth/login` | Returns a JWT |
| POST/PUT/DELETE | `/api/auth/events/:id` | Events CRUD |
| POST/PUT/DELETE | `/api/auth/team/:id` | Team CRUD |

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feat/your-feature`
3. Commit using [Conventional Commits](https://www.conventionalcommits.org)
4. Open a pull request against `main`

> All PRs must pass the CI pipeline. Branch protection is enforced on `main`.

For local setup instructions, see **[SETUP.md](SETUP.md)**.

---

## License

MIT — see [`LICENSE`](LICENSE) for details.

---

<div align="center">
  <sub>IEEE Student Branch · Graphic Era Hill University, Dehradun</sub>
</div>
