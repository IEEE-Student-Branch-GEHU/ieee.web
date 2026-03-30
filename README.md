<div align="center">

<img src="frontend/src/assets/logo.png" alt="IEEE GEHU Logo" width="160"/>

<h1>IEEE Student Branch — GEHU Dehradun</h1>

<p><em>"Advancing Technology for Humanity"</em></p>

<p>
  <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions"><img src="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/actions/workflows/ci.yml/badge.svg" alt="CI Status"></a>
  <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <img src="https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=black" alt="React 19">
  <img src="https://img.shields.io/badge/tailwind-v4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind v4">
  <img src="https://img.shields.io/badge/node.js-express-339933?logo=node.js&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/database-MongoDB_Atlas-47A248?logo=mongodb&logoColor=white" alt="MongoDB">
  <img src="https://img.shields.io/badge/storage-Cloudinary-3448C5?logo=cloudinary&logoColor=white" alt="Cloudinary">
</p>

<p>
  <a href="https://ieee-gehu.vercel.app">🌐 Live Site</a> · 
  <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/issues">🐛 Report Bug</a> · 
  <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/issues/new">✨ Request Feature</a>
</p>

</div>

---

## 🌟 About

The official web platform of the **IEEE Student Branch at Graphic Era Hill University (GEHU), Dehradun**. This is not a template — it's a purpose-built, production-grade full-stack web application that serves as the digital identity of our branch.

Built with a "Dark SaaS" design language inspired by platforms like **Linear** and **Vercel**, the site is designed to impress — featuring glassmorphism, smooth Framer Motion animations, and a fully integrated admin dashboard for managing live content.

---

## ✨ Features

### 🏛️ Public Portal
| Feature | Description |
|---|---|
| **Premium Landing Page** | Animated hero, faculty showcase, event highlights, and contact form |
| **Events Archive** | Server-side paginated, filterable, and searchable event history |
| **Minimal Archive Navbar** | Bespoke floating island navbar for non-landing pages |
| **Responsive Design** | Mobile-first layouts across all screen sizes |
| **Micro-animations** | Staggered `framer-motion` reveals and hover interactions |

### 🛡️ Admin Dashboard
| Feature | Description |
|---|---|
| **JWT Authentication** | Secure login with auto-initialized default admin |
| **Events CRUD** | Create, edit, and delete events with Cloudinary image uploads |
| **Team CRUD** | Manage team members, roles, and profile images |
| **Rate Limiting** | `express-rate-limit` protection against brute force & DoS |
| **Live Content** | All changes reflect immediately on the public portal |

---

## 🛠️ Technology Stack

```
📦 IEEE-website
├── 🎨 Frontend          React 19 · Vite · Tailwind CSS v4 · Framer Motion
├── ⚙️  Backend           Node.js · Express.js · Mongoose · JWT
├── 🗄️  Database          MongoDB Atlas (Cloud)
├── 🖼️  Asset Storage     Cloudinary
├── 🧪 Testing           Vitest · @testing-library/react
├── 🚀 Deployment        Vercel (Frontend) · Render (Backend)
└── 🔄 CI/CD             GitHub Actions
```

---

## 🏗️ Project Structure

```bash
IEEE-website/
│
├── 📂 frontend/                   # React Application
│   ├── 📂 src/
│   │   ├── 📂 components/
│   │   │   ├── 📂 animations/     # Reveal, scroll-based animations
│   │   │   ├── Navbar.jsx         # Landing page navbar
│   │   │   ├── ArchiveNavbar.jsx  # Minimal archive floating navbar
│   │   │   └── Footer.jsx
│   │   ├── 📂 pages/
│   │   │   ├── Home.jsx           # Main landing page
│   │   │   ├── EventsArchive.jsx  # Paginated events archive
│   │   │   └── 📂 admin/          # Protected admin dashboard
│   │   ├── 📂 test/               # Vitest unit tests
│   │   └── 📂 assets/             # Logos & illustrations
│   └── vite.config.js
│
├── 📂 backend/                    # Express Cloud API
│   ├── 📂 config/                 # Cloudinary & DB connections
│   ├── 📂 models/
│   │   ├── Admin.js               # Admin schema
│   │   ├── Event.js               # Event schema
│   │   └── Team.js                # Team member schema
│   ├── 📂 routes/
│   │   ├── api.js                 # Public endpoints (events, team)
│   │   └── auth.js                # Admin auth endpoints
│   └── server.js                  # Entry point with rate limiter & auto-init
│
└── 📂 .github/
    └── 📂 workflows/
        └── ci.yml                 # CI/CD pipeline (test-frontend)
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** `>= 18.x`
- **MongoDB Atlas** account
- **Cloudinary** account

### 1. Clone the Repository
```bash
git clone https://github.com/IEEE-Student-Branch-GEHU/ieee.web.git
cd ieee.web
```

### 2. Configure Backend Environment
Create a `.env` file inside `backend/`:

```env
# Database
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ieee-gehu

# Cloudinary (for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Auth
JWT_SECRET=your_super_secret_key
```

### 3. Start the Backend (Port 5000)
```bash
cd backend
npm install
npm start
```

### 4. Start the Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Visit: **[http://localhost:5173](http://localhost:5173)**

---

## 🧪 Running Tests

```bash
cd frontend
npm test
```

Tests are powered by **Vitest** and **@testing-library/react**. The CI pipeline runs these automatically on every push.

---

## 🌐 API Reference

### Public Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/events` | Get paginated events. Supports `?page`, `?limit`, `?search`, `?category` |
| `GET` | `/api/team` | Get all team members sorted by `order` |
| `POST` | `/api/contact` | Submit a contact form message |

### Protected Endpoints (Requires JWT)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Admin login → returns JWT |
| `POST` | `/api/auth/events` | Create new event |
| `PUT` | `/api/auth/events/:id` | Update event |
| `DELETE` | `/api/auth/events/:id` | Delete event |
| `POST` | `/api/auth/team` | Create new team member |
| `PUT` | `/api/auth/team/:id` | Update team member |
| `DELETE` | `/api/auth/team/:id` | Delete team member |

---

## 🤝 Contributing

We welcome contributions from all IEEE GEHU members! Please follow these steps:

1. **Fork** the repository.
2. **Create** your feature branch: `git checkout -b feat/your-feature-name`
3. **Commit** your changes: `git commit -m 'feat: add amazing feature'`
4. **Push** to the branch: `git push origin feat/your-feature-name`
5. **Open** a Pull Request against `main`.

> ⚠️ All PRs must pass the **CI Pipeline** (vitest) before merging. Branch protection is enforced.

---

## 📜 License

Distributed under the **MIT License**. See [`LICENSE`](LICENSE) for more information.

---

<div align="center">
  <p>Built with ⚡ by the <strong>IEEE Student Branch GEHU Development Team</strong></p>
  <p><em>Advancing Technology for Humanity</em></p>
</div>
