# AI Powered Global Talent & Recommendation Engine (MERN)

Full-stack MERN application for AI-powered career guidance, mock interviews, and personalized learning.

## Tech Stack
- **Frontend**: React (Vite) + React Router + Chart.js
- **Backend**: Express.js + Node.js
- **Database**: MongoDB Atlas (cloud)
- **AI**: Groq API (llama-3.3-70b-versatile)
- **Auth**: JWT (httpOnly cookies)

## Quick Start

### 1. MongoDB Atlas Setup (Free)
1. Go to [https://www.mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account → Create a free cluster (M0)
3. Under **Database Access**: Create a user with password
4. Under **Network Access**: Add `0.0.0.0/0` (allow all IPs for dev)
5. Click **Connect** → **Drivers** → Copy the connection string
6. It looks like: `mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/ai_talent_db?retryWrites=true&w=majority`

### 2. Configure Environment
Edit `server/.env` and paste your connection string:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ai_talent_db?retryWrites=true&w=majority
```

### 3. Seed Database
```bash
cd server
npm run seed
```
This creates: admin user, 10 career paths, 70+ skills, 15 aptitude questions, 6 tutorials.

**Admin login**: `admin@aitalent.com` / `admin123`

### 4. Start Backend
```bash
cd server
npm start
```
Server runs on `http://localhost:5000`

### 5. Start Frontend
```bash
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`

## Features
- 🤖 AI Career Recommendations (Groq API)
- 🎯 Live AI Interviews (camera + speech recognition)
- 📊 Aptitude Tests with Chart.js visualizations
- 👤 Profile management with photo upload
- 🛡️ Admin dashboard with analytics
- 💬 Floating AI chatbot assistant
