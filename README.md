<div align="center">

<br/>

<img src="frontend/src/assets/logo.png" alt="IEEE GEHU Logo" width="140"/>

<br/><br/>

# IEEE Student Branch — GEHU Dehradun

**Advancing Technology for Humanity**

<br/>

[![CI Status](https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions/workflows/ci.yml/badge.svg)](https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-Storage-3448C5)](https://cloudinary.com)

<br/>

[**🌐 Live Site**](https://ieee-gehu.vercel.app) &nbsp;·&nbsp;
[**📖 Documentation**](#-getting-started) &nbsp;·&nbsp;
[**🐛 Report a Bug**](https://github.com/IEEE-Student-Branch-GEHU/ieee.web/issues/new) &nbsp;·&nbsp;
[**✨ Request a Feature**](https://github.com/IEEE-Student-Branch-GEHU/ieee.web/issues)

<br/>

</div>

---

## 📑 Table of Contents

- [About the Project](#-about-the-project)
- [Key Features](#-key-features)
- [Technology Stack](#%EF%B8%8F-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Running Tests](#-running-tests)
- [API Reference](#-api-reference)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 About the Project

The official web platform of the **IEEE Student Branch at Graphic Era Hill University (GEHU), Dehradun**. This is a purpose-built, production-grade full-stack web application serving as the digital identity of our branch.

Designed with a premium **"Dark SaaS"** aesthetic inspired by platforms like **Linear** and **Vercel**, it features an interactive Events Archive, a secure Admin Dashboard, and cloud-native data infrastructure on MongoDB Atlas and Cloudinary.

---

## ✨ Key Features

<table>
<thead>
<tr><th width="50%">🏛️ Public Portal</th><th width="50%">🛡️ Admin Dashboard</th></tr>
</thead>
<tbody>
<tr>
<td>

- 🎨 **Premium Landing Page** with Framer Motion animations
- 📅 **Events Archive** — server-side paginated, searchable & filterable
- 🧭 **Bespoke Minimal Navbar** for archive pages (floating island style)
- 📱 **Fully Responsive** mobile-first layouts
- ✉️ **Contact Form** with backend integration

</td>
<td>

- 🔐 **JWT-Secured Login** with auto-initialized admin account
- 🖼️ **Cloudinary Image Uploads** for events & team members
- ✏️ **Full CRUD** for Events and Team Members
- 🛡️ **Rate Limiting** against brute force & DoS attacks
- 📊 **Stats Overview** panel with live counts

</td>
</tr>
</tbody>
</table>

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Frontend** | React 19, Vite | UI framework & build tool |
| **Styling** | Tailwind CSS v4, Framer Motion | Design system & animations |
| **Icons** | Lucide React | Consistent icon library |
| **Backend** | Node.js, Express.js | REST API server |
| **ORM** | Mongoose | MongoDB schema & query layer |
| **Auth** | JSON Web Tokens (JWT) | Admin session management |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL database |
| **Storage** | Cloudinary | Persistent media hosting |
| **Testing** | Vitest, @testing-library/react | Frontend unit tests |
| **CI/CD** | GitHub Actions | Automated test pipeline |
| **Deployment** | Vercel, Render | Frontend & backend hosting |

---

## 🏗️ Project Structure

```
ieee.web/
│
├── 📂 .github/
│   └── 📂 workflows/
│       └── ci.yml                  # CI pipeline (runs vitest on push)
│
├── 📂 frontend/
│   ├── 📂 src/
│   │   ├── 📂 assets/              # Logo, illustrations
│   │   ├── 📂 components/
│   │   │   ├── 📂 animations/      # Reveal & scroll-based animations
│   │   │   ├── ArchiveNavbar.jsx   # Floating minimal navbar (archive pages)
│   │   │   ├── Navbar.jsx          # Full landing page navbar
│   │   │   └── Footer.jsx
│   │   ├── 📂 pages/
│   │   │   ├── Home.jsx            # Public landing page
│   │   │   ├── EventsArchive.jsx   # Paginated events archive
│   │   │   └── 📂 admin/           # JWT-protected admin dashboard
│   │   ├── 📂 test/                # Vitest test suites
│   │   ├── config.js               # API base URL config
│   │   └── index.css               # Global design tokens & utilities
│   ├── vite.config.js
│   └── package.json
│
└── 📂 backend/
    ├── 📂 config/
    │   ├── cloudinary.js           # Cloudinary SDK configuration
    │   └── db.js                   # MongoDB Atlas connection
    ├── 📂 models/
    │   ├── Admin.js                # Admin schema (hashed passwords)
    │   ├── Event.js                # Event schema
    │   └── Team.js                 # Team member schema
    ├── 📂 routes/
    │   ├── api.js                  # Public routes (events, team, contact)
    │   └── auth.js                 # Protected admin routes (CRUD + auth)
    ├── server.js                   # Entry point: rate limiter, auto-init
    └── package.json
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

- **Node.js** `>= 18.x` — [Download](https://nodejs.org)
- **npm** `>= 9.x`
- A **MongoDB Atlas** account — [Create free cluster](https://www.mongodb.com/cloud/atlas)
- A **Cloudinary** account — [Sign up free](https://cloudinary.com)

---

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/IEEE-Student-Branch-GEHU/ieee.web.git
cd ieee.web
```

**2. Install backend dependencies**
```bash
cd backend
npm install
```

**3. Install frontend dependencies**
```bash
cd ../frontend
npm install
```

---

### Environment Variables

Create a `.env` file in the `backend/` directory with the following keys:

```env
# ─── Database ───────────────────────────────────────────────────────────────
MONGODB_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/ieee-gehu

# ─── Cloudinary (Image Uploads) ─────────────────────────────────────────────
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# ─── Authentication ──────────────────────────────────────────────────────────
JWT_SECRET=your_strong_secret_key_here
```

> ⚠️ **Never commit your `.env` file.** It is already listed in `.gitignore`.

**Start the backend (Port 5000)**
```bash
cd backend
npm start
```

**Start the frontend (Port 5173)**
```bash
cd frontend
npm run dev
```

Visit **[http://localhost:5173](http://localhost:5173)** to see the app.

---

## 🧪 Running Tests

The test suite uses **Vitest** and **React Testing Library**.

```bash
cd frontend
npm test
```

Tests cover the `EventsArchive` component in full — including server-side pagination, search, category filtering, error states, and UI rendering. The CI pipeline runs these automatically on every push to `main`.

---

## 📡 API Reference

### Public Endpoints

| Method | Endpoint | Query Params | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/events` | `page`, `limit`, `search`, `category` | Paginated & filtered event list |
| `GET` | `/api/team` | — | All team members sorted by `order` |
| `POST` | `/api/contact` | — | Submit a contact form message |

### Protected Endpoints *(Requires `Authorization: Bearer <token>`)*

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/auth/login` | Admin login — returns a JWT |
| `POST` | `/api/auth/events` | Create a new event |
| `PUT` | `/api/auth/events/:id` | Update an existing event |
| `DELETE` | `/api/auth/events/:id` | Delete an event |
| `POST` | `/api/auth/team` | Add a new team member |
| `PUT` | `/api/auth/team/:id` | Update a team member |
| `DELETE` | `/api/auth/team/:id` | Remove a team member |

---

## ☁️ Deployment

| Service | Platform | Configuration |
| :--- | :--- | :--- |
| **Frontend** | [Vercel](https://vercel.com) | Set `VITE_API_URL` to your Render backend URL |
| **Backend** | [Render](https://render.com) | Add all `.env` variables in the Render dashboard |

---

## 🤝 Contributing

We welcome contributions from all branch members and the open-source community.

1. **Fork** the repository
2. **Create** a new branch: `git checkout -b feat/your-feature-name`
3. **Write** your changes and add/update tests if applicable
4. **Commit** with a conventional message: `git commit -m 'feat: add amazing feature'`
5. **Push** your branch: `git push origin feat/your-feature-name`
6. **Open** a Pull Request against `main`

> ✅ All PRs must pass the **CI Pipeline** before merging. Branch protection is enforced on `main`.

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for full details.

---

<div align="center">
<br/>
<p>Made with ⚡ by the <strong>IEEE Student Branch GEHU · Dev Team</strong></p>
<p><em>Advancing Technology for Humanity</em></p>
<br/>
</div>
