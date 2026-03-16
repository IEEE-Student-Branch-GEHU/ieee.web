# 🌐 IEEE Student Branch - Graphic Era Hill University (Dehradun)

<p align="center">
  <img src="frontend/src/assets/logo.png" alt="IEEE GEHU Logo" width="180">
</p>

<p align="center">
  <strong>"Advancing Technology for Humanity"</strong>
</p>

<p align="center">
  <a href="https://img.shields.io/badge/status-active-success.svg"><img src="https://img.shields.io/badge/status-active-success.svg" alt="Project Status"></a>
  <a href="https://github.com/IEEE-Student-Branch-GEHU/ieee.web/blob/main/LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License"></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/react-19-blue.svg?logo=react" alt="React"></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/tailwind-v4-38B2AC.svg?logo=tailwind-css" alt="Tailwind"></a>
  <a href="https://www.mongodb.com/"><img src="https://img.shields.io/badge/database-MongoDB-green.svg?logo=mongodb" alt="MongoDB"></a>
</p>

---

## 🚀 Overview

Welcome to the official repository of the **IEEE Student Branch at Graphic Era Hill University (GEHU), Dehradun**. This premium platform is built to showcase our technical excellence, leadership, and vibrant student community.

This version features a **Production-Ready Cloud Architecture**, utilizing MongoDB Atlas and Cloudinary to ensure data persistence and scalability across modern cloud platforms like Vercel and Render.

---

## ✨ Key Features

### 🏛️ Landing Page (Public)
- **🎨 Premium UI/UX**: Crafted with Framer Motion for smooth, staggering reveal animations and staggered entries.
- **👨‍🏫 Global Branding**: Clean, sanitized codebase dedicated exclusively to IEEE GEHU Dehradun.
- **📅 Events Hub**: Interactive showcase for past and upcoming branch events.
- **📬 Fluid Communication**: Professional contact system with modern form validation.

### 🛡️ Management Portal (Admin)
- **🔐 Secure Access**: JWT-protected administrative dashboard with auto-initialization for the default admin.
- **☁️ Cloud Persistence**: Transitioned from local JSON storage to **MongoDB Atlas** for reliable data management.
- **🖼️ Persistent Assets**: Integrated **Cloudinary** for permanent image hosting, replacing ephemeral local storage.
- **📊 Activity Tracking**: Live statistics overview for events and member growth.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite, Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB Atlas (Cloud) |
| **Storage** | Cloudinary (Cloud CMS) |
| **Icons & UI** | Lucide React, React Icons, Radix UI |
| **Deployment** | Vercel (Frontend), Render (Backend Ready) |

---

## 🏗️ Project Structure

```bash
IEEE-website/
├── 📂 frontend/           # React Application
│   ├── 📂 src/
│   │   ├── 📂 components/ # Reusable UI & Animations
│   │   ├── 📂 pages/      # Landing & Admin Entry
│   │   └── 📂 assets/     # Branding Identity
│   └── vite.config.js     # Dev server & Proxy config
│
├── 📂 backend/            # Express Cloud Server
│   ├── 📂 config/         # Cloudinary & DB Config
│   ├── 📂 models/         # Mongoose Schemas (Admin, Event, Team)
│   ├── 📂 routes/         # API endpoints (Auth & CRUD)
│   └── server.js          # Entry point with Auto-Init
│
└── 📂 .github/            # GitHub Actions (CI/CD)
```

---

## 🚀 Getting Started

### 1. Clone & Install
```bash
git clone https://github.com/IEEE-Student-Branch-GEHU/ieee.web.git
cd IEEE-website
```

### 2. Configure Environment Variables
Create a `.env` file in the `backend/` directory based on the `backend/.env.example` file. You will need:
- `MONGODB_URI`: Your MongoDB Atlas connection string.
- `CLOUDINARY_CLOUD_NAME`, `API_KEY`, `API_SECRET`: From your Cloudinary dashboard.
- `JWT_SECRET`: A secure key for admin sessions.

### 3. Launch Backend (Port 5000)
```bash
cd backend
npm install
node server.js
```

### 4. Launch Frontend (Port 5173)
```bash
cd frontend
npm install
npm run dev
```

Visit: **[http://localhost:5173/IEEE-website/](http://localhost:5173/IEEE-website/)**

---

## 🤝 Contributing

We value technological innovation. Feel free to fork, hack, and submit PRs to the official organization repository!

1. Fork the repo.
2. Create your feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

<p align="center">
  Generated with ⚡ by the <strong>IEEE Student Branch GEHU Team</strong><br>
  <em>Advancing Technology for Humanity</em>
</p>
