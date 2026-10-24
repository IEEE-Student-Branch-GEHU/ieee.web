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
cd frontend && npm ci
cd ../backend && npm ci
```

---

## Environment Variables

For the production-target Next.js application and its mounted Express API,
create `frontend/.env.local`:

```env
# Same-origin API and canonical public origin
NEXT_PUBLIC_API_URL=/api
NEXT_PUBLIC_SITE_URL=https://your-verified-domain.example

# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ieee-gehu

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=replace_with_a_random_secret_at_least_32_characters_long

# Optional administrator-authorized volunteer Google sign-in
# NEXT_PUBLIC_GOOGLE_CLIENT_ID=1234567890-abc.apps.googleusercontent.com

# Optional reverse-proxy setting; use 0 locally
TRUST_PROXY_HOPS=0
```

The active member API runs in `frontend/server/` and is mounted by Next.js under
`/api`; variables in the legacy `backend/.env` file are not automatically loaded
by `cd frontend && npm run dev`. For the preserved Express rollback/reference
server, create a separate `backend/.env` with `FRONTEND_URL`,
`TRUST_PROXY_HOPS`, and the same database, Cloudinary, and JWT values. Never
commit either environment file.

> **Never commit `.env` files.** The files are already in `.gitignore`.

For the Next.js/Vercel deployment, configure `MONGODB_URI`, `JWT_SECRET`, all
three Cloudinary values, and the exact HTTPS `NEXT_PUBLIC_SITE_URL` in the
Vercel project. Leave `NEXT_PUBLIC_API_URL` as `/api` for the single-app
deployment. Production JWT secrets must be random and at least 32 characters.
The server does not create a default administrator or use a fallback signing key. Create
an administrator through the one-off script below; provide the credentials
through the shell environment or a temporary secret manager entry, never in
`render.yaml` or source control:

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

After signing in, the member dashboard loads the linked profile from
`GET /api/member/me`. Text fields are saved with `PATCH /api/member/profile`,
and the profile photo is uploaded with `POST /api/member/profile/image` as a
multipart `image` field. Both routes derive the Team record from the verified
member token; browser-supplied member or Team IDs are not used for ownership.

Member access tokens use the configured `JWT_SECRET` with a separate token
purpose, issuer, audience, subject, expiry, and token-version check. Signing
out increments the account token version so the current token is rejected on
subsequent protected requests.

### Volunteer Google sign-in

Google sign-in is optional and disabled when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is
unset. An administrator must authorize an email for an existing Team profile
from the admin Team page. The API exposes `PUT /api/admin/members/:teamId/google`
and `DELETE /api/admin/members/:teamId/google`; volunteers then use the Google
button at `/member/login` or in the footer. The server verifies the Google ID
token, binds Google's stable subject on first sign-in, and rejects disabled,
reassigned, or unauthorized accounts. Removing or changing an authorization
increments the member token version and signs the account out everywhere.

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
# Terminal 1 — Next.js pages and mounted API (http://localhost:3000)
cd frontend && npm run dev
```

The Next.js development server serves the pages and the mounted `/api` routes.
To run the migrated Express API without Next.js, use `cd frontend && npm run
start:api`. The preserved rollback server remains available with `cd backend &&
npm start`.

---

## Running Tests

```bash
# Mounted API tests
cd frontend
npm run test:server

# Frontend tests. The constrained worker flags are intentional for this
# repository's CI/container environments.
npm test -- --pool=threads --maxWorkers=1 --no-file-parallelism

# Preserved rollback backend tests
cd ../backend
npm test
```

The frontend test command may be run with an individual file path appended
when working on a focused flow.

---

## Deployment

| Service | Platform | Config |
| :--- | :--- | :--- |
| Application | [Vercel](https://vercel.com) | Use the `frontend/` root, `npm run build:next`, and same-origin `/api` route handlers |
| Database | MongoDB Atlas | Set server-only `MONGODB_URI` in Vercel project environment variables |
| Storage | Cloudinary | Set server-only Cloudinary credentials in Vercel project environment variables |

The production application is the Next.js App Router application. Its page files
use the `.next.jsx` extension configured in `next.config.mjs`, and Vercel is
configured with `framework: "nextjs"` and `npm run build:next`. The Express API
under `frontend/server/` is mounted by `frontend/src/pages/api/[...path].next.js`
and uses the same origin. The legacy `backend/` implementation remains a
rollback/reference deployment for Render and is not the Vercel production API.

Leave `NEXT_PUBLIC_API_URL` unset or set it to `/api` for same-origin routing;
frontend normalizes it exactly once. Set `NEXT_PUBLIC_SITE_URL` only after the
organizer confirms the canonical HTTPS domain. Hosted Next.js builds reject a
missing, non-HTTPS, local, placeholder, or path-bearing public origin so that
printable QR codes cannot be generated with an unsafe destination. The legacy
Vite adapter accepts the equivalent `VITE_*` variables only when it is run
explicitly. Server-only variables are `MONGODB_URI`, `JWT_SECRET`, and the
three Cloudinary credentials; never prefix those variables with `NEXT_PUBLIC_`.
Each printable member QR encodes only the configured origin plus
`/members/<team-object-id>`. The Team MongoDB `_id` is never replaced by an
editable name, role, photo, or academic field, so profile edits do not change
an already printed destination. Deleted or invalid IDs resolve to the public
not-found/error states instead of exposing protected data.

The Next.js-mounted `/api/health` route returns `503` when MongoDB is unavailable and
`200` with `{ "status": "ready", "database": "connected" }` when MongoDB is
ready. Uploaded images and certificates use Cloudinary, so they do not rely on
local filesystem persistence. Rate-limit counters use the MongoDB-backed
`apiRateLimits` collection so they remain shared across Vercel function
instances.

Before deployment, allow the Vercel project to reach MongoDB Atlas through its
Network Access rules. After deployment, manually verify the Vercel
`/api/health` and `/api/events` responses, the Events page, and the admin
login using real environment values. For the member workflow, create an
approved Team profile in the admin panel, upload a test photo, provision and
activate the account, open and refresh `/members/<team-object-id>`, generate
and download the SVG QR, and scan it from a physical phone over HTTPS. Also
test camera denial and unsupported-browser fallback. No live deployment,
Cloudinary upload, MongoDB production write, or physical-device operation is
performed by the repository tests.
