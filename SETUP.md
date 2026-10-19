# Setup Guide

Step-by-step instructions to run the IEEE GEHU website locally.

---

## Prerequisites

- [Node.js](https://nodejs.org) `20.19.0` (see `.nvmrc`; supported range is `>=20.19.0 <25`)
- A [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) cluster
- A [Cloudinary](https://cloudinary.com) account

---

## Installation

**1. Clone the repository**

```bash
git clone https://github.com/IEEE-Student-Branch-GEHU/ieee.web.git
cd ieee.web
```

**2. Install dependencies**

```bash
cd backend && npm ci
cd ../frontend && npm ci
```

---

## Environment Variables

Create a `.env` file inside `backend/`:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ieee-gehu

# Exact browser origin allowed by the backend
FRONTEND_URL=http://localhost:5173

# Number of trusted reverse-proxy hops. Use 0 locally.
TRUST_PROXY_HOPS=0

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters_long
```

> **Never commit `.env` files.** The file is already in `.gitignore`.

In production, `NODE_ENV=production` also requires all three Cloudinary values,
`MONGODB_URI`, `JWT_SECRET`, and `FRONTEND_URL`. The old `MONGO_URI` name is
not consumed; update existing Render services to `MONGODB_URI` before deploying.
Production JWT secrets must be random and at least 32 characters. The server
does not create a default administrator or use a fallback signing key. Create
an administrator through the one-off script below; provide the credentials
through the shell environment or a temporary secret manager entry, never in
`render.yaml` or source control:

```bash
cd backend
read -r -p "Admin username: " ADMIN_USERNAME
read -r -s -p "Admin password: " ADMIN_PASSWORD; printf '\n'
export ADMIN_USERNAME ADMIN_PASSWORD
npm run create-admin
unset ADMIN_USERNAME ADMIN_PASSWORD
```

The command refuses duplicate usernames, hashes the password with bcrypt, and
does not print the password or MongoDB URI. Run it only against the intended
MongoDB database and remove the temporary environment values afterward.

### Member account provisioning

Member accounts are not publicly registered. An authenticated administrator
provisions an account for an existing Team record through
`POST /api/admin/members/provision` with a normalized username and Team ObjectId.
The response contains a one-time activation secret; deliver it to the intended
member through the branch's approved channel and do not log or reuse it. The
member sets a password at `/member/activate` and can then sign in at
`/member/login`. Existing Team records remain public and read-only until an
administrator explicitly links one through this flow.

Member access tokens use the configured `JWT_SECRET` with a separate token
purpose, issuer, audience, subject, expiry, and token-version check. Signing
out increments the account token version so the current token is rejected on
subsequent protected requests.

To safely verify the dedicated test account without printing its password or
stored hash:

```bash
npm run inspect-admin
```

This prints only a generic success message when the configured account and
password verify; failures exit nonzero without printing account, hash, or
password details. Do not run it with a production `.env` file.

For the dedicated `ieee_test_admin` account only, synchronize its existing
password hash with the current `ADMIN_PASSWORD` without creating a duplicate:

```bash
npm run reset-admin-password
npm run inspect-admin
```

The reset command refuses any username other than `ieee_test_admin`, requires
the connected MongoDB database name to be exactly `test`, requires a password
of at least 12 characters, and preserves all other administrator fields. It
does not operate against production databases.

---

## Running Locally

```bash
# Terminal 1 — Backend (http://localhost:5000)
cd backend && npm start

# Terminal 2 — Frontend (http://localhost:5173)
cd frontend && npm run dev
```

---

## Running Tests

```bash
# Backend tests
cd backend
npm test

# Frontend tests. The constrained worker flags are intentional for this
# repository's CI/container environments.
cd ../frontend
npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism
```

The frontend test command may be run with an individual file path appended
when working on a focused flow.

---

## Deployment

| Service | Platform | Config |
| :--- | :--- | :--- |
| Frontend | [Vercel](https://vercel.com) | Set `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_SITE_URL`; use the `frontend/` root and the Next.js build (`npm run build` / `npm run build:next`) |
| Backend | [Render](https://render.com) | Use `render.yaml`, set the `sync: false` secrets, and keep `TRUST_PROXY_HOPS=1` only when Render is the single trusted proxy hop |

The production frontend is the Next.js App Router application. Its page files
use the `.next.jsx` extension configured in `next.config.mjs`, and Vercel is
configured with `framework: "nextjs"` and `npm run build:next`. The legacy Vite
adapter remains available only for compatibility tests and optional local
previews; its commands are `dev:vite`, `build:vite`, and `preview:vite`.

Set `NEXT_PUBLIC_API_URL` to the Render origin or origin plus `/api`; the
frontend normalizes it exactly once. Set `NEXT_PUBLIC_SITE_URL` only after the
organizer confirms the canonical HTTPS domain. Hosted Next.js builds reject a
missing, non-HTTPS, local, placeholder, or path-bearing public origin so that
printable QR codes cannot be generated with an unsafe destination. The legacy
Vite adapter accepts the equivalent `VITE_*` variables only when it is run
explicitly.
Each printable member QR encodes only the configured origin plus
`/members/<team-object-id>`. The Team MongoDB `_id` is never replaced by an
editable name, role, photo, or academic field, so profile edits do not change
an already printed destination. Deleted or invalid IDs resolve to the public
not-found/error states instead of exposing protected data.

Render checks `/health`, which returns `503` when the running process is
connected to an unavailable database and `200` with
`{ "status": "ready", "database": "connected" }` when MongoDB is ready. `/`
only proves that the Node process is serving HTTP. Uploaded images use
Cloudinary, so they do not rely on Render's ephemeral local filesystem. The
rate limiter remains process-local and must use a shared store before scaling
the backend beyond one instance.

Before deployment, allow the Render service to reach MongoDB Atlas through its
Network Access rules and verify the actual Render ingress topology before
changing `TRUST_PROXY_HOPS`. After deployment, manually verify the Render
`/health` and `/api/events` responses, the Vercel Events page, and the admin
login using real environment values. For the member workflow, create an
approved Team profile in the admin panel, upload a test photo, provision and
activate the account, open and refresh `/members/<team-object-id>`, generate
and download the SVG QR, and scan it from a physical phone over HTTPS. Also
test camera denial and unsupported-browser fallback. No live deployment,
Cloudinary upload, MongoDB production write, or physical-device operation is
performed by the repository tests.
