<div align="center">
  <img src="frontend/src/assets/logo.png" alt="IEEE GEHU" width="110" />
  <h2>IEEE Student Branch — GEHU Dehradun</h2>
  <p><em>Advancing Technology for Humanity</em></p>

  <p>
    <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions/workflows/ci.yml">
      <img src="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions/workflows/ci.yml/badge.svg" alt="CI" />
    </a>
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="License" />
    <img src="https://img.shields.io/badge/node-20.19.0-green" alt="Node.js" />
    <img src="https://img.shields.io/badge/PRs-welcome-brightgreen" alt="PRs Welcome" />
  </p>

  <p>
    <a href="https://ieee-gehu.vercel.app"><strong>🌐 Live Site</strong></a> ·
    <a href="SETUP.md"><strong>📦 Setup Guide</strong></a> ·
    <a href="#api-reference"><strong>📡 API Docs</strong></a> ·
    <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/blob/main/CONTRIBUTING.md"><strong>🤝 Contributing</strong></a> ·
    <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/issues"><strong>🐛 Issues</strong></a>
  </p>
</div>

---

## Overview

Official web platform of the **IEEE Student Branch at Graphic Era Hill University, Dehradun**. A production-grade full-stack application with a public events portal, community directory, member-owned profile dashboard, and JWT-secured administration for live content management.

---

## Tech Stack

| Layer | Technology |
| :--- | :--- |
| Frontend | Next.js App Router, React 19, Tailwind CSS v4, Framer Motion |
| Backend | Express API mounted through Next.js, Mongoose |
| Database | MongoDB Atlas |
| Storage | Cloudinary |
| Auth | JSON Web Tokens (JWT) |
| Testing | Vitest, React Testing Library |
| CI/CD | GitHub Actions |
| Deployment | Vercel (single Next.js application) with an Express rollback on Render |

---

## Features

**Public Portal**
- Animated landing page with faculty, events, and contact sections
- Events Archive — searchable, filterable, server-side paginated
- Community directory — year-filtered public member profiles with legacy `/teams` compatibility
- Responsive across all devices

**Admin Dashboard**
- Secure JWT login with administrator-provisioned accounts
- Full CRUD for Events and Team Members with Cloudinary image uploads
- Administrator-authorized volunteer Google Sign-In with revoke/reassignment controls
- Rate limiting via `express-rate-limit`

**Member Portal**
- Administrator-provisioned member accounts with one-time activation
- Server-enforced ownership for profile edits and certificate records
- Profile-image uploads with extension/MIME/size validation and Cloudinary cleanup on persistence failure
- Optional Google Sign-In for volunteers explicitly authorized by an administrator
- Certificates are private by default and can be made public explicitly by their owner

---

## Project Structure

```
ieee.web/
├── frontend/               # React 19 application
│   └── src/
│       ├── app/             # Next.js App Router pages and layouts
│       ├── components/     # Navbar, archive, member, admin, animations
│       ├── pages/           # Shared client page components and legacy Vite adapters
│       └── test/            # Vitest unit tests
│
├── frontend/server/        # Canonical Express API, mounted by Next.js and runnable standalone
├── frontend/src/pages/api/ # Next.js adapter that mounts frontend/server/
│
├── backend/                # Preserved Express rollback/reference implementation
│   ├── models/             # Admin, Event, Team, Member, Certificate schemas
│   ├── routes/             # api.js (public), admin.js, member.js
│   └── server.js           # Entry point
│
└── .github/workflows/      # CI pipeline
```

---

## API Reference

All API routes are same-origin under `/api` in the Next.js deployment. The
legacy Express backend remains in `backend/` for rollback and data-migration
reference; it is not the Vercel production target.

### Public

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| GET | `/api/events` | Paginated events (`?page`, `?limit`, `?search`, `?category`) |
| GET | `/api/team` | All team members |
| GET | `/api/team/years` | Distinct academic years in descending order |
| GET | `/api/team/:id` | Public member profile |
| GET | `/api/team/:id/certificates` | Explicitly public certificate metadata |
| POST | `/api/contact` | Contact form submission |

### Protected *(Bearer token required)*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/admin/login` | Returns an administrator JWT |
| POST/PUT/DELETE | `/api/admin/events/:id` | Events CRUD |
| POST/PUT/DELETE | `/api/admin/team/:id` | Team CRUD |
| GET | `/api/admin/stats` | Dashboard counts and recent activity |
| POST | `/api/admin/upload` | Upload a member image through Cloudinary |
| POST | `/api/admin/members/provision` | Provision a member account for an existing Team profile |
| GET | `/api/admin/members/google` | List administrator-authorized volunteer Google accounts |
| PUT | `/api/admin/members/:teamId/google` | Authorize a Google email for an existing Team profile |
| DELETE | `/api/admin/members/:teamId/google` | Revoke a volunteer Google authorization |

### Member access *(member Bearer token required unless noted)*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| POST | `/api/member/activate` | Activate an administrator-provisioned account once |
| POST | `/api/member/login` | Sign in as an active member |
| POST | `/api/member/google` | Sign in with an administrator-authorized Google account |
| GET | `/api/member/me` | Read the authenticated member's linked public profile |
| PATCH | `/api/member/profile` | Edit only member-editable public profile fields |
| POST | `/api/member/profile/image` | Upload or replace the authenticated member's profile photo through Cloudinary |
| GET/POST | `/api/member/certificates` | List or upload certificates owned by the member |
| PATCH/DELETE | `/api/member/certificates/:id` | Update visibility/metadata or delete an owned certificate |
| GET | `/api/team/:id/certificates` | Anonymous metadata for explicitly public certificates only |

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
