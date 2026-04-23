# 🚀 How to Run the AI Talent Engine (MERN)

This guide documents the exact process to get the migrated MERN application up and running on your local machine.

## 📋 Prerequisites
- **Node.js** (v18 or higher recommended)
- **MongoDB Atlas Account** (Free tier is perfect)
- **Groq API Key** (Already provided in `.env`)

---

## 🛠️ Step 1: Environment Configuration
The backend requires a connection string to your MongoDB Atlas cluster.

1.  Open `server/.env`.
2.  Update the `MONGODB_URI` with your Atlas connection string.
    > [!IMPORTANT]
    > Ensure you replace `<password>` with your actual database password and URL-encode special characters (e.g., `@` becomes `%40`).
    > Your current working URI is: `mongodb+srv://talent_ai:talent%402027@cluster0.4fq1utt.mongodb.net/ai_talent_db?appName=Cluster0`

---

## 🏗️ Step 2: Backend Setup & Data Seeding
Before running the server, you need to install dependencies and populate the database with initial data (Career Paths, Skills, Questions).

1.  Open a terminal and navigate to the `server` directory:
    ```bash
    cd server
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  **Seed the database** (Run this only once):
    ```bash
    npm run seed
    ```
    *Wait until you see "🎉 Seed complete!" in the console.*

---

## 🖥️ Step 3: Frontend Setup
1.  Open a **new** terminal window and navigate to the `client` directory:
    ```bash
    cd client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

---

## ⚡ Step 4: Running the Application
You need to run both the backend and frontend servers simultaneously.

### **1. Start the Backend (API Server)**
In your `server` terminal:
```bash
npm start
```
*The server will run on `http://localhost:5000`.*

### **2. Start the Frontend (UI)**
In your `client` terminal:
```bash
npm run dev
```
*The React app will run on `http://localhost:5173`.*

---

## 🔓 Accessing the Platform

### **1. Landing Page**
Open [http://localhost:5173](http://localhost:5173) in your browser.

### **2. Admin Login**
Click the **"Admin"** button in the navbar or go to `/admin-login`.
- **Email:** `admin@aitalent.com'`
- **Password:** `admin123`

### **3. Student Access**
You can create a new student account using the **Signup** page or start an AI Interview immediately from the home page.

---

## ❓ Troubleshooting
- **Port 5000 is occupied**: Kill any existing Node processes using `Stop-Process -Name node -Force` in PowerShell.
- **MongoDB Connection Error**: Check your IP Whitelist in MongoDB Atlas (ensure `0.0.0.0/0` is added).
- **Vite Build Errors**: Run `npm install` again in the `client` directory.
