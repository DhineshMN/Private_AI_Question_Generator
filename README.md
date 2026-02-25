# 🧠 AI Question Generator

> An AI-powered platform for generating, managing, and exporting high-quality technical assessment questions — built for Subject Matter Experts (SMEs) at L&T EduTech.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Vite](https://img.shields.io/badge/vite-7.x-646CFF.svg)](https://vitejs.dev/)
[![Express](https://img.shields.io/badge/express-5.x-000000.svg)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/mongodb-mongoose-47A248.svg)](https://mongoosejs.com/)
[![Groq](https://img.shields.io/badge/AI-Groq%20%7C%20Llama3.3-orange.svg)](https://console.groq.com/)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Key Features](#-key-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [API Reference](#-api-reference)
- [User Guide](#-user-guide)
- [Environment Variables](#-environment-variables)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

The **AI Question Generator** is a full-stack internal tool that empowers SMEs to generate exam-quality MCQ and coding questions using Large Language Models (Llama 3.3 via Groq), persist them to a MongoDB database, filter/search through a question bank, and export them in multiple formats — all through a sleek, dark-themed web interface.

The platform supports **multi-user authentication** with role-based access (Admin / SME), **per-SME API key management**, and **automatic question watermarking** for attribution.

---

## ✨ Key Features

### 🔐 Authentication & Access Control
- Secure login and registration with email + password
- SHA-256 password hashing (no third-party auth libraries)
- Role-based access: **Admin** (full access) vs **User** (read-only)
- Master admin auto-seeded on first startup: `admin@admin.com` / `admin123`
- Credentials stored in your private MongoDB instance

### 🤖 AI-Powered Question Generation
- Generate **MCQ** and **Coding** questions on any technical topic
- Powered by **Groq Cloud API** (Llama 3.3 70B Versatile / Llama 3.1 8B / Mixtral 8x7B)
- Configurable: topic, subtopic, category, difficulty (Easy / Medium / Hard), and count (1–10)
- Categories: Programming Languages, Core Subjects, Tech Stacks, Frameworks
- Live AI preview before committing questions to the database

### 👥 SME Profile Management
- Register multiple SMEs with individual names, Groq API keys, and preferred models
- Active SME watermark applied to all generated questions for attribution
- Questions store `smeName` + timestamp in MongoDB for full traceability
- Per-SME model selection for personalised generation preferences

### 📚 Question Bank
- Browse all saved questions grouped by session
- **Filter** by: Question Type, Subject Category, Topic/Keyword, Difficulty, Date Range
- **Searchable custom dropdowns** for multi-dimensional filtering
- Collapsible, paginated session groups for clean navigation
- Individual question selection with checkboxes for bulk operations

### 📤 Multi-Format Export
- Export selected questions as **PDF**, **Excel (.xlsx)**, **ZIP**, or **Markdown**
- Export from both the Preview panel (before saving) and the Question Bank
- Neatly formatted output ready for exam platforms and print

### 📊 Admin Dashboard
- Real-time stats: total questions, MCQ count, coding count, total SMEs
- MCQ vs Coding content mix visualised with a progress bar
- Recent activity feed (last 5 generated questions)
- System status panel: MongoDB, Groq AI, API Endpoint health indicators

### 🎯 Test Mode (Practice)
- **MCQ Test**: Timed assessments with progress tracking, navigation dots, instant scoring
- **Coding Test**: Problem panel + AI-simulated code runtime (language-agnostic)
- Detailed results page with score breakdown, pass/fail indicators, and explanations

### 🎨 UI/UX
- Cinematic dark-themed UI with glassmorphism, animated background orbs
- Smooth micro-animations and transitions throughout
- Fully responsive layout with a sidebar-based Admin Hub
- Toast notification system for real-time feedback
- Confirmation modals for destructive actions (logout, delete)

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla JS (ESM), HTML5, CSS3 |
| **Build Tool** | Vite 7.x |
| **Backend** | Node.js, Express.js 5.x |
| **Database** | MongoDB (Mongoose 9.x) |
| **AI Provider** | Groq Cloud (Llama 3.3 70B, 3.1 8B, Mixtral) |
| **Auth** | Custom SHA-256 hashing via Node `crypto` |
| **Export** | jsPDF, jspdf-autotable, SheetJS (xlsx) |

---

## 📂 Project Structure

```
Question-genetaror/
├── client/                         # Frontend (Vite + Vanilla JS)
│   ├── .env.example                # Template: Groq API Key config
│   ├── index.html                  # Root HTML entry point
│   ├── vite.config.js              # Vite proxy config (→ localhost:5000)
│   ├── package.json
│   └── src/
│       ├── main.js                 # Core app logic (~4,300 lines): all pages,
│       │                           #   state, event listeners, AI calls, exports
│       ├── style.css               # Full design system (tokens, components)
│       ├── api.js                  # HTTP helper wrappers for backend routes
│       ├── data.js                 # Static topic/subtopic maps & fallback data
│       ├── utils.js                # Shared utility functions
│       ├── state.js                # Reactive state module
│       ├── counter.js              # Timer utility
│       └── api/                    # Extended API modules
│
├── server/                         # Backend (Express + MongoDB)
│   ├── server.js                   # Express app: all REST API routes
│   ├── .env.example                # Template: MONGO_URI, PORT
│   ├── package.json
│   ├── test-db.js                  # Quick DB connectivity test script
│   └── database/
│       └── models/
│           ├── Question.js         # Question schema (MCQ + Coding, sessions)
│           ├── SME.js              # SME profile schema (name, key, model)
│           └── User.js             # User schema (email, hashed password, role)
│
├── .gitignore
├── package.json                    # Root-level dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

| Requirement | Version |
|---|---|
| [Node.js](https://nodejs.org/) | v18 or higher |
| [MongoDB](https://www.mongodb.com/try/download/community) | Local Community or Atlas |
| [Groq API Key](https://console.groq.com/) | Free tier available |

---

### 1. Clone the Repository

```bash
git clone https://github.com/likhitha2049/Question-genetaror.git
cd Question-genetaror
```

---

### 2. Backend Setup

```bash
cd server
npm install
```

Create a `.env` file in the `server/` directory (copy from `.env.example`):

```env
# server/.env
MONGO_URI=mongodb://127.0.0.1:27017/mcq-db
PORT=5000
```

> **MongoDB Atlas?** Replace `MONGO_URI` with your Atlas connection string:
> `mongodb+srv://<user>:<password>@cluster.mongodb.net/mcq-db`

---

### 3. Frontend Setup

```bash
cd ../client
npm install
```

Create a `.env` file in the `client/` directory (copy from `.env.example`):

```env
# client/.env
VITE_GROQ_API_KEY=gsk_your_key_here
VITE_GROQ_MODEL=llama-3.3-70b-versatile
```

> **Tip:** You can skip this and configure your API key directly inside the Admin → Settings panel after logging in. The key can also be stored per-SME profile.

---

### 4. Run the Application

**Terminal 1 — Start the backend:**
```bash
cd server
node server.js
```
Expected output: `✅ Connected to MongoDB` and `🚀 Server running on http://localhost:5000`

**Terminal 2 — Start the frontend:**
```bash
cd client
npm run dev
```
Expected output: `Local: http://localhost:5173`

**Open your browser:** [http://localhost:5173](http://localhost:5173)

---

### 5. Default Login

| Credential | Value |
|---|---|
| **Email** | `admin@admin.com` |
| **Password** | `admin123` |

> The master admin account is automatically created on first server startup if it doesn't already exist.

---

## 📡 API Reference

All routes are served from `http://localhost:5000`.

### Auth

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/signup` | Register a new user |
| `POST` | `/api/auth/login` | Login with email + password |

### Questions

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/questions` | Fetch all questions |
| `POST` | `/api/questions/bulk` | Bulk save generated questions |
| `PUT` | `/api/questions/:id` | Update a question |
| `DELETE` | `/api/questions/:id` | Delete a question |
| `DELETE` | `/api/questions/clear` | Clear entire question database |
| `PUT` | `/api/questions/session/:sessionId` | Rename a session group |
| `DELETE` | `/api/questions/session/:sessionId` | Delete all questions in a session |

### SME Profiles

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/smes` | Fetch all SME profiles |
| `POST` | `/api/smes` | Add a new SME profile |
| `PUT` | `/api/smes/:id` | Update an SME profile |
| `DELETE` | `/api/smes/:id` | Delete an SME profile |

### Stats & Settings

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/stats` | Get dashboard stats (counts, topics, activity) |
| `POST` | `/api/settings/save-key` | Save Groq API key to `client/.env` |

---

## 📖 User Guide

### Logging In
1. Navigate to `http://localhost:5173`
2. Use your email + password, or the master admin credentials
3. New users can self-register via the **Sign Up** tab

### Generating Questions
1. Log in → you'll land on the **Admin Hub**
2. Go to **Settings** → Register an SME profile (name + Groq API Key)
3. Click **"Set Active"** on the SME profile → the watermark is applied
4. Go to **Question Generator** → select type, category, subtopic, difficulty, count
5. Click **✨ Generate Questions** → preview AI output
6. Click **💾 Save to Database** to persist

### Managing the Question Bank
1. Go to **Question Bank** tab
2. Use the filter sidebar (Type, Category, Topic, Difficulty, Date) to search
3. Check individual questions or select all within a session
4. Click **📦 Export Selected** → choose your format (PDF / Excel / ZIP / Markdown)

### Taking a Practice Test
1. Click **← Back to Home** from Admin Hub → Logout and use the test flow
2. Select Test Type (MCQ / Coding), Category, Subtopic, and Difficulty
3. Click **🚀 Start Test**
4. Complete the test → view your **Results** page with score and explanations

---

## 🔒 Environment Variables

### `server/.env`

| Variable | Required | Default | Description |
|---|---|---|---|
| `MONGO_URI` | ✅ | `mongodb://127.0.0.1:27017/mcq-db` | MongoDB connection string |
| `PORT` | ❌ | `5000` | Express server port |

### `client/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_GROQ_API_KEY` | ⚠️ Optional* | Default Groq API key (fallback if no SME selected) |
| `VITE_GROQ_MODEL` | ❌ | Default model (`llama-3.3-70b-versatile`) |

> \* An API key is required for generation. It can be set in `.env` or per-SME in the Settings tab.

> **Security:** Never commit your real `.env` files. They are already listed in `.gitignore`.

---

## 🤝 Contributing

Contributions, bug reports, and feature requests are welcome.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature-name`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature-name`
5. Open a Pull Request

Please follow [Conventional Commits](https://www.conventionalcommits.org/) for commit messages.

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">
  <p>Developed by <strong>Dhinesh</strong> and <strong>Likhitha</strong> · L&T EduTech</p>
</div>
