# IEEE Student Branch - Graphic Era Hill University, Dehradun Campus

![IEEE Banner Placeholder](https://via.placeholder.com/1200x400?text=IEEE+Student+Branch+GEHU+Dehradun+Campus)

## 🌟 About Us
**"Advancing Technology for Humanity"**

Welcome to the official website of the IEEE Student Branch at **Graphic Era Hill University (GEHU), Dehradun Campus**. We are a vibrant community of tech enthusiasts, innovators, and leaders dedicated to bridging the gap between academic learning and industry standards.

Our mission is to foster technical innovation, professional growth, and global networking opportunities for our students.

## 🚀 Features
-   **Dynamic Event Management**: View upcoming and past events fetched from our backend API.
-   **Executive Team Showcase**: Meet the team driving our vision.
-   **Interactive UI**: Built with React and Framer Motion for smooth animations.
-   **Responsive Design**: Fully responsive layout using Tailwind CSS v4.
-   **Contact System**: Integrated contact form to reach out to the branch.

## 🛠️ Tech Stack
This project is a modern Full-Stack Application:

### Frontend
-   **Framework**: React (Vite)
-   **Styling**: Tailwind CSS v4, Framer Motion
-   **Routing**: React Router DOM
-   **Icons**: Lucide React
-   **Design Pattern**: Component-based architecture inspired by modern design systems.

### Backend
-   **Runtime**: Node.js
-   **Framework**: Express.js
-   **API**: RESTful API endpoints (`/api/events`, `/api/team`, `/api/contact`)
-   **Data Persistence**: Currently using JSON file-based storage (Migration to MongoDB planned).

## 📂 Project Structure
```
IEEE-website/
├── frontend/           # React Frontend Application
│   ├── src/
│   │   ├── components/ # Reusable UI Components (Header, Hero, etc.)
│   │   ├── assets/     # Images and Logos
│   │   ├── App.jsx     # Main Application Component
│   │   └── index.css   # Global Styles & Tailwind Config
│   └── vite.config.js  # Vite Configuration (Proxy setup)
│
├── backend/            # Express Backend Application
│   ├── data/           # Mock JSON Data (events.json, team.json)
│   ├── routes/         # API Route definitions
│   └── server.js       # Server Entry Point
│
└── README.md           # Project Documentation
```

## 🚀 Getting Started

### Prerequisites
-   Node.js (v18+)
-   npm (v9+)

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/YZO-BIT/IEEE-website.git
    cd IEEE-website
    ```

2.  **Setup Backend**
    The backend runs on port `5000`.
    ```bash
    cd backend
    npm install
    node server.js
    ```
    *Keep this terminal running.*

3.  **Setup Frontend**
    Open a new terminal. The frontend runs on port `5173` (or `5174`).
    ```bash
    cd frontend
    npm install
    npm run dev
    ```

4.  **Visit the App**
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🤝 Contribution
We welcome contributions! Please follow these steps:
1.  Fork the repository.
2.  Create a new branch (`git checkout -b feature/YourFeature`).
3.  Commit your changes (`git commit -m 'Add some feature'`).
4.  Push to the branch (`git push origin feature/YourFeature`).
5.  Open a Pull Request.

## 📞 Contact Us
-   **Email**: ieee@gehu.ac.in
-   **Address**: Graphic Era Hill University, Dehradun, Uttarakhand, India
-   **Socials**: [LinkedIn](#) | [Instagram](#) | [Twitter](#)

---
*Maintained by the IEEE Student Branch GEHU Web Team.*
