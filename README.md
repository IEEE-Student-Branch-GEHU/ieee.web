# 🌐 IEEE Student Branch - Graphic Era Hill University

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)
![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)

**"Advancing Technology for Humanity"**

Welcome to the official repository used by the **IEEE Student Branch at Graphic Era Hill University (GEHU), Dehradun Campus**. Digital platform designed to showcase our events, team, and vision, bridging the gap between academia and industry.

---

## 🚀 Live Demo

**[View Deployment](https://YZO-BIT.github.io/IEEE-website/)**
*(Note: As GitHub Pages hosts static sites, backend-dependent features like live Event data may be mock-only on this deployment.)*

---

## ✨ Key Features

-   **🎨 Modern UI/UX**: Built with React and Framer Motion for a sleek, animated, and responsive experience.
-   **📅 Event Management**: Dynamic carousel showcasing upcoming web, technical, and social events.
-   **👥 Team & Faculty**: interactive cards highlighting our Executive Committee and Branch Counselors.
-   **📱 Fully Responsive**: Optimized for Mobile, Tablet, and Desktop using Tailwind CSS v4.
-   **🔌 API Integration**: Backend services for fetching real-time data on events and team members.
-   **📬 Contact System**: Integrated form for inquiries and student outreach.

---

## 🛠️ Technology Stack

### Frontend
-   **Core**: React 19, Vite
-   **Styling**: Tailwind CSS v4, clsx, tailwind-merge
-   **Animation**: Framer Motion
-   **Routing**: React Router DOM v7
-   **Components**: Radix UI Primitives, Lucide Icons, React Icons

### Backend (API)
-   **Runtime**: Node.js (v18+)
-   **Framework**: Express.js
-   **Data**: JSON-based storage (Migration to MongoDB planned)
-   **Security**: CORS enabled, Environment variable support

---

## 🏗️ Project Structure

```bash
IEEE-website/
├── 📂 frontend/           # Client-side Application
│   ├── src/components/    # Reusable UI (Hero, Header, Footer)
│   ├── src/assets/        # Static images and icons
│   ├── vite.config.js     # Proxy & Build configuration
│   └── index.css          # Global Tailwind directives
│
├── 📂 backend/            # Server-side Application
│   ├── data/              # Data source for Events/Team
│   ├── routes/            # API Route definitions
│   └── server.js          # Express server entry point
│
└── 📂 .github/            # CI/CD Workflows
```

---

## 🚀 Getting Started Locally

Follow these instructions to set up the project on your local machine.

### Prerequisites
-   **Node.js**: v18 or higher ([Download](https://nodejs.org/))
-   **Git**: ([Download](https://git-scm.com/))

### 1. Clone the Repository
```bash
git clone https://github.com/YZO-BIT/IEEE-website.git
cd IEEE-website
```

### 2. Setup Backend System
The backend serves the API data on port `5000`.

```bash
cd backend
npm install
node server.js
```
> **Output**: `Server running on port 5000`

### 3. Setup Frontend Application
Open a **new terminal window** to run the React app.

```bash
cd frontend
npm install
npm run dev
```
> **Output**: `Local: http://localhost:5173`

### 4. Application Access
Open your browser and navigate to: [http://localhost:5173](http://localhost:5173)

---

## 🤝 Contribution Guidelines

We welcome innovations! To contribute:

1.  **Fork** the project.
2.  Create your **Feature Branch** (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

---

## 📞 Contact & Support

**IEEE Student Branch — GEHU**
-   📍 **Location**: Graphic Era Hill University, Dehradun, UK, India
-   📧 **Email**: ieee@gehu.ac.in
-   🔗 **Socials**: [LinkedIn](#) | [Instagram](#)

---

<p align="center">Made with ❤️ by the IEEE Student Branch GEHU Web Team</p>
