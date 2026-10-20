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

The site and its API are one Next.js app in `frontend/`. The Express API lives
in `frontend/server/` and is served at `/api` by `src/pages/api/[...path].next.js`.

```bash
cd frontend && npm ci
```

---

## Environment Variables

Copy `frontend/.env.example` to `frontend/.env.local` and fill it in:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ieee-gehu

# Public origin for QR codes; also the allowed browser origin for the API
NEXT_PUBLIC_SITE_URL=https://your-verified-domain.example

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
`MONGODB_URI`, `JWT_SECRET`, and `NEXT_PUBLIC_SITE_URL` (or `FRONTEND_URL`).
The old `MONGO_URI` name is not consumed.
Production JWT secrets must be random and at least 32 characters. The server
does not create a default administrator or use a fallback signing key. Create
an administrator through the one-off script below; provide the credentials
through the shell environment or a temporary secret manager entry, never in
source control:

```bash
cd frontend
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
# Site and API together (http://localhost:3000, API at /api)
cd frontend && npm run dev
```

`npm run start:api` still runs the API on its own (port 5000) if needed.

---

## Running Tests

```bash
cd frontend

# API tests (Jest, server/tests)
npm run test:server

# Frontend tests. The constrained worker flags are intentional for this
# repository's CI/container environments.
npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism
```

The frontend test command may be run with an individual file path appended
when working on a focused flow.

---

## Deployment

The whole site, including the API, deploys as one Vercel project:

- Root Directory: `frontend`, Framework Preset: Next.js, Node.js 20.x or 22.x.
- Environment variables (Production and Preview): `NEXT_PUBLIC_SITE_URL`,
  `MONGODB_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`,
  `CLOUDINARY_API_SECRET`, and `TRUST_PROXY_HOPS=1`. Leave
  `NEXT_PUBLIC_API_URL` unset so the site calls its own `/api`.
- MongoDB Atlas Network Access must allow Vercel's dynamic IPs
  (`0.0.0.0/0` together with a strong database password).

Page files use the `.next.jsx` extension configured in `next.config.mjs`; the
API route uses `.next.js`. The legacy Vite adapter remains available only for
compatibility tests and optional local previews (`dev:vite`, `build:vite`,
`preview:vite`).

Set `NEXT_PUBLIC_SITE_URL` only after the organizer confirms the canonical
HTTPS domain. Hosted builds reject a missing, non-HTTPS, local, placeholder, or
path-bearing public origin so that printable QR codes cannot be generated with
an unsafe destination. Each printable member QR encodes only the configured
origin plus `/members/<team-object-id>`. The Team MongoDB `_id` is never
replaced by an editable name, role, photo, or academic field, so profile edits
do not change an already printed destination. Deleted or invalid IDs resolve to
the public not-found/error states instead of exposing protected data.

The API accepts browser requests from its own origin (so preview deployments
work), from `NEXT_PUBLIC_SITE_URL`/`FRONTEND_URL`, and from localhost in
development. `/health` (rewritten to `/api/health`) returns `503` when MongoDB
is unavailable and `200` with `{ "status": "ready", "database": "connected" }`
when it is ready.

Serverless limits to keep in mind:

- Vercel rejects request bodies over 4.5 MB, so image and certificate uploads
  above that fail even though the API allows 10 MB.
- The rate limiter is in memory, so each warm function instance counts
  separately. Use a shared store (for example Upstash Redis) for strict limits.
- Uploaded images use Cloudinary; nothing relies on the local filesystem.

After deployment, manually verify `/health`, `/api/events`, the Events page,
and the admin login. For the member workflow, create an approved Team profile
in the admin panel, upload a test photo, provision and activate the account,
open and refresh `/members/<team-object-id>`, generate and download the SVG QR,
and scan it from a physical phone over HTTPS. Also test camera denial and
unsupported-browser fallback. No live deployment, Cloudinary upload, MongoDB
production write, or physical-device operation is performed by the repository
tests.
