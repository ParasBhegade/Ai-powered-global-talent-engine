# AI Talent Recommendation Platform - Project Documentation

## 🚀 Overview
The **AI Talent Recommendation Platform** is a state-of-the-art career guidance and recruitment ecosystem. It leverages Artificial Intelligence to analyze student skills, aptitudes, and interests to provide personalized career path recommendations and AI-driven interview preparation.

The project is currently in a **Hybrid Phase**, featuring a robust legacy PHP/MySQL engine transitioning into a modern MERN-like stack (React, Node.js, Express, MongoDB).

---

## 🏗️ Project Architecture
The platform follows a split-module architecture:

### 1. Modern Module (Future-Proof Stack)
- **Frontend**: `client/` - Built with **React 19** and **Vite**.
- **Backend**: `server/` - **Node.js** with **Express.js**.
- **Database**: **MongoDB** (via Mongoose) for modern user authentication and session management.

### 2. Core Engine (Legacy & Stable)
- **Engine**: Standard **PHP** for core logic, recommendations, and dashboards.
- **Database**: **MySQL/MariaDB** (`ai_talent_db.sql`) storing structured data for skills, career paths, and historical results.

---

## 📂 Directory Structure
```text
AI-Talent-Recommendation/
├── client/                 # Modern React Frontend (Vite)
├── server/                 # Modern Node.js Backend (Express/MongoDB)
├── database/               # SQL Schemas and DB Connection logic
├── includes/               # Reusable PHP components (Headers, Navbars)
├── uploads/                # User-uploaded assets and resumes
├── assets/                 # CSS/JS/Images for the PHP frontend
├── pages/                  # PHP-based page templates
├── config.php              # PHP Database & API Configuration
├── ai_assistant_api.php    # AI Chat Logic (PHP)
├── recommendations.php     # Core recommendation engine
├── Student_dashboard.php   # Student interface
└── admin_analytics.php     # Admin visualization dashboard
```

---

## 💻 Tech Stack & Frameworks

### Frontend (User Interface)
- **Modern**: React 19, Vite, Axios, React Router.
- **Legacy**: PHP, HTML5, CSS3, JavaScript.
- **Design**: Premium Glassmorphism, Dark/Light Mode support, Responsive Grid Layouts.
- **Data Visualization**: **Chart.js** (via `react-chartjs-2`) for skill analysis and admin analytics.

### Backend (Logic & Security)
- **Node.js & Express**: High-performance RESTful APIs.
- **PHP**: Procedural and OOP logic for structured data handling.
- **Authentication**: JWT (JSON Web Tokens) for modern auth, Session-based for legacy.
- **Security**: Bcryptjs for password hashing.

### Database (Storage)
- **MongoDB**: Schema-less storage for flexible user data and modern features.
- **MySQL**: Relational storage for career paths (`career_paths`), skills (`career_skills`), and aptitude records.

---

## 🧠 AI Models & Logic
The platform integrates advanced AI using the following tools:

### 1. Large Language Models (LLMs)
- **Llama 3.3 (70B Versatile)**: Used via the **Groq Cloud API** for high-speed, accurate career advice and chat interactions.
- **Gemini (via Google)**: Integrated for complex analysis and content generation through Stitch development patterns.

### 2. Core AI Features
- **AI Career Assistant**: A real-time chatbot that answers student queries about career transitions and skill gaps.
- **AI Interview Engine**: Generates dynamic interview questions based on a user's target career and skill level.
- **Recommendation Engine**: A custom algorithm that maps student aptitude scores and skills to the most suitable career paths in the database.

---

## 📊 Business Logic
1. **Assessment**: Students take aptitude tests and add their technical/soft skills.
2. **Recommendation**: The system calculates a "Similarity Score" between user profiles and career requirements.
3. **Growth**: The AI Assistant provides a roadmap, and the AI Interview tool prepares the user for the industry.
4. **Analytics**: Admins monitor talent trends, top skills, and career popularity through dynamic dashboards.

---

## 🛡️ Authentication & Security
- **Modern Login**: Uses JWT stored in HTTP-only cookies for the React-Node communication.
- **Legacy Login**: Uses standard PHP sessions and salted password hashing.
- **File Uploads**: Managed via `multer` in Node and standard PHP upload handlers, with sanitization for security.

---

## 🛠️ How it all works together
The **React Frontend** communicates with the **Node.js Server** via Axios. Meanwhile, the core career data and historical student records are often synced or queried via the **PHP Backend**, which acts as the stable legacy foundation. This hybrid approach allows for high reliability while adopting modern UI/UX standards.
