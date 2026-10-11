# Setup Guide

Step-by-step instructions to run the IEEE GEHU website locally.

---

## Prerequisites

- [Node.js](https://nodejs.org) `>= 18.x`
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
cd backend && npm install
cd ../frontend && npm install
```

---

## Environment Variables

Create a `.env` file inside `backend/`:

```env
# MongoDB Atlas
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/ieee-gehu

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# JWT
JWT_SECRET=your_strong_secret_key
```

> **Never commit `.env` files.** The file is already in `.gitignore`.

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
cd frontend
npm test
```

---

## Deployment

| Service | Platform | Config |
| :--- | :--- | :--- |
| Frontend | [Vercel](https://vercel.com) | Set `VITE_API_URL` to your backend URL |
| Backend | [Render](https://render.com) | Add all `.env` variables via the Render dashboard |
