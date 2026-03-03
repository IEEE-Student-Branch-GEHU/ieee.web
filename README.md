# 🌐 IEEE Student Branch - Graphic Era Hill University (Dehradun)

<p align="center">
  <img src="frontend/src/assets/logo.png" alt="IEEE GEHU Logo" width="180">
</p>

<p align="center">
  <strong>"Advancing Technology for Humanity"</strong>
</p>

<p align="center">
  <a href="https://img.shields.io/badge/status-active-success.svg"><img src="https://img.shields.io/badge/status-active-success.svg" alt="Project Status"></a>
  <a href="https://github.com/YZO-BIT/IEEE-website/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/react-19-blue.svg?logo=react" alt="React"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/tailwind-v4-38B2AC.svg?logo=tailwind-css" alt="Tailwind"></a>
</p>

---

## 🚀 Overview

Welcome to the official repository of the **IEEE Student Branch at Graphic Era Hill University (GEHU), Dehradun**. This premium platform is built to showcase our technical excellence, leadership, and vibrant student community.

It features a high-performance **React** frontend combined with a robust **Node.js** administration backend, enabling seamless management of branch activities.

---

## ✨ Key Features

### 🏛️ Landing Page (Public)
- **🎨 Premium UI/UX**: Crafted with Framer Motion for smooth, staggering reveal animations.
- **👨‍🏫 Faculty Leadership**: Dedicated sections for the Student Branch Counselor and Faculty Coordinators.
- **👥 Student Executive Committee**: Dynamic cards showcasing the student leadership team.
- **📅 Events Hub**: Interactive carousel for past and upcoming branch events.
- **📬 Fluid Communication**: Integrated contact system with form validation.

### 🛡️ Management Portal (Admin)
- **🔐 Secure Access**: JWT-protected administrative dashboard.
- **🛠️ Team Management**: Dedicated interfaces for managing Student Team and Faculty Coordinators independently.
- **📊 Activity Tracking**: Statistics overview for events and team growth.
- **📁 Integrated Uploads**: Direct image upload system for member profiles and event posters.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js, Express.js |
| **State/Routing** | React Router 7, React Hooks |
| **Icons & UI** | Lucide React, React Icons, Radix UI |
| **Deployment** | GitHub Pages (Frontend), Vercel/Render (Backend Ready) |

---

## 🏗️ Project Structure

```bash
IEEE-website/
├── 📂 frontend/           # React Application
│   ├── 📂 src/
│   │   ├── 📂 components/ # Reusable UI components
│   │   ├── 📂 pages/      # Landing and Admin pages
│   │   └── 📂 assets/     # Branding and media
│   └── vite.config.js     # Dev server & Proxy config
│
├── 📂 backend/            # Express Server
│   ├── 📂 routes/         # API endpoints (Admin & Public)
│   ├── 📂 data/           # JSON Persistence (Events, Team)
│   └── server.js          # Entry point
│
└── 📂 .github/            # GitHub Actions (CI/CD)
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/YZO-BIT/IEEE-website.git
cd IEEE-website
```

### 2. Launch Backend (Port 5000)
```bash
cd backend
npm install
node server.js
```

### 3. Launch Frontend (Port 5173)
```bash
# In accurate terminal
cd frontend
npm install
npm run dev
```

Visit: **[http://127.0.0.1:5173/IEEE-website/](http://127.0.0.1:5173/IEEE-website/)**

---

## 🤝 Contributing

We value technological innovation. Feel free to fork, hack, and submit PRs!

1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/NewTech`).
3. Commit changes (`git commit -m 'Add NewTech'`).
4. Push to the branch (`git push origin feature/NewTech`).
5. Open a Pull Request.

---

<p align="center">
  Generated with ⚡ by the <strong>IEEE Student Branch GEHU Team</strong><br>
  <em>Advancing Technology for Humanity</em>
</p>
