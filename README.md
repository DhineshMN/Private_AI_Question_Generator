# 🧠 AI Mock Test Generator

A state-of-the-art, AI-powered platform for generating and taking technical assessments. Built with a focus on high performance and minimal dependencies, this application leverages the power of Large Language Models (LLMs) to provide dynamic mcq and coding tests with real-time feedback.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Version](https://img.shields.io/badge/version-1.0.0-green.svg)
![Vite](https://img.shields.io/badge/vite-7.3.1-646CFF.svg)
![Express](https://img.shields.io/badge/express-5.2.1-000000.svg)
![MongoDB](https://img.shields.io/badge/mongodb-9.2.1-47A248.svg)

---

## ✨ Key Features

- **🚀 Dynamic AI Generation**: Generate unique questions for any topic (Data Structures, Algorithms, React, SQL, etc.) on the fly using Llama 3.3.
- **💻 Simulated Coding Runtime**: A "Language-less" code execution experience where the AI acts as a deterministic terminal to provide instant output for Python, Java, C++, and more.
- **📝 Intelligent MCQ Tests**: Adaptive assessments with varying difficulty levels (Easy, Medium, Hard).
- **📊 Real-time Assessment**: Instant scoring, pass/fail status for coding problems, and "Senior Architect" level hints/feedback.
- **🛡️ Persistence & Admin Hub**: Save generated questions to a local MongoDB instance and manage them through a dedicated Admin portal.
- **🎨 Premium UI/UX**: Cinematic, dark-themed interface with glassmorphism, smooth animations, and responsive design.

---

## 🏗️ Technical Architecture

### Frontend
- **Core**: Vanilla JavaScript (ESM), HTML5, CSS3.
- **Build Tool**: Vite.
- **State Management**: Centralized reactive state engine within `main.js`.
- **AI Integration**: Groq Cloud API (Llama 3.3 70B & 8B).

### Backend
- **Framework**: Express.js.
- **Database**: MongoDB (via Mongoose).
- **Functionality**: Question persistence, bulk storage, and retrieval API.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (Running locally or a connection string)
- [Groq API Key](https://console.groq.com/) (Required for AI features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/likhitha2049/Question-genetaror.git
   cd mcq-1
   ```

2. **Frontend Setup**:
   ```bash
   cd client
   npm install
   ```

3. **Backend Setup**:
   ```bash
   cd ../server
   npm install
   ```

4. **Environment Configuration**:
   
   **Server (.env)**
   Create a `.env` file in the `server` directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/mcq-db
   PORT=5000
   ```

   **Client (.env) - API Key Security**
   Authentication is handled securely via the client.
   - Rename `client/.env.example` to `client/.env`.
   - Add your **Groq API Key** (starts with `gsk_...`).
   ```env
   VITE_GROQ_API_KEY=gsk_your_key_here
   ```
   > **Note:** You can also configure this directly in the application UI (Admin > Settings), which will automatically save it to your local system securely.

---

## 🏃 Running the Application

1. **Start the Backend Server**:
   ```bash
   cd server
   node server.js
   ```

2. **Start the Frontend (Vite Dev Server)**:
   ```bash
   cd client
   npm run dev
   ```

3. **Open the App**:
   Visit `http://localhost:5173` in your browser.

---

## 📂 Project Structure

```text
mcq-1/
├── client/
│   ├── .env              # Local API Key Storage (Not committed)
│   ├── .env.example      # Template for API Key config
│   ├── index.html        # Main Entry Point
│   ├── package.json      # Frontend Dependencies
│   └── src/
│       ├── main.js       # Core Application Logic
│       ├── style.css     # Design System
│       └── data.js       # Mock Data
├── server/
│   ├── server.js         # API Server
│   ├── package.json      # Backend Dependencies
│   ├── .env              # Backend Environment
│   └── database/
│       └── models/
│           └── Question.js
├── TECHNICAL_HANDOVER.md
└── README.md
```

---

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

**Developed by Dhinesh and Likhitha**
