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
1. Copy `server/.env.example` to `server/.env`
2. Edit `server/.env` and fill in:
   - `MONGODB_URI`: Your MongoDB Atlas connection string (from step 5 above)
   - `GROQ_API_KEY`: Get from [https://console.groq.com/keys](https://console.groq.com/keys)
   - `JWT_SECRET`: Keep as-is or set a custom strong secret

**⚠️ IMPORTANT**: Never commit `.env` file to GitHub - it contains secrets!

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
