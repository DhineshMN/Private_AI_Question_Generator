// =============================================
// AI MOCK TEST GENERATOR — MAIN APPLICATION
// =============================================

import './style.css';
import { mcqQuestions, codingProblems } from './data.js';

// =============================================
// STATE
// =============================================
const state = {
  testType: 'mcq',
  difficulty: 'medium',
  currentQuestion: 0,
  answers: [],
  questions: [],
  problem: null,
  timerInterval: null,
  timeLeft: 0,
  totalTime: 0,
  testStarted: false,
  language: 'python',
  category: 'subjects',
  subtopic: 'Data Structures',
  groqKey: localStorage.getItem('groq_key') || import.meta.env.VITE_GROQ_API_KEY || '',
  groqModel: localStorage.getItem('groq_model') || import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile',
  codingResults: [], // Track pass/fail for each problem
  codingHints: [], // Store AI hints
  selectedTestCaseIndex: 0,
  activeFile: null,
  workingCode: {}, // Store user edits per file
  savedQuestions: [], // Cache for admin view
  lastStatsFetch: 0, // Performance: Cache stats
  lastQuestionsFetch: 0, // Performance: Cache question table
  activeSessionName: null,
  sessionPendingQuestions: [], // Auto-accumulation array for active sessions
  mqPagination: {
    sessionPage: 1,
    sessionsPerPage: 10, // Global pagination limit
    groupPages: {},      // Tracks pagination per group: { "groupId": 1 }
    itemsPerPage: 5      // Limit inner questions per group
  },
  collapsedGroups: {},   // Tracks which blocks are collapsed: { "groupId": true }
};

// =============================================
// RENDER APP SHELL
// =============================================
function renderApp() {
  document.getElementById('app').innerHTML = `
    <!-- Brand Header -->
    <header class="brand-header" id="brand-header">
      <div class="brand-header-inner">
        <img src="/new-edutech-logo.webp" alt="L&T EduTech Logo" class="brand-logo brand-logo-edutech" />
        <img src="/download.svg" alt="Solve Logo" class="brand-logo brand-logo-solve" />
      </div>
    </header>

    <!-- Animated Background -->
    <div class="bg-animated">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
    </div>

    <!-- Toast Container -->
    <div class="toast-container" id="toast-container"></div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loading-overlay">
      <div class="spinner"></div>
      <div class="loading-text">Generating your test...</div>
    </div>

    <!-- SVG Defs for gradients -->
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="50%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- HOME PAGE -->
    <div id="home-page" class="page active">
      ${renderHomePage()}
    </div>

    <!-- ADMIN PAGE -->
    <div id="admin-page" class="page">
      ${renderAdminPage()}
    </div>

    <!-- MCQ TEST PAGE -->
    <div id="mcq-page" class="page">
      ${renderMCQPage()}
    </div>

    <!-- CODING TEST PAGE -->
    <div id="coding-page" class="page">
      ${renderCodingPage()}
    </div>

    <!-- RESULT PAGE -->
    <div id="result-page" class="page">
      ${renderResultPage()}
    </div>

    <!-- Confirmation Modal (top-level so it's always accessible) -->
    <div class="loading-overlay" id="confirm-modal-overlay" style="z-index: 9999; backdrop-filter: blur(8px);">
      <div class="card card-glass" style="max-width: 420px; width: 90%; padding: 32px; text-align: center; animation: slideIn 0.3s ease;">
        <div id="confirm-modal-icon" style="font-size: 2.5rem; margin-bottom: 16px;">🚪</div>
        <h3 id="confirm-modal-title" style="font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; color: var(--text);">Log Out?</h3>
        <p id="confirm-modal-message" style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 28px;">Are you sure you want to log out?</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" id="confirm-modal-cancel" style="min-width: 120px;">Cancel</button>
          <button class="btn btn-primary" id="confirm-modal-confirm" style="min-width: 120px; background: linear-gradient(135deg, #ef4444, #dc2626);">Log Out</button>
        </div>
      </div>
    </div>
  `;

  attachHomeListeners();
  attachAdminListeners();
  attachMCQListeners(); // Init MCQ buttons once
}

// =============================================
// HOME PAGE
// =============================================
function renderHomePage() {
  return `
    <!-- Unified Landing: Split Layout -->
    <div id="landing-view" style="display: flex; align-items: center; justify-content: center; height: calc(100vh - 60px); width: 100%; padding: 0 60px; gap: 40px; box-sizing: border-box; overflow: hidden;">

      <!-- LEFT: Branding & Features -->
      <div style="flex: 1; max-width: 520px;">
        <div style="display: flex; flex-direction: column; align-items: center; gap: 16px; margin-bottom: 36px;">
          <div class="logo-icon" style="width: 96px; height: 96px; border-radius: 24px; font-size: 2.8rem; flex-shrink: 0;">🧠</div>
          <h1 style="font-size: 2rem; font-weight: 800; background: linear-gradient(135deg, #6366f1, #8b5cf6, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; margin: 0; line-height: 1.3; text-align: center;">AI Question Generator</h1>
        </div>

        <p style="color: var(--text-secondary); font-size: 0.95rem; line-height: 1.7; margin-bottom: 40px; max-width: 440px;">
          Generate high-quality MCQ & coding questions powered by AI. Manage sessions, export in multiple formats, and build your question bank effortlessly.
        </p>

        <div style="display: flex; flex-direction: column; gap: 20px;">
          <div style="display: flex; align-items: flex-start; gap: 14px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: rgba(99, 102, 241, 0.12); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">✨</div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; color: var(--text); margin-bottom: 3px;">AI-Powered Generation</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">Generate exam-quality MCQs and coding challenges using LLMs with detailed explanations.</div>
            </div>
          </div>


          <div style="display: flex; align-items: flex-start; gap: 14px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: rgba(6, 182, 212, 0.12); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">📄</div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; color: var(--text); margin-bottom: 3px;">Multi-Format Export</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">Export questions as PDF, Excel, ZIP, or Markdown — ready for exams and assessments.</div>
            </div>
          </div>

          <div style="display: flex; align-items: flex-start; gap: 14px;">
            <div style="width: 56px; height: 56px; border-radius: 14px; background: rgba(16, 185, 129, 0.12); display: flex; align-items: center; justify-content: center; font-size: 1.5rem; flex-shrink: 0;">👥</div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; color: var(--text); margin-bottom: 3px;">Multi-User Access</div>
              <div style="font-size: 0.8rem; color: var(--text-secondary); line-height: 1.5;">Secure login with role-based access. Each SME gets their own profile and API key.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: Auth Card -->
      <div style="flex: 0 0 auto; width: 400px;">
        <div class="card card-glass" style="width: 100%; padding: 32px; border: 1px solid rgba(255,255,255,0.08);">
          <!-- Auth Mode Toggle -->
          <div class="type-segmented-control" id="auth-mode-toggle" style="margin-bottom: 24px;">
            <button class="type-segment active" data-value="login">🔑 Sign In</button>
            <button class="type-segment" data-value="signup">📝 Sign Up</button>
          </div>

          <!-- Error / Success Banner -->
          <div id="auth-message" style="display: none; padding: 12px 16px; border-radius: 8px; font-size: 0.85rem; margin-bottom: 20px; line-height: 1.4;"></div>

          <!-- Login Form -->
          <div id="auth-login-form">
            <div class="form-group" style="margin-bottom: 20px;">
              <label class="form-label" style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.6px;">Email Address</label>
              <input type="email" class="form-input" id="login-email" placeholder="admin@admin.com" autocomplete="email" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); padding: 12px 16px; border-radius: 8px; font-size: 0.92rem; outline: none; transition: var(--transition);">
            </div>
            <div class="form-group" style="margin-bottom: 24px;">
              <label class="form-label" style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.6px;">Password</label>
              <input type="password" class="form-input" id="login-password" placeholder="Enter your password" autocomplete="current-password" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); padding: 12px 16px; border-radius: 8px; font-size: 0.92rem; outline: none; transition: var(--transition);">
            </div>
            <button class="btn btn-primary btn-lg w-full" id="login-submit-btn" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              🔓 Sign In
            </button>
          </div>

          <!-- Signup Form -->
          <div id="auth-signup-form" style="display: none;">
            <div class="form-group" style="margin-bottom: 18px;">
              <label class="form-label" style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.6px;">Email Address</label>
              <input type="email" class="form-input" id="signup-email" placeholder="you@example.com" autocomplete="email" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); padding: 12px 16px; border-radius: 8px; font-size: 0.92rem; outline: none; transition: var(--transition);">
            </div>
            <div class="form-group" style="margin-bottom: 18px;">
              <label class="form-label" style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.6px;">Password</label>
              <input type="password" class="form-input" id="signup-password" placeholder="Min. 6 characters" autocomplete="new-password" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); padding: 12px 16px; border-radius: 8px; font-size: 0.92rem; outline: none; transition: var(--transition);">
            </div>
            <div class="form-group" style="margin-bottom: 24px;">
              <label class="form-label" style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.6px;">Confirm Password</label>
              <input type="password" class="form-input" id="signup-confirm" placeholder="Re-enter password" autocomplete="new-password" style="width: 100%; background: rgba(255,255,255,0.05); border: 1px solid var(--border); color: var(--text); padding: 12px 16px; border-radius: 8px; font-size: 0.92rem; outline: none; transition: var(--transition);">
            </div>
            <button class="btn btn-primary btn-lg w-full" id="signup-submit-btn" style="display: flex; align-items: center; justify-content: center; gap: 8px;">
              ✨ Create Account
            </button>
          </div>

          <!-- Footer Hint -->
          <div style="margin-top: 20px; text-align: center; font-size: 0.76rem; color: var(--text-secondary); opacity: 0.6;">
            🔒 Credentials stored securely in your local database
          </div>
        </div>
      </div>

    </div>

    <!-- Hidden legacy elements (keep for JS compatibility) -->
    <div id="auth-view" style="display: none;"></div>
    <button id="goto-practice-btn" style="display: none;"></button>
    <button id="goto-admin-landing-btn" style="display: none;"></button>
    <button id="goto-login-btn" style="display: none;"></button>
    <button id="auth-back-btn" style="display: none;"></button>
    <span id="auth-view-title" style="display: none;"></span>

    <div id="selection-view" class="home-container" style="display: none;">
      <div class="home-logo" style="margin-bottom: 0;">
        <div class="logo-icon" style="width: 80px; height: 80px; border-radius: 20px; font-size: 2.2rem;">🧠</div>
        <h1 class="home-title" style="font-size: 1.5rem;">Configure Your Test</h1>
      </div>

      <div class="card card-glass home-card" style="width: 100%;">
        <div class="form-group">
          <label class="form-label">Test Type</label>
          <div class="type-segmented-control" id="home-test-type-toggle">
            <button class="type-segment active" data-value="mcq">📝 MCQ Test</button>
            <button class="type-segment" data-value="coding">💻 Coding Test</button>
          </div>
        </div>

        <div class="form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 20px;">
          <div class="form-group">
            <label class="form-label">Category</label>
            <select class="form-select" id="test-category-select" style="width: 100%;">
              <option value="languages">💻 Languages</option>
              <option value="subjects" selected>📚 Subjects</option>
              <option value="stacks">🥞 Tech Stacks</option>
              <option value="frameworks">🏗️ Frameworks</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Subtopic</label>
            <select class="form-select" id="test-subtopic-select" style="width: 100%;">
              <!-- Dynamic -->
            </select>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">Difficulty Level</label>
          <div class="difficulty-grid">
            <button class="diff-btn" data-level="easy" id="diff-easy">
              🟢 Easy
            </button>
            <button class="diff-btn active" data-level="medium" id="diff-medium">
              🟡 Medium
            </button>
            <button class="diff-btn" data-level="hard" id="diff-hard">
              🔴 Hard
            </button>
          </div>
        </div>

        <button class="btn btn-primary btn-lg w-full" id="start-test-btn">
          🚀 Start Test
        </button>
        
        <button class="btn btn-secondary btn-sm" id="back-to-landing-btn" style="margin-top: 15px; width: 100%; border: none; background: transparent; opacity: 0.6;">
          ← Back to Home
        </button>
      </div>
    </div>
  `;
}

// =============================================
// ADMIN PAGE
// =============================================
function renderAdminPage() {
  return `
    <div class="admin-layout">
      <!-- Admin Sidebar -->
      <aside class="admin-sidebar">
        <div class="sidebar-header">
          <div class="sidebar-logo">🧠</div>
          <div class="sidebar-title">Admin Hub</div>
        </div>
        <nav class="sidebar-nav">
          <button class="nav-item active" data-tab="dashboard">
            <span class="nav-icon">📊</span> Dashboard
          </button>
          <button class="nav-item" data-tab="generator">
            <span class="nav-icon">✨</span> Question Generator
          </button>
          <button class="nav-item" data-tab="questions">
            <span class="nav-icon">📚</span> Question Bank
          </button>
          <button class="nav-item" data-tab="settings">
            <span class="nav-icon">⚙️</span> Settings
          </button>
        </nav>
        <div class="sidebar-footer">
          <button class="btn btn-secondary btn-sm w-full" id="admin-back-btn" style="display: flex; align-items: center; justify-content: center; gap: 8px; border-color: rgba(239, 68, 68, 0.3); color: #fca5a5; background: rgba(239, 68, 68, 0.08);">
            🚪 Logout
          </button>
        </div>
      </aside>

      <!-- Admin Main Content -->
      <main class="admin-main">
        <!-- Dashboard Tab -->
        <div id="tab-dashboard" class="admin-tab active">
          <header class="admin-header">
            <div>
              <h2 class="admin-title">Dashboard Overview</h2>
              <p class="admin-subtitle">Real-time database insights and system status</p>
            </div>
            <div class="admin-actions">
              <span id="dashboard-last-updated" style="font-size: 0.75rem; opacity: 0.5; margin-right: 15px;">Last synced: Just now</span>
              <span class="status-badge">🟢 System Online</span>
            </div>
          </header>
          
          <!-- Primary Stats -->
          <div class="admin-stats-grid">
            <div class="stat-box main-stat">
              <div class="stat-icon">📊</div>
              <div class="stat-info">
                <div class="stat-value" id="stat-total-questions">0</div>
                <div class="stat-label">Total Questions</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <div class="stat-value" id="stat-mcq-count">0</div>
                <div class="stat-label">MCQ Bank</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">💻</div>
              <div class="stat-info">
                <div class="stat-value" id="stat-coding-count">0</div>
                <div class="stat-label">Coding Bank</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">🎓</div>
              <div class="stat-info">
                <div class="stat-value" id="stat-sme-count">0</div>
                <div class="stat-label">Total SMEs</div>
              </div>
            </div>
          </div>

          <div class="dashboard-grid">
            <!-- Recent Activity Column (Primary) -->
            <div class="card card-glass">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                <p class="card-title" style="margin-bottom: 0;">⚡ Recent Activity</p>
                <button class="btn btn-secondary btn-sm" id="view-all-questions-btn">View All</button>
              </div>
              <div id="dashboard-recent-activity">
                <div style="opacity: 0.7; padding: 40px; text-align: center;">
                  <span class="spinner-sm"></span> Syncing activity...
                </div>
              </div>
            </div>

            <!-- Side Metrics Column -->
            <div class="metrics-column">
              <!-- Content Mix Card -->
              <div class="card card-glass metric-mini-card">
                <p class="metric-title">📚 Content Mix</p>
                <div class="metric-visual" id="content-mix-chart">
                  <div class="mix-info">
                    <span id="mix-mcq-label">MCQs: --%</span>
                    <span id="mix-coding-label">Coding: --%</span>
                  </div>
                  <div class="progress-bar-wrap mix-bar">
                    <div class="progress-bar-fill mcq-fill" id="mix-mcq-bar" style="width: 50%"></div>
                    <div class="progress-bar-fill coding-fill" id="mix-coding-bar" style="width: 50%"></div>
                  </div>
                </div>
              </div>

              <!-- Database Health Card -->
              <div class="card card-glass metric-mini-card" style="margin-top: 20px;">
                <p class="metric-title">🛡️ System Status</p>
                <div class="status-grid-v2">
                  <div class="status-item-v2">
                    <span class="status-dot online"></span>
                    <span>MongoDB Connection</span>
                  </div>
                  <div class="status-item-v2">
                    <span class="status-dot online"></span>
                    <span>AI Provider (Groq)</span>
                  </div>
                  <div class="status-item-v2">
                    <span class="status-dot online"></span>
                    <span>API Endpoint</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Generator Tab -->
        <div id="tab-generator" class="admin-tab">
          <header class="admin-header">
            <h2 class="admin-title">AI Question Generator</h2>
            <p class="admin-subtitle">Generate high-quality questions using AI</p>
          </header>

          <div class="generator-container">
            <div class="card card-glass generator-form">
              <!-- Session Controller (hidden - kept for future use) -->
              <div id="session-controller-ui" style="display: none; pointer-events: none; margin-bottom: 24px; padding: 16px; background: rgba(0, 0, 0, 0.2); border: 1px solid var(--border); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <label class="form-label" style="margin: 0;">Generation Session</label>
                  <span id="session-status-badge" class="badge badge-secondary" style="font-size: 0.65rem;">Inactive</span>
                </div>
                
                <div id="session-inactive-view">
                  <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px; line-height: 1.4;">
                    Start a session to group generated questions together (e.g., "Midterm Prep").
                  </p>
                  <div style="display: flex; gap: 8px;">
                    <input type="text" class="form-input" id="session-name-input" placeholder="e.g. React Patterns..." style="flex: 1;" />
                    <button class="btn btn-primary btn-sm" id="start-session-btn" style="white-space: nowrap;">▶ Start</button>
                  </div>
                </div>

                <div id="session-active-view" style="display: none;">
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="flex: 1;">
                      <div id="active-session-name-display" style="font-weight: 600; color: var(--primary-light); font-size: 1.1rem; margin-bottom: 4px;">Session Name</div>
                      <div id="active-session-id-display" style="font-family: monospace; font-size: 0.7rem; opacity: 0.5;">ID: ...</div>
                    </div>
                  </div>
                  <button class="btn btn-danger btn-sm w-full" id="end-session-btn">⏹ End Session</button>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Question Type</label>
                <div class="type-segmented-control" id="gen-type-toggle">
                  <button class="type-segment active" data-value="mcq">📝 MCQ</button>
                  <button class="type-segment" data-value="coding">💻 Coding</button>
                </div>
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Category</label>
                  <select class="form-select" id="gen-category">
                    <option value="languages">💻 Programming Languages</option>
                    <option value="subjects" selected>📚 Core Subjects</option>
                    <option value="stacks">🥞 Tech Stacks</option>
                    <option value="frameworks">🏗️ Frameworks</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Subtopic</label>
                  <select class="form-select" id="gen-subtopic">
                    <!-- Dynamic subtopics -->
                  </select>
                </div>
              </div>

              <div class="form-group">
                <label class="form-label">Specific Topic (Optional)</label>
                <input type="text" class="form-input" id="gen-topic" placeholder="e.g. Memory Management, API Security...">
              </div>

              <div class="form-row">
                <div class="form-group">
                  <label class="form-label">Difficulty</label>
                  <select class="form-select" id="gen-difficulty">
                    <option value="easy">🟢 Easy</option>
                    <option value="medium" selected>🟡 Medium</option>
                    <option value="hard">🔴 Hard</option>
                  </select>
                </div>
                <div class="form-group">
                  <label class="form-label">Count</label>
                  <input type="number" class="form-input" id="gen-count" value="5" min="1" max="10">
                </div>
              </div>

              <!-- Active SME Watermark Box -->
              <div style="margin: 20px 0; padding: 16px; background: rgba(15, 23, 42, 0.4); border: 1px dashed var(--primary-light); border-radius: 8px; text-align: center;">
                <label class="form-label" style="font-size: 0.70rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">ACTIVE SME WATERMARK</label>
                <div id="active-sme-watermark-display" style="font-weight: 600; font-size: 1.1rem; color: var(--danger-light); margin-bottom: 8px;">
                  ❌ No SME Selected
                </div>
                <p id="active-sme-watermark-hint" style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">
                  Select SME in Settings to apply watermark
                </p>
              </div>

              <button class="btn btn-primary btn-lg w-full" id="generate-questions-btn" style="margin-top: 8px;">
                ✨ Generate Questions
              </button>
            </div>

            <div class="generator-preview">
              <div class="card card-glass preview-card">
                <div class="preview-header">
                  <span class="preview-title">✨ Preview</span>
                  <div style="display: flex; gap: 8px;">
                    <button class="btn btn-secondary btn-sm" id="save-generated-btn" disabled>💾 Save to Database</button>
                  </div>
                </div>
                <div class="preview-content" id="gen-preview-content">
                  <div class="empty-preview">
                    <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;">✨</div>
                    <p>Enter a topic and click generate to see AI-powered questions here.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Questions Tab -->
        <div id="tab-questions" class="admin-tab">
          <header class="admin-header">
            <div>
               <h2 class="admin-title">Question Bank</h2>
               <p style="color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px;">Search, filter, export, and manage your generated questions</p>
            </div>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-primary btn-sm" id="export-selected-btn" disabled>📦 Export Selected</button>
                <button class="btn btn-secondary btn-sm" id="refresh-questions-btn">🔄 Refresh Data</button>
            </div>
          </header>

          <div style="display: flex; gap: 24px; align-items: flex-start;">
            <!-- Filter Sidebar -->
            <div class="card card-glass" style="width: 280px; flex-shrink: 0; padding: 20px;">
              <div style="font-weight: 600; font-size: 1rem; margin-bottom: 16px; border-bottom: 1px solid var(--border); padding-bottom: 12px; display: flex; justify-content: space-between;">
                <span>Filters</span>
                <button id="clear-filters-btn" style="background: transparent; border: none; font-size: 0.75rem; color: var(--primary-light); cursor: pointer; text-decoration: underline;">Clear All</button>
              </div>

              <!-- Filter FormGroup Template -->
              <style>
                .filter-group { margin-bottom: 16px; }
                .filter-label { font-size: 0.70rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; display: block; letter-spacing: 0.5px; }
                .filter-input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; outline: none; }
                .filter-input:focus { border-color: var(--primary); }
              </style>

              <!-- Session filter (hidden - kept for future use) -->
              <div class="filter-group" style="display: none;">
                <label class="filter-label">Session</label>
                <div class="custom-dropdown-container" id="container-filter-session">
                  <input type="text" class="filter-input custom-dropdown-input" id="filter-session" placeholder="All Sessions" autocomplete="off" data-value="">
                  <div class="custom-dropdown-list" id="list-filter-session"></div>
                </div>
              </div>

              <!-- SME filter (hidden - kept for future use) -->
              <div class="filter-group" style="display: none;">
                <label class="filter-label">SME</label>
                <div class="custom-dropdown-container" id="container-filter-sme">
                  <input type="text" class="filter-input custom-dropdown-input" id="filter-sme" placeholder="All SMEs" autocomplete="off" data-value="">
                  <div class="custom-dropdown-list" id="list-filter-sme"></div>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Question Type</label>
                <div class="custom-dropdown-container" id="container-filter-type">
                  <input type="text" class="filter-input custom-dropdown-input readonly-mode" id="filter-type" placeholder="All Types" autocomplete="off" data-value="" readonly>
                  <div class="custom-dropdown-list" id="list-filter-type"></div>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Subject Category</label>
                <div class="custom-dropdown-container" id="container-filter-category">
                  <input type="text" class="filter-input custom-dropdown-input readonly-mode" id="filter-category" placeholder="All Categories" autocomplete="off" data-value="" readonly>
                  <div class="custom-dropdown-list" id="list-filter-category"></div>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Topic / Keyword</label>
                <input type="text" class="filter-input" id="filter-topic" placeholder="Search topics...">
              </div>

              <div class="filter-group">
                <label class="filter-label">Difficulty</label>
                <div class="custom-dropdown-container" id="container-filter-difficulty">
                  <input type="text" class="filter-input custom-dropdown-input readonly-mode" id="filter-difficulty" placeholder="All Difficulties" autocomplete="off" data-value="" readonly>
                  <div class="custom-dropdown-list" id="list-filter-difficulty"></div>
                </div>
              </div>

              <div class="filter-group">
                <label class="filter-label">Date Range</label>
                <input type="date" class="filter-input" id="filter-date-start" style="margin-bottom: 8px; color: var(--text-secondary);" title="Start Date">
                <input type="date" class="filter-input" id="filter-date-end" style="color: var(--text-secondary);" title="End Date">
              </div>

            </div>

            <!-- Content Area -->
            <div class="card card-glass questions-list-card" style="flex: 1; padding: 0;">
              <div id="questions-table-container">
                  <div style="padding: 40px; text-align: center;">
                      <span class="spinner"></span>
                      <p style="margin-top: 15px; opacity: 0.7;">Fetching and grouping questions...</p>
                  </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div id="tab-settings" class="admin-tab">
           <header class="admin-header">
            <h2 class="admin-title">SME & API Configurations</h2>
            <p style="color: var(--text-secondary); font-size: 0.9rem; margin-top: 5px;">Manage multiple SME profiles and their associated API keys</p>
          </header>
          
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; align-items: start; margin-top: 20px;">
            <!-- Register SME Card -->
            <div class="card card-glass">
              <h3 style="display: flex; align-items: center; gap: 8px; font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 20px;">
                📝 Register SME Profile
              </h3>
              
              <div class="form-group" style="margin-bottom: 20px;">
                <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">SME Full Name</label>
                <input type="text" class="form-input" id="sme-name-input" placeholder="e.g. John Doe ...">
              </div>

              <div class="form-group" style="margin-bottom: 20px;">
                <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Groq API Key</label>
                <input type="password" class="form-input" id="sme-key-input" placeholder="gsk_...">
              </div>

              <div class="form-group" style="margin-bottom: 25px;">
                <label class="form-label" style="font-size: 0.75rem; text-transform: uppercase; letter-spacing: 0.5px;">Preferred AI Model</label>
                <select class="form-select" id="sme-model-input" style="width: 100%;">
                  <option value="llama-3.3-70b-versatile">Llama 3.3 70B (SOTA / Versatile)</option>
                  <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast / Lightweight)</option>
                  <option value="mixtral-8x7b-32768" selected>Mixtral 8x7B (Deep Context)</option>
                </select>
              </div>

              <button class="btn btn-primary" id="add-sme-btn" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px;">
                ✨ Add SME Profile
              </button>
            </div>

            <!-- Managed SME Profiles Card -->
            <div class="card card-glass" style="min-height: 380px;">
              <h3 style="display: flex; align-items: center; gap: 8px; font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 20px;">
                🕵️ Managed SME Profiles
              </h3>
              
              <div id="sme-list-container" style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 5px;">
                <div style="text-align: center; opacity: 0.5; padding: 40px 0; font-size: 0.9rem;">
                  <span class="spinner-sm" style="border-width: 2px;"></span> Loading profiles...
                </div>
              </div>
            </div>
          </div>

          <!-- Privacy Notice Box -->
          <div style="margin-top: 24px; padding: 18px 24px; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); display: flex; gap: 16px; align-items: flex-start;">
            <div style="font-size: 1.5rem; line-height: 1;">🔑</div>
            <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">
              <strong style="color: var(--text);">Data Privacy & Security:</strong> All API keys are stored in your private MongoDB instance. When generating questions, the selected SME's key is used to authenticate requests. Each generated question is automatically <strong>watermarked</strong> with the SME's name and a <strong>timestamp</strong>.
            </p>
          </div>
        </div>
      </main>
    </div>
  `;
}

// =============================================
// MCQ PAGE
// =============================================
function renderMCQPage() {
  return `
    <div class="exam-header">
      <div class="exam-header-left">
        <div class="exam-logo-sm">🧠</div>
        <div>
          <div class="exam-title-sm">AI Mock Test</div>
          <div class="exam-subtitle-sm" id="mcq-difficulty-label">Medium · MCQ</div>
        </div>
      </div>
      <div class="exam-header-right" style="display: flex; align-items: center; gap: 15px;">
        <div class="timer-display" id="mcq-timer">
          <span class="timer-icon">⏱️</span>
          <span id="mcq-timer-text">20:00</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="mcq-exit-btn" style="border-color: rgba(239, 68, 68, 0.3); color: var(--danger-light); background: rgba(239, 68, 68, 0.05);">
          Exit Test
        </button>
      </div>
    </div>

    <div class="exam-body">
      <div class="exam-content">
        <!-- Progress -->
        <div class="question-progress">
          <div class="question-counter">
            Question <strong id="mcq-current-num">1</strong> of <strong id="mcq-total-num">10</strong>
          </div>
          <div style="flex:1; max-width:200px;">
            <div class="progress-bar-wrap">
              <div class="progress-bar-fill" id="mcq-progress-bar" style="width:10%"></div>
            </div>
          </div>
        </div>

        <!-- Question Card -->
        <div class="card question-card" id="mcq-question-card">
          <div class="question-number-badge">
            <span>❓</span>
            <span id="mcq-q-badge">Question 1</span>
          </div>
          <p class="question-text" id="mcq-question-text">Loading question...</p>
        </div>

        <!-- Options -->
        <div class="options-grid" id="mcq-options-grid">
          <!-- Options rendered dynamically -->
        </div>

        <!-- Question Dots -->
        <div class="question-dots" id="mcq-dots"></div>

        <!-- Navigation -->
        <div class="exam-nav">
          <button class="btn btn-secondary" id="mcq-prev-btn" disabled>
            ← Previous
          </button>
          <button class="btn btn-primary" id="mcq-next-btn">
            Next →
          </button>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// CODING PAGE
// =============================================
function renderCodingPage() {
  return `
    <div class="exam-header" style="height: 55px; border-bottom: 1px solid var(--border); padding: 0 20px;">
      <div class="exam-header-left">
      </div>
      <div class="exam-header-right" style="display: flex; align-items: center; gap: 15px;">
        <div class="timer-display" id="coding-timer" style="background: transparent; border: none; padding: 0;">
          <span id="coding-timer-text" style="font-family: var(--font-mono); color: var(--text-muted); font-size: 0.9rem;">45:00</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="coding-exit-btn" style="padding: 4px 12px; font-size: 0.75rem;">Exit</button>
      </div>
    </div>

    <div class="coding-body">
      <!-- Problem Panel -->
      <div class="problem-panel" id="problem-panel" style="padding: 32px; background: transparent; border-right: 1px solid var(--border);">
        <h2 class="problem-title" id="problem-title" style="font-size: 1.8rem; font-weight: 700; color: #fff; margin-bottom: 12px;">Loading...</h2>
        <div id="problem-meta" style="margin-bottom: 24px;"></div>
        
        <div class="problem-description" id="problem-description" style="margin-bottom: 30px; line-height: 1.7;">
          Loading...
        </div>

        <div id="problem-examples">
          <!-- Examples rendered dynamically -->
        </div>

        <div id="problem-constraints" style="margin-top: 40px;">
          <!-- Constraints rendered dynamically -->
        </div>

        <!-- Extra features hidden for absolute clarity unless needed -->
        <div id="extra-panels" style="display: none;">
          <div id="project-structure-panel"></div>
          <div id="coding-hints-container"></div>
          <div id="visible-test-grid"></div>
        </div>
      </div>

      <!-- Editor Panel -->
      <div class="editor-panel" style="background: #0f172a; border-left: 1px solid var(--border);">
        <div class="editor-toolbar" style="background: rgba(0,0,0,0.2); border-bottom: 1px solid var(--border); padding: 8px 16px; height: 45px;">
          <div class="editor-toolbar-left" style="gap: 5px;">
            <select class="lang-select" id="lang-select" style="background: transparent; border: none; font-size: 0.8rem; padding-right: 20px;">
              <option value="python">Python3</option>
              <option value="java">Java</option>
              <option value="cpp">C++</option>
              <option value="sql">SQL</option>
              <option value="c">C</option>
            </select>
            <span style="color: var(--text-muted); font-size: 0.75rem; margin-left: 10px;">• Auto</span>
          </div>
          <div class="editor-toolbar-right" style="gap: 12px;">
            <button class="btn btn-secondary btn-sm" id="run-code-btn" style="background: transparent; border: none; color: var(--success-light); font-weight: 600; font-size: 0.8rem;">
              Run
            </button>
            <button class="btn btn-success btn-sm" id="submit-code-btn" style="padding: 4px 16px; font-size: 0.8rem; border-radius: 6px;">
              Submit
            </button>
          </div>
        </div>

        <div id="file-tabs-container" style="display: none; background: rgba(0,0,0,0.1); border-bottom: 1px solid var(--border); overflow-x: auto; white-space: nowrap; height: 35px;">
          <!-- Tabs rendered dynamically -->
        </div>

        <div class="editor-wrapper">
          <textarea class="code-editor" id="code-editor" spellcheck="false" autocomplete="off" autocorrect="off" autocapitalize="off"></textarea>
        </div>

        <div class="output-panel">
          <div class="output-header">
            <span>⚡</span> Output
          </div>
          <div class="output-content" id="output-content">Run your code to see output here...</div>
        </div>
      </div>
    </div>
  `;
}

// =============================================
// RESULT PAGE
// =============================================
function renderResultPage() {
  return `
    <div class="result-container">
      <div class="result-hero">
        <div class="result-emoji" id="result-emoji">🎉</div>
        <h1 class="result-title" id="result-title">Test Complete!</h1>
        <p class="result-message" id="result-message">Here's how you performed on your mock test.</p>
      </div>

      <div class="card card-glass result-score-card">
        <div class="score-ring-wrap">
          <svg class="score-ring" viewBox="0 0 160 160">
            <circle class="score-ring-bg" cx="80" cy="80" r="70"/>
            <circle class="score-ring-fill" id="score-ring-fill" cx="80" cy="80" r="70"/>
          </svg>
          <div class="score-ring-text">
            <div class="score-percent" id="score-percent">0%</div>
            <div class="score-label">Score</div>
          </div>
        </div>

        <div class="result-stats">
          <div class="stat-card">
            <div class="stat-value correct" id="stat-correct">0</div>
            <div class="stat-name">Correct</div>
          </div>
          <div class="stat-card">
            <div class="stat-value wrong" id="stat-wrong">0</div>
            <div class="stat-name">Wrong</div>
          </div>
          <div class="stat-card">
            <div class="stat-value total" id="stat-total">0</div>
            <div class="stat-name">Total</div>
          </div>
        </div>
      </div>

      <div class="performance-banner" id="performance-banner">
        <span class="perf-icon" id="perf-icon">🏆</span>
        <div>
          <div style="font-weight:700; font-size:1.05rem;" id="perf-title">Excellent!</div>
          <div style="font-size:0.88rem; opacity:0.8; margin-top:2px;" id="perf-desc">Outstanding performance! Keep it up.</div>
        </div>
      </div>

      <div class="hints-container" id="ai-hints-panel">
        <div class="hints-title">💡 AI Insights & Hints</div>
        <div id="ai-hints-content" style="font-size: 0.92rem; line-height: 1.6; opacity: 0.9;"></div>
      </div>

      <div class="result-actions">
        <button class="btn btn-primary btn-lg" id="go-home-btn">
          🏠 Back to Home
        </button>
        <button class="btn btn-secondary btn-lg" id="retry-btn">
          🔄 Retry Test
        </button>
      </div>
    </div>
  `;
}

// =============================================
// NAVIGATION
// =============================================
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  const page = document.getElementById(pageId);
  if (page) page.classList.add('active');
}

// =============================================
// HOME PAGE LISTENERS
// =============================================
function attachHomeListeners() {
  const landingView = document.getElementById('landing-view');
  const selectionView = document.getElementById('selection-view');

  // Landing actions
  document.getElementById('goto-practice-btn').addEventListener('click', () => {
    landingView.style.display = 'none';
    selectionView.style.display = 'flex';
  });

  // Auth view toggle
  const authView = document.getElementById('auth-view');

  document.getElementById('goto-login-btn').addEventListener('click', () => {
    landingView.style.display = 'none';
    authView.style.display = 'flex';
  });

  document.getElementById('auth-back-btn').addEventListener('click', () => {
    authView.style.display = 'none';
    landingView.style.display = 'flex';
    // Reset forms
    const msgEl = document.getElementById('auth-message');
    if (msgEl) msgEl.style.display = 'none';
  });

  // Auth mode toggle (Login ↔ Signup)
  const authModeSegments = document.querySelectorAll('#auth-mode-toggle .type-segment');
  authModeSegments.forEach(seg => {
    seg.addEventListener('click', () => {
      authModeSegments.forEach(s => s.classList.remove('active'));
      seg.classList.add('active');
      const mode = seg.dataset.value;
      document.getElementById('auth-login-form').style.display = mode === 'login' ? 'block' : 'none';
      document.getElementById('auth-signup-form').style.display = mode === 'signup' ? 'block' : 'none';
      document.getElementById('auth-view-title').textContent = mode === 'login' ? 'Admin Login' : 'Create Account';
      const msgEl = document.getElementById('auth-message');
      if (msgEl) msgEl.style.display = 'none';
    });
  });

  // Auth message helper
  function showAuthMessage(type, msg) {
    const el = document.getElementById('auth-message');
    if (!el) return;
    el.style.display = 'block';
    el.style.background = type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    el.style.border = `1px solid ${type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`;
    el.style.color = type === 'error' ? '#fca5a5' : '#6ee7b7';
    el.innerHTML = `${type === 'error' ? '❌' : '✅'} ${msg}`;
  }

  // Login handler
  document.getElementById('login-submit-btn').addEventListener('click', async () => {
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;
    if (!email || !password) return showAuthMessage('error', 'Please fill in all fields');

    const btn = document.getElementById('login-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-sm"></span> Logging in...';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed');

      showToast('success', `Welcome back, ${data.user.email}!`);
      enterAdminPanel();
    } catch (err) {
      showAuthMessage('error', err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '🔓 Login';
    }
  });

  // Signup handler
  document.getElementById('signup-submit-btn').addEventListener('click', async () => {
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const confirm = document.getElementById('signup-confirm').value;

    if (!email || !password || !confirm) return showAuthMessage('error', 'Please fill in all fields');
    if (password.length < 6) return showAuthMessage('error', 'Password must be at least 6 characters');
    if (password !== confirm) return showAuthMessage('error', 'Passwords do not match');

    const btn = document.getElementById('signup-submit-btn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-sm"></span> Creating account...';

    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Signup failed');

      showAuthMessage('success', 'Account created successfully! Please sign in with your credentials.');
      // Switch back to login tab after success
      setTimeout(() => {
        const loginTab = Array.from(document.querySelectorAll('#auth-mode-toggle .type-segment'))
          .find(el => el.dataset.value === 'login');
        if (loginTab) loginTab.click();

        // Pre-fill the login email for convenience
        const loginEmail = document.getElementById('login-email');
        if (loginEmail) loginEmail.value = email;

        // Focus password field on the login form
        const loginPass = document.getElementById('login-password');
        if (loginPass) loginPass.focus();
      }, 2000);
    } catch (err) {
      showAuthMessage('error', err.message);
    } finally {
      btn.disabled = false;
      btn.innerHTML = '✨ Create Account';
    }
  });

  // Enter key support for login/signup forms
  document.getElementById('login-password').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('login-submit-btn').click();
  });
  document.getElementById('signup-confirm').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') document.getElementById('signup-submit-btn').click();
  });

  // Legacy admin button (hidden but keep listener to avoid errors)
  document.getElementById('goto-admin-landing-btn').addEventListener('click', () => {
    showPage('admin-page');
  });

  document.getElementById('back-to-landing-btn').addEventListener('click', () => {
    selectionView.style.display = 'none';
    landingView.style.display = 'flex';
  });

  // Difficulty buttons
  document.querySelectorAll('.diff-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      state.difficulty = btn.dataset.level;
    });
  });

  // Test type toggle
  const homeTypeSegments = document.querySelectorAll('#home-test-type-toggle .type-segment');
  homeTypeSegments.forEach(seg => {
    seg.addEventListener('click', () => {
      homeTypeSegments.forEach(s => s.classList.remove('active'));
      seg.classList.add('active');
      state.testType = seg.dataset.value;
    });
  });

  // Category & Subtopic logic
  const homeCatSelect = document.getElementById('test-category-select');
  const homeSubSelect = document.getElementById('test-subtopic-select');

  if (homeCatSelect && homeSubSelect) {
    const subtopicsPool = {
      languages: ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'SQL'],
      subjects: ['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
      stacks: ['MERN Stack', 'MEAN Stack', 'LAMP Stack', 'JAMstack', 'Serverless', 'Microservices'],
      frameworks: ['React.js', 'Angular', 'Vue.js', 'Spring Boot', 'Django', 'FastAPI', 'Flutter', 'React Native', 'Laravel']
    };

    const updateHomeSubtopics = () => {
      const cat = homeCatSelect.value;
      const options = subtopicsPool[cat] || [];
      homeSubSelect.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
      state.category = cat;
      state.subtopic = homeSubSelect.value;
    };

    homeCatSelect.addEventListener('change', updateHomeSubtopics);
    homeSubSelect.addEventListener('change', () => {
      state.subtopic = homeSubSelect.value;
    });

    updateHomeSubtopics(); // Initialize
  }

  // Start test
  document.getElementById('start-test-btn').addEventListener('click', async () => {
    if (!state.groqKey) {
      showToast('error', 'Please configure your Groq API Key in Admin Settings first!');
      showPage('admin-page');
      // Trigger click on settings tab
      const settingsTab = document.querySelector('[data-tab="settings"]');
      if (settingsTab) settingsTab.click();
      return;
    }
    await startTest();
  });
}

// =============================================
// ADMIN LISTENERS
// =============================================
// =============================================
// ENTER ADMIN PANEL (reset to Generator tab)
// =============================================
function enterAdminPanel() {
  showPage('admin-page');
  // Reset to Generator tab for every login
  document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
  document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
  const genNavItem = document.querySelector('[data-tab="generator"]');
  const genTab = document.getElementById('tab-generator');
  if (genNavItem) genNavItem.classList.add('active');
  if (genTab) genTab.classList.add('active');
  // Clear login form fields
  const loginEmail = document.getElementById('login-email');
  const loginPass = document.getElementById('login-password');
  if (loginEmail) loginEmail.value = '';
  if (loginPass) loginPass.value = '';
  const authMsg = document.getElementById('auth-message');
  if (authMsg) authMsg.style.display = 'none';
}

// =============================================
// LOGOUT WITH CONFIRMATION
// =============================================
function showLogoutConfirmation() {
  const overlay = document.getElementById('confirm-modal-overlay');
  if (!overlay) return;
  overlay.classList.add('active');

  const confirmBtn = document.getElementById('confirm-modal-confirm');
  const cancelBtn = document.getElementById('confirm-modal-cancel');

  const cleanup = () => { overlay.classList.remove('active'); };

  // Remove old listeners by cloning
  const newConfirm = confirmBtn.cloneNode(true);
  const newCancel = cancelBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
  cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

  newCancel.addEventListener('click', cleanup);
  newConfirm.addEventListener('click', () => {
    cleanup();
    showPage('home-page');
    // Reset auth view to login mode
    const authView = document.getElementById('auth-view');
    const landingView = document.getElementById('landing-view');
    if (authView) authView.style.display = 'none';
    if (landingView) landingView.style.display = 'flex';
    showToast('info', 'You have been logged out successfully');
  });

  // Close on overlay click (outside card)
  overlay.onclick = (e) => { if (e.target === overlay) cleanup(); };
}

function attachAdminListeners() {
  const backBtn = document.getElementById('admin-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showLogoutConfirmation();
    });
  }

  // Tab switching
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', () => {
      const tabId = item.dataset.tab;

      // Update sidebar
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      // Update content
      document.querySelectorAll('.admin-tab').forEach(tab => tab.classList.remove('active'));
      const activeTab = document.getElementById(`tab-${tabId}`);
      if (activeTab) {
        activeTab.classList.add('active');
        if (tabId === 'questions') {
          fetchAndRenderSavedQuestions();
        } else if (tabId === 'dashboard') {
          updateDashboardStats();
        }
      }
    });
  });

  // Initial stats load
  updateDashboardStats();

  // View All button → go to Manage Questions tab
  const viewAllBtn = document.getElementById('view-all-questions-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      const questionsNavItem = document.querySelector('.nav-item[data-tab="questions"]');
      if (questionsNavItem) questionsNavItem.click();
    });
  }

  const refreshBtn = document.getElementById('refresh-questions-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', fetchAndRenderSavedQuestions);
  }

  // Generate button
  const genBtn = document.getElementById('generate-questions-btn');
  if (genBtn) {
    genBtn.addEventListener('click', handleGenerateClick);
  }

  // Save button
  const saveBtn = document.getElementById('save-generated-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      if (state.lastGenerated) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `<span class="spinner-sm"></span> Saving...`;

        try {
          const response = await fetch('/api/questions/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questions: state.lastGenerated.map(q => ({
                ...q,
                sessionId: state.activeSessionId || null,
                sessionName: state.activeSessionName || null
              })),
              type: state.lastGeneratedType
            })
          });

          if (!response.ok) {
            const errData = await response.json();
            throw new Error(errData.error || 'Failed to save to database');
          }

          const data = await response.json();
          showToast('success', data.message);
          saveBtn.innerHTML = `✅ Saved to Database`;
          saveBtn.classList.remove('btn-primary');
          saveBtn.classList.add('btn-success');

          // Force UI to sync immediately on next view
          state.lastQuestionsFetch = 0;
          state.savedQuestions = [];

          updateDashboardStats();
        } catch (error) {
          console.error(error);
          showToast('error', 'Database Save Failed: ' + error.message);
          saveBtn.disabled = false;
          saveBtn.innerHTML = `💾 Save to Database`;
          saveBtn.classList.remove('btn-success');
          saveBtn.classList.add('btn-primary');
        }
      }
    });
  }

  // Session Controller Handlers
  const startSessionBtn = document.getElementById('start-session-btn');
  const endSessionBtn = document.getElementById('end-session-btn');
  const sessionNameInput = document.getElementById('session-name-input');
  const sessionInactiveView = document.getElementById('session-inactive-view');
  const sessionActiveView = document.getElementById('session-active-view');
  const activeSessionNameDisplay = document.getElementById('active-session-name-display');
  const activeSessionIdDisplay = document.getElementById('active-session-id-display');
  const statusBadge = document.getElementById('session-status-badge');

  if (startSessionBtn) {
    startSessionBtn.addEventListener('click', () => {
      const name = sessionNameInput.value.trim();
      if (!name) {
        showToast('error', 'Please enter a Session Name');
        return;
      }
      state.activeSessionId = 'SESSION_' + crypto.randomUUID().split('-')[0].toUpperCase();
      state.activeSessionName = name;
      state.sessionPendingQuestions = []; // Reset pending questions for new session

      sessionInactiveView.style.display = 'none';
      sessionActiveView.style.display = 'block';
      activeSessionNameDisplay.textContent = name;
      activeSessionIdDisplay.textContent = `ID: ${state.activeSessionId}`;

      statusBadge.textContent = 'Active';
      statusBadge.className = 'badge badge-success';
      showToast('success', `Started new session: ${name}`);

      // Re-render preview to toggle the Save button to Auto-Save badge
      renderGeneratedPreview(state.lastGenerated || [], state.lastGeneratedType || 'mcq');
    });
  }

  if (endSessionBtn) {
    endSessionBtn.addEventListener('click', async () => {
      if (confirm('End this generation session? This will auto-save all generated questions.')) {

        // Auto-Save Accumulated Questions if any exist
        if (state.sessionPendingQuestions && state.sessionPendingQuestions.length > 0) {
          endSessionBtn.disabled = true;
          endSessionBtn.innerHTML = `<span class="spinner-sm"></span> Saving...`;

          try {
            const response = await fetch('/api/questions/bulk', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                questions: state.sessionPendingQuestions,
                type: null // Let the backend fallback infer the type
              })
            });

            if (!response.ok) {
              const errData = await response.json();
              throw new Error(errData.error || 'Failed to save session data');
            }

            const data = await response.json();
            showToast('success', `Session Ended: Auto-saved ${state.sessionPendingQuestions.length} questions.`);

            // Invalidate cache for Manage Questions
            state.lastQuestionsFetch = 0;
            state.savedQuestions = [];
            updateDashboardStats();

          } catch (error) {
            console.error(error);
            showToast('error', 'Session Auto-Save Failed: ' + error.message);
          } finally {
            endSessionBtn.disabled = false;
            endSessionBtn.innerHTML = `⏹ End Session`;
          }
        } else {
          showToast('info', 'Session ended. No questions were generated.');
        }

        // Reset session state
        state.activeSessionId = null;
        state.activeSessionName = null;
        state.sessionPendingQuestions = [];
        sessionNameInput.value = '';

        sessionInactiveView.style.display = 'block';
        sessionActiveView.style.display = 'none';

        statusBadge.textContent = 'Inactive';
        statusBadge.className = 'badge badge-secondary';

        // Clear the preview and re-render to show empty state
        state.lastGenerated = [];
        state.lastGeneratedType = 'mcq';
        renderGeneratedPreview([], 'mcq');
      }
    });
  }

  // Category change listener
  const catSelect = document.getElementById('gen-category');
  const subSelect = document.getElementById('gen-subtopic');

  if (catSelect && subSelect) {
    const subtopics = {
      languages: ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'SQL'],
      subjects: ['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
      stacks: ['MERN Stack', 'MEAN Stack', 'LAMP Stack', 'JAMstack', 'Serverless', 'Microservices'],
      frameworks: ['React.js', 'Angular', 'Vue.js', 'Spring Boot', 'Django', 'FastAPI', 'Flutter', 'React Native', 'Laravel']
    };

    const updateSubtopics = () => {
      const cat = catSelect.value;
      const options = subtopics[cat] || [];
      subSelect.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
      renderGeneratedPreview([], 'mcq'); // Clear preview on change
    };

    catSelect.addEventListener('change', updateSubtopics);
    subSelect.addEventListener('change', () => renderGeneratedPreview([], 'mcq'));

    // Also clear on other input changes
    const inputsToWatch = ['gen-topic', 'gen-difficulty', 'gen-count', 'gen-sme'];
    inputsToWatch.forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', () => renderGeneratedPreview([], 'mcq'));
    });

    updateSubtopics(); // Init
  }

  // Type toggle listeners
  const typeSegments = document.querySelectorAll('.type-segment');
  if (typeSegments.length > 0) {
    typeSegments.forEach(seg => {
      seg.addEventListener('click', () => {
        typeSegments.forEach(s => s.classList.remove('active'));
        seg.classList.add('active');
        renderGeneratedPreview([], 'mcq'); // Clear preview on change
      });
    });
  }

  // =============================================
  // SME PROFILE MANAGEMENT
  // =============================================
  state.smes = [];
  state.activeSme = null;

  const loadSMEs = async () => {
    try {
      const response = await fetch('/api/smes');
      if (!response.ok) throw new Error();
      state.smes = await response.json();

      // If there are SMEs but no active one selected, or active one was deleted
      if (state.smes.length > 0 && (!state.activeSme || !state.smes.find(s => s._id === state.activeSme._id))) {
        // Auto-select the first one if possible
        state.activeSme = state.smes[0];
      } else if (state.smes.length === 0) {
        state.activeSme = null;
      }

      renderSMEs();
      updateGeneratorWatermark();
    } catch (err) {
      console.error('Failed to load SMEs', err);
      document.getElementById('sme-list-container').innerHTML = `
        <div style="text-align: center; opacity: 0.5; padding: 40px 0; font-size: 0.9rem; color: var(--danger-light);">
          Failed to load SME Profiles. Ensure backend is running.
        </div>
      `;
    }
  };

  const renderSMEs = () => {
    const container = document.getElementById('sme-list-container');
    if (!container) return;

    if (state.smes.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; opacity: 0.5; padding: 40px 0; font-size: 0.9rem;">
          No SME profiles found. Add one to get started!
        </div>
      `;
      return;
    }

    container.innerHTML = state.smes.map(sme => {
      const isActive = state.activeSme && state.activeSme._id === sme._id;
      return `
        <div class="sme-profile-card" data-id="${sme._id}" style="display: flex; justify-content: space-between; align-items: center; padding: 12px 16px; background: rgba(255,255,255,0.02); border: 1px solid ${isActive ? 'var(--primary)' : 'rgba(255,255,255,0.05)'}; border-radius: 8px; cursor: pointer; transition: 0.2s; box-shadow: ${isActive ? '0 0 0 1px var(--primary)' : 'none'};">
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="width: 32px; height: 32px; border-radius: 50%; background: var(--primary); display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 0.8rem;">
              ${sme.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div style="font-weight: 600; font-size: 0.9rem; color: ${isActive ? 'var(--primary-light)' : 'inherit'}; display: flex; align-items: center; gap: 8px;">
                <input type="text" class="sme-inline-name-input" data-id="${sme._id}" value="${sme.name}" readonly style="background: transparent; border: 1px solid transparent; border-radius: 4px; color: inherit; font-family: inherit; font-weight: inherit; font-size: inherit; outline: none; cursor: pointer; padding: 2px 4px; width: 140px; transition: 0.2s; margin-left: -4px;" title="Click to edit name" />
                ${isActive ? '<span class="badge badge-success" style="font-size: 0.6rem; padding: 2px 6px;">Active</span>' : ''}
              </div>
              <div style="font-size: 0.75rem; opacity: 0.8; display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                <select class="sme-inline-model-select" data-id="${sme._id}" style="background: var(--bg-card); border: 1px solid var(--border); color: var(--text); border-radius: 4px; padding: 2px 4px; font-size: 0.7rem; cursor: pointer; outline: none;">
                  <option value="llama-3.3-70b-versatile" ${sme.model === 'llama-3.3-70b-versatile' ? 'selected' : ''}>Llama 3.3 70B</option>
                  <option value="llama-3.1-8b-instant" ${sme.model === 'llama-3.1-8b-instant' ? 'selected' : ''}>Llama 3.1 8B</option>
                  <option value="mixtral-8x7b-32768" ${sme.model === 'mixtral-8x7b-32768' ? 'selected' : ''}>Mixtral 8x7B</option>
                </select>
                <span style="opacity: 0.6;">•</span>
                <input type="password" class="sme-inline-key-input" data-id="${sme._id}" value="${sme.apiKey}" readonly style="background: transparent; border: 1px solid transparent; border-radius: 4px; color: var(--text-secondary); width: 85px; font-size: 0.7rem; outline: none; padding: 2px 4px; cursor: pointer; transition: 0.2s;" title="Click to edit API Key" />
              </div>
            </div>
          </div>
          <button class="btn btn-sm delete-sme-btn" data-id="${sme._id}" style="background: transparent; color: var(--text-secondary); padding: 4px; opacity: 0.6; cursor: pointer; transition: 0.2s; font-size: 1rem; border: none;" onmouseover="this.style.opacity='1'; this.style.color='var(--danger-light)'" onmouseout="this.style.opacity='0.6'; this.style.color='var(--text-secondary)'">
            🗑️
          </button>
        </div>
      `;
    }).join('');

    // Attach Selection Listeners
    container.querySelectorAll('.sme-profile-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.delete-sme-btn') || e.target.closest('.sme-inline-model-select') || e.target.closest('input')) return; // Ignore if interacting with editable areas
        const id = card.dataset.id;
        state.activeSme = state.smes.find(s => s._id === id);
        renderSMEs(); // Re-render to update active styling
        updateGeneratorWatermark(); // Update watermark
      });
    });

    // Attach Inline Model Update Listeners
    container.querySelectorAll('.sme-inline-model-select').forEach(select => {
      select.addEventListener('change', async (e) => {
        e.stopPropagation();
        const id = select.dataset.id;
        const newModel = select.value;

        // Optimistically update state
        const sme = state.smes.find(s => s._id === id);
        if (sme) sme.model = newModel;
        if (state.activeSme && state.activeSme._id === id) {
          state.activeSme.model = newModel;
          updateGeneratorWatermark();
        }

        try {
          const res = await fetch(`/api/smes/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ model: newModel })
          });
          if (!res.ok) throw new Error();
          showToast('success', 'Model preference updated!');
        } catch (err) {
          console.error(err);
          showToast('error', 'Failed to update model.');
          loadSMEs(); // Revert on fail
        }
      });
    });

    // Setup Inline Editable Inputs (Name & API Key)
    const setupInlineEdit = (selector, fieldName, isPassword) => {
      container.querySelectorAll(selector).forEach(input => {
        input.addEventListener('click', (e) => {
          e.stopPropagation();
          input.removeAttribute('readonly');
          if (isPassword) input.type = 'text';
          input.style.border = '1px solid var(--primary)';
          input.style.background = 'rgba(0,0,0,0.3)';
          input.focus();
        });

        const saveEdit = async () => {
          input.setAttribute('readonly', 'true');
          if (isPassword) input.type = 'password';
          input.style.border = '1px solid transparent';
          input.style.background = 'transparent';

          const id = input.dataset.id;
          const newValue = input.value.trim();
          const sme = state.smes.find(s => s._id === id);

          if (!newValue || sme[fieldName] === newValue) {
            input.value = sme[fieldName]; // Revert if empty or unchanged
            return;
          }

          // Optimistic update
          sme[fieldName] = newValue;
          if (state.activeSme && state.activeSme._id === id) {
            state.activeSme[fieldName] = newValue;
            updateGeneratorWatermark();
          }

          try {
            const res = await fetch(`/api/smes/${id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ [fieldName]: newValue })
            });
            if (!res.ok) throw new Error();
            showToast('success', `${fieldName === 'apiKey' ? 'API Key' : 'Name'} updated!`);
          } catch (err) {
            console.error(err);
            showToast('error', 'Update failed.');
            loadSMEs();
          }
        };

        input.addEventListener('blur', saveEdit);
        input.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            input.blur();
          }
        });
      });
    };

    setupInlineEdit('.sme-inline-key-input', 'apiKey', true);
    setupInlineEdit('.sme-inline-name-input', 'name', false);

    // Attach Deletion Listeners
    container.querySelectorAll('.delete-sme-btn').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        e.stopPropagation();
        const id = btn.dataset.id;

        if (confirm('Are you sure you want to delete this SME Profile?')) {
          btn.style.opacity = '0.5';
          try {
            const res = await fetch(`/api/smes/${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error();
            showToast('success', 'SME Profile deleted.');
            loadSMEs(); // Reload list
          } catch (err) {
            console.error(err);
            showToast('error', 'Failed to delete SME Profile.');
            btn.style.opacity = '1';
          }
        }
      });
    });
  };

  // Add SME Listener
  const addSmeBtn = document.getElementById('add-sme-btn');
  if (addSmeBtn) {
    addSmeBtn.addEventListener('click', async () => {
      const name = document.getElementById('sme-name-input').value.trim();
      const apiKey = document.getElementById('sme-key-input').value.trim();
      const model = document.getElementById('sme-model-input').value;

      if (!name || !apiKey) {
        showToast('warning', 'Name and API Key are required.');
        return;
      }

      addSmeBtn.disabled = true;
      addSmeBtn.innerHTML = '<span class="spinner-sm"></span> Adding...';

      try {
        const response = await fetch('/api/smes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, apiKey, model })
        });

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.error || 'Failed to add SME');
        }

        showToast('success', 'SME Profile Registered & Saved to System!');

        // Clear inputs
        document.getElementById('sme-name-input').value = '';
        document.getElementById('sme-key-input').value = '';

        await loadSMEs(); // Re-fetch list
      } catch (err) {
        console.error(err);
        showToast('error', err.message);
      } finally {
        addSmeBtn.disabled = false;
        addSmeBtn.innerHTML = '✨ Add SME Profile';
      }
    });
  }

  // Load SMEs initially when listeners attach
  loadSMEs();

  // Make loadSMEs available globally for switching tabs if needed
  window.loadSMEs = loadSMEs;
}

function updateGeneratorWatermark() {
  const display = document.getElementById('active-sme-watermark-display');
  const hint = document.getElementById('active-sme-watermark-hint');

  if (!display || !hint) return;

  if (state.activeSme) {
    const modelNames = {
      'llama-3.3-70b-versatile': 'Llama 3.3 70B',
      'llama-3.1-8b-instant': 'Llama 3.1 8B',
      'mixtral-8x7b-32768': 'Mixtral 8x7B'
    };
    display.innerHTML = `🛡️ ${state.activeSme.name}`;
    display.style.color = 'var(--primary-light)';
    hint.innerHTML = `Using ${modelNames[state.activeSme.model] || state.activeSme.model}`;
  } else {
    display.innerHTML = `❌ No SME Selected`;
    display.style.color = 'var(--danger-light)';
    hint.innerHTML = `Select SME in Settings to apply watermark`;
  }
}

async function handleGenerateClick() {
  if (!state.activeSme) {
    showToast('error', 'No ACTIVE SME Selected! Please register and select one in Settings.');
    const settingsTab = document.querySelector('[data-tab="settings"]');
    if (settingsTab) settingsTab.click();
    return;
  }

  const category = document.getElementById('gen-category').value;
  const subtopic = document.getElementById('gen-subtopic').value;
  const specificTopic = document.getElementById('gen-topic').value.trim();
  const activeSegment = document.querySelector('#gen-type-toggle .type-segment.active');
  const type = activeSegment ? activeSegment.dataset.value : 'mcq';
  const difficulty = document.getElementById('gen-difficulty').value;
  const count = parseInt(document.getElementById('gen-count').value);
  // Use the active SME's name for the watermark
  const smeName = state.activeSme.name;

  const finalTopic = specificTopic ? `${subtopic} (${specificTopic})` : subtopic;

  const genBtn = document.getElementById('generate-questions-btn');
  const previewContent = document.getElementById('gen-preview-content');
  const saveBtn = document.getElementById('save-generated-btn');

  genBtn.disabled = true;
  genBtn.innerHTML = `<span class="spinner-sm"></span> AI is Thinking...`;
  previewContent.innerHTML = `
    <div class="empty-preview">
      <div class="spinner"></div>
      <p style="margin-top: 20px;">AI is crafting ${count} technical ${type.toUpperCase()} questions for ${finalTopic}...</p>
    </div>
  `;

  if (saveBtn) {
    saveBtn.disabled = true;
    saveBtn.innerHTML = `💾 Save to Database`;
    saveBtn.classList.remove('btn-success');
    saveBtn.classList.add('btn-primary');
  }

  try {
    const generated = await generateAIQuestions(finalTopic, type, difficulty, count, category, subtopic, smeName, state.activeSme.apiKey, state.activeSme.model);
    state.lastGenerated = generated;
    state.lastGeneratedType = type;

    // Auto-accumulate if session is active
    if (state.activeSessionId) {
      const questionsWithSession = generated.map(q => ({
        ...q,
        sessionId: state.activeSessionId,
        sessionName: state.activeSessionName
      }));
      state.sessionPendingQuestions = [...(state.sessionPendingQuestions || []), ...questionsWithSession];
      showToast('success', `AI generated ${count} questions and auto-added to session memory!`);
    } else {
      showToast('success', `AI generated ${count} questions successfully!`);
    }

    renderGeneratedPreview(generated, type);
  } catch (error) {
    console.error(error);
    showToast('error', 'AI Generation Failed: ' + error.message);
    previewContent.innerHTML = `
      <div class="empty-preview" style="color: var(--danger-light);">
        <span>❌</span>
        <p>Generation Failed. Please check your API key and connection.</p>
      </div>
    `;
  } finally {
    genBtn.disabled = false;
    genBtn.innerHTML = `✨ Generate Questions`;
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `💾 Save to Database`;
      saveBtn.classList.remove('btn-success');
      saveBtn.classList.add('btn-primary');
    }
  }
}

async function generateAIQuestions(topic, type, difficulty, count, category, subtopic, smeName, apiKey, model) {
  const isMcq = type === 'mcq';

  // Advanced Difficulty Calibration (Perfect Fine-Tune)
  const difficultyContext = {
    easy: 'Objective: Foundational mastery. Difficulty: O(1) or O(N). Focus on basic syntax, elementary control flow, and standard library usage. Avoid advanced design patterns or complex recursion.',
    medium: 'Objective: Engineering proficiency. Difficulty: O(N) or O(N log N). Focus on data structures (Trees, Linked Lists, HashMaps), intermediate algorithms, and modular design. Require handling of edge cases and performance tradeoffs.',
    hard: 'Objective: Architectural excellence. Difficulty: O(log N) or niche optimal solutions. Focus on advanced DP, Graph theory, concurrency, low-level optimizations, and complex system design. Must involve multiple interacting constraints.'
  }[difficulty] || 'General technical excellence';


  const isFramework = (category === 'stacks' || category === 'frameworks' || ['react', 'angular', 'vue', 'next', 'django', 'flask', 'spring', 'express', 'laravel', 'rails', 'stack', 'framework'].some(f => topic.toLowerCase().includes(f)));


  // Language Specific Boilerplate Provider
  const getBoilerplate = (lang) => {
    const l = lang.toLowerCase();
    if (l.includes('python')) return 'def solution(input_data):\n    # Write your logic here\n    pass';
    if (l.includes('java')) return 'public class Solution {\n    public static void main(String[] args) {\n        // Read from stdin and output result\n    }\n}';
    if (l.includes('cpp') || l.includes('c++')) return '#include <iostream>\nusing namespace std;\n\nint main() {\n    // Solution code\n    return 0;\n}';
    if (l.includes('sql')) return '-- Write your SQL query here\nSELECT * FROM table;';
    if (l.includes('javascript')) return 'function solution(input) {\n    // Implement logic\n    return null;\n}';
    if (l.includes('php')) return '<?php\n\nfunction solution($input) {\n    // Logic here\n}';
    return '// Starter code template\nfunction solution(input) {\n}';
  };

  const industries = [
    'FinTech (Banking, Trading)', 'HealthTech (Telemedicine, Records)', 'E-commerce (Marketplaces, B2B)',
    'Cybersecurity (Threat Detection)', 'GameDev (Multiplayer, Physics)', 'SaaS (ERP, CRM Systems)',
    'EdTech (LMS, Learning Analytics)', 'Logistics (Supply Chain, Fleet)', 'Robotics (Control, Computer Vision)',
    'Web3 (DeFi, DAOs)', 'AI/ML (Large Language Models, Gen AI)', 'GreenTech (Energy Monitoring)',
    'SpaceTech (Satellite Data)', 'AgriTech (Precision Farming)', 'GovTech (Public Services)',
    'SocialMedia (Content Feeds, Graph)', 'AdTech (Real-time Bidding)', 'AutoTech (Autonomous Driving)',
    'TravelTech (Booking Engines)', 'FoodTech (Delivery Logistics)'
  ];
  const perspectives = [
    'Performance-obsessed Tech Lead', 'Security-first Cloud Architect', 'Developer Experience (DX) Advocate',
    'Scalability Engineer', 'Budget-conscious Startup CTO', 'Legacy System Modernization Specialist',
    'Accessibility Expert (WCAG)', 'Machine Learning Engineer', 'SRE / DevOps Lead',
    'Open Source Maintainer', 'Data Integrity Specialist', 'Microservices Expert'
  ];
  const focuses = [
    'Edge Cases & Error Handling', 'Memory Efficiency & Footprint', 'Maintainability & Clean Code',
    'Security & Input Sanitization', 'High-throughput Scalability', 'Advanced Design Patterns',
    'Unit Testing Coverage & Quality', 'Cross-browser / Platform Compatibility', 'Network Latency & Optimization',
    'State Management Efficiency', 'Concurrency & Race Conditions', 'Schema / Typings Robustness'
  ];
  const taskTypes = [
    'Bug Fix / Debugging (Finding the Root Cause)', 'Feature Implementation From Scratch',
    'Performance Optimization / Refactoring (O-notation improvement)', 'Data Processing / Transformation Pipelines',
    'Security Hardening (Encryption, Auth)', 'Architecture Setup (Modular Design)',
    'API Integration (Third-party, Internal)', 'UI/UX Polish (Animations, Responsiveness)',
    'Database Schema Migration', 'Micro-interaction Implementation'
  ];

  // Refined Difficulty-specific constraints with Category Awareness
  const getDifficultyRule = (diff, cat) => {
    const base = {
      easy: "STRICT EASY: Focus on 101-level concepts. Avoid complex nesting or abstract theories. Scenarios should be single-variable and direct.",
      medium: "STRICT MEDIUM: Scenarios should involve professional tradeoffs, modular thinking, and handling of standard edge cases (missing data, large inputs).",
      hard: "STRICT HARD: Deep-dive into architectural bottlenecks, extreme edge cases, and high-concurrency or low-latency constraints. Require synthesizing multiple advanced patterns."
    }[diff] || "";

    if (cat === 'dsa') return `${base} MANDATORY: Explicitly mention Space/Time complexity requirements.`;
    if (cat === 'frameworks') return `${base} MANDATORY: Focus on the framework's internal lifecycle and performance patterns.`;
    return base;
  };

  const diffRule = getDifficultyRule(difficulty, category);


  // Category-specific logic refinement (Sync with UI values)
  const categoryRules = {
    'languages': "Focus on language-specific syntax, standard library features, memory management, and idiomatic patterns.",
    'subjects': "Focus on core computer science foundations like Operating Systems, DBMS, Computer Networks, or Software Engineering.",
    'stacks': "Focus on full-stack integration, environment configuration, database connectivity, and end-to-end data flow.",
    'frameworks': "Focus on framework-specific lifecycles, component design, state management, and production-level best practices."
  }[category] || "Focus on professional technical standards and real-world application.";


  const complexityModifiers = [

    "Include an additional constraint regarding time complexity.",
    "Add a requirement for a specific design pattern to be mentioned in the strategy.",
    "Describe a specific error scenario that must be handled.",
    "Frame the input as a stream of data rather than a static list.",
    "Assume the environment has strictly limited memory (e.g., 64MB)."
  ];

  const flavor = industries[Math.floor(Math.random() * industries.length)];
  const persona = perspectives[Math.floor(Math.random() * perspectives.length)];
  const techFocus = focuses[Math.floor(Math.random() * focuses.length)];
  const challengeType = taskTypes[Math.floor(Math.random() * taskTypes.length)];
  const modifier = complexityModifiers[Math.floor(Math.random() * complexityModifiers.length)];

  const variationId = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;

  const frameworkTemplate = topic.toLowerCase().includes('react') ?
    `MANDATORY ENTERPRISE REACT ARCHITECTURE (20+ FILES MINIMUM):
     [project-name]
     ├── e2e/                          // Full End-to-End Test Suite
     │   ├── tests/
     │   │   ├── app.spec.ts
     │   ├── playwright.config.ts
     ├── public/
     │   ├── index.html                // SPA Root
     │   ├── favicon.ico
     │   ├── manifest.json
     ├── src/
     │   ├── components/               // Modular Component Architecture
     │   │   ├── layout/
     │   │   │   ├── Header.tsx
     │   │   │   ├── Footer.tsx
     │   │   ├── [feature-1]/
     │   │   │   ├── [feature-1].tsx
     │   │   │   ├── [feature-1].module.css
     │   │   │   ├── [feature-1].test.tsx
     │   │   ├── [feature-2]/
     │   │   │   ├── [feature-2].tsx
     │   │   │   ├── [feature-2].module.css
     │   │   │   ├── [feature-2].test.tsx
     │   ├── hooks/                    // Custom React Hooks
     │   │   ├── useLocalStorage.ts
     │   │   ├── useApi.ts
     │   ├── services/                 // API & Business Logic
     │   │   ├── api.service.ts
     │   │   ├── auth.service.ts
     │   ├── store/                    // State Management
     │   │   ├── index.ts
     │   ├── types/                    // Global Type Definitions
     │   │   ├── index.d.ts
     │   ├── utils/                    // Helper functions
     │   │   ├── formatters.ts
     │   ├── App.tsx                   // Main App Component
     │   ├── App.css
     │   ├── main.tsx                  // Bootstrap
     │   ├── index.css                 // Global Styles
     ├── .env.example                  // Env Template
     ├── .gitignore
     ├── package.json                  // Production-Ready Dependencies
     ├── tsconfig.json                 // Strict TS Config
     ├── vite.config.ts                // Build Config
     ├── README.md                     // Professional Documentation` :
    `MANDATORY ENTERPRISE ANGULAR/GENERIC ARCHITECTURE (20+ FILES MINIMUM):
     [project-name]
     ├── e2e/                          // Protractor/Cypress Suite
     │   ├── src/
     │   │   ├── app.e2e-spec.ts
     ├── src/
     │   ├── app/                      // Root Module
     │   │   ├── app.component.ts
     │   │   ├── app.component.html
     │   │   ├── app.component.css
     │   │   ├── app.component.spec.ts
     │   │   ├── app.module.ts
     │   │   ├── app-routing.module.ts
     │   │   ├── core/                 // Singleton Services
     │   │   │   ├── auth.service.ts
     │   │   ├── shared/               // Common Components/Pipes
     │   │   │   ├── shared.module.ts
     │   │   ├── features/             // Feature-Based Modules
     │   │   │   ├── [feature-1]/
     │   │   │   │   ├── [feature-1].component.ts
     │   │   │   │   ├── [feature-1].component.html
     │   │   │   │   ├── [feature-1].component.css
     │   │   │   │   ├── [feature-1].component.spec.ts
     │   │   │   ├── [feature-2]/
     │   │   │   │   ├── [feature-2].component.ts
     │   │   ├── models/               // Data Interfaces
     │   │   │   ├── user.model.ts
     │   ├── assets/                   // Global Assets
     │   │   ├── i18n/
     │   │   │   ├── en.json
     │   ├── environments/             // Multi-Env Support
     │   │   ├── environment.ts
     │   │   ├── environment.prod.ts
     │   ├── index.html
     │   ├── main.ts
     │   ├── polyfills.ts
     │   ├── styles.css
     ├── package.json
     ├── tsconfig.json
     ├── .env.example
     ├── angular.json
     ├── README.md`;


  let diffContextStr = difficultyContext[difficulty] || 'General technical excellence';
  if (isFramework) {
    diffContextStr += " CRITICAL: Framework projects MUST always use the deep enterprise directory structure provided below, even for Easy tasks. Configuration files (tsconfig, package.json, etc.) are non-negotiable.";
  }

  const prompt = isMcq ?
    `Your Persona: ${persona}. 
Topic: "${topic}". 
Industry Focus: ${flavor}. 
Technical Emphasis: ${techFocus}.
VARIATION ID: ${variationId}.

Generate ${count} MCQ questions. REQUIREMENTS:
- CATEGORY ALIGNMENT: This is for the "${category.toUpperCase()}" category. ${categoryRules}
- DIFFICULTY CALIBRATION: ${diffRule}
- Use your Persona to influence the wording and scenario.
- Focus on the Technical Emphasis where relevant.
- Technically perfect, zero ambiguity
- Detailed "Smart Explanations" that explain "Why A is right" AND "Why others are wrong"
- Professional tone, similar to AWS/GCP certification exams
- NOVELTY MANDATE: Forbidden to use common "Introduction to [Topic]" questions. Create unique, weird, or highly specific enterprise scenarios.
- VARIATION SEED: ${Date.now()}-${Math.random()}-${Math.floor(Math.random() * 1000000)}


Return ONLY a JSON object:
  {
    "questions": [
      {
        "question": "Question text?",
        "options": ["A", "B", "C", "D"],
        "correct": 0,
        "explanation": "Expert walkthrough..."
      }
    ]
  } ` :

    isFramework ?
      `Your Persona: ${persona}.
Topic: "${topic}". 
Industry Context: ${flavor}.
Technical Emphasis: ${techFocus}.
Challenge Type: ${challengeType}.
Difficulty: ${difficulty.toUpperCase()}. VARIATION ID: ${variationId}.
STRICT CONTEXT: ${diffContextStr}

Generate ${count} challenge(s). QUALITY STANDARDS:
1. CATEGORY ALIGNMENT:
   - This is for the "${category.toUpperCase()}" category. ${categoryRules}
2. COMPREHENSIVE DESCRIPTION (MANDATORY STRUCTURE): 
   - A single Markdown string with:
     ## 🌐 Project Context
  [Explain the real - world scenario]
     ## 🎯 Task
  [Explain exactly what the user needs to build / complete]
     ## 🛠️ Technical Requirements
  [List specific libraries, patterns, or algorithms to use]
  - The learner must be able to complete the project using ONLY this description.
2. PROJECT STRUCTURE EXCELLENCE (MANDATORY - CRITICAL FAILURE IF SIMPLIFIED):
   - Provide a professional, production-ready directory hierarchy. FORBIDDEN to simplify.
   - MANDATORY ARCHITECTURE: You MUST use a modular, multi-folder structure.
   - ** QUANTITY RULE **: Framework projects MUST contain at least 20-30 discrete files.
   - USE THIS EXACT TEMPLATE (Scale with difficulty):
     ${frameworkTemplate}
   - Every feature MUST have its own dedicated folder.
   - Every component MUST have its own separate logic, style, and test files.
   - ** NO PLACEHOLDERS **: Never use "..." or "etc." in the tree. List EVERY file.
   - CRITICAL: If you generate a structure like "src/components/File.tsx" (flat list), you have FAILED. 
   - The 'projectStructure' field MUST reflect this EXACT level of thoroughness.
   - NEATNESS: Use standard ASCII symbols (├──, └──, │) with perfect vertical alignment.
   - DIFFICULTY MAPPING: Complexity and depth MUST scale with difficulty (${difficulty.toUpperCase()}).

3. STARTER SYNC & COMPLETENESS (MANDATORY - NON-NEGOTIABLE):
   - 'starterCode' MUST contain a functional code entry for EVERY single file mentioned in your 'projectStructure' tree.
   - ** 20+ FILES REQUIRED **: If you provide fewer than 20 files in 'starterCode', the task is incomplete.
   - ** ABSOLUTE ZERO DEBT **: If a file exists in the tree (e.g., polyfills.ts, tsconfig.json, environments/environment.ts), its full content MUST be in the 'starterCode' object.
   - FORBIDDEN: Do not use placeholders like "// ...rest of file". You MUST provide the full, working boilerplate.
   - Include a comprehensive 'package.json' with all necessary dependencies, devDependencies, and standard build/test scripts.
   - All environment variables needed must be documented in '.env.example'.
   - Code must follow professional enterprise patterns with proper imports and exports.



4. WORKING BOILERPLATE (WITHOUT BUSINESS LOGIC):
   - Structural files (configs, types, basic routing, package.json) must be PROVIDED and WORKING.
   - ** LOGIC STRIPPING **: Component and logic files should provide the structure and boilerplate but leave the core logic for the student.
   - Provide only the component signature and total empty stubs for the core tasks.
   - Leave clear "// TODO" sections for the student.
5. NOVELTY & VARIETY (CRITICAL):
   - DIFFICULTY CALIBRATION: ${diffRule}
   - COMPLEXITY MODIFIER: ${modifier}
   - Use a unique real-world scenario every time.
   - VARIATION SEED: ${Date.now()}-${Math.random()}
   - Avoid generic "Todo List" or "Counter" apps unless explicitly requested.

Return ONLY a JSON object:
  {
    "questions": [
      {
        "title": "Project Title",
        "description": "Comprehensive Markdown string with ## Context, ## Task, and ## Requirements headers.",
        "projectStructure": "Deep, 25+ line ASCII Tree View reflecting production standards (MANDATORY).",

        "starterCode": {
          "src/app/app.component.ts": "...",
          "src/app/app.component.html": "...",
          "src/app/app.module.ts": "...",
          "package.json": "...",
          "tsconfig.json": "...",
          "README.md": "...",
          "...+20 more files": "..."
        },

        "input": "User Scenario",
        "output": "Expected Result",
        "examples": [{ "input": "...", "output": "...", "explanation": "..." }],
        "testCases": [
          { "input": "...", "output": "...", "hidden": false },
          { "input": "...", "output": "...", "hidden": true }
        ],
        "timeLimit": "120",
        "constraints": ["Usage of ${topic} patterns", "Strict modularity"],
        "hints": ["Strategic Hint", "Technical Tip"]
      }
    ]
  } ` :

      `Your Persona: ${persona}.
Context: ${topic}. 
Scenario Context: ${flavor}.
Technical Emphasis: ${techFocus}.
Challenge Type: ${challengeType}.
Complexity: ${difficulty.toUpperCase()} (${difficultyContext}). VARIATION ID: ${variationId}.

Generate ${count} challenge(s). CRYSTAL CLEAR QUALITY STANDARDS:
1. CATEGORY ALIGNMENT:
   - This is for the "${category.toUpperCase()}" category. ${categoryRules}
2. PROBLEM DESCRIPTION (STRING ONLY):
  - MUST be a single string using Markdown.
  - Learner should understand EXACTLY what to do from this description alone.
   - Separate into "Context", "Task", and "Technical Goal".
   - Use Markdown strictly(ticks for variable names, bold for emphasis).
3. EXAMPLES(MANDATORY 2 - 3):
  - Every example MUST have: 'Input', 'Output', and a 'Detailed Explanation' of how the result was derived.
4. CONSTRAINTS(MANDATORY):
  - Provide a technical constraints list(e.g., Array length, Value ranges).
5. STARTER CODE(ABSOLUTE MINIMALIST SKELETON):
  - Provide VALID and FUNCTIONAL signature / template.
   - ** LOGIC STRIPPING RULE(MANDATORY) **: DO NOT provide even a single line of logic inside functions or classes.
   - ** FORBIDDEN **: No initialization of variables, no loops, no if-statements, no helper logic.
   - ONLY provide the 'def', 'class', or 'interface' declaration and a single TODO comment.
   - Use 'pass'(Python), 'null'(Java / JS), or 'return 0/[]' as absolute bare minimums.
6. NOVELTY & RANDOMIZATION (CRITICAL):
   - DIFFICULTY CALIBRATION: ${diffRule}
   - COMPLEXITY MODIFIER: ${modifier}
   - Create UNIQUE scenarios. Avoid overused clones.
   - VARIATION SEED: ${Date.now()}-${Math.random()}
  - Introduce unexpected constraints or data formats to force creative logic.


Return ONLY a JSON object:
  {
    "questions": [
      {
        "title": "Problem Title",
        "description": "Clear Markdown string explaining everything.",
        "starterCode": "def solution(input_data):\n    # TODO: Implement the solution from scratch\n    pass",
        "input": "Input details",
        "output": "Output details",
        "examples": [
          { "input": "...", "output": "...", "explanation": "Detailed walkthrough" }
        ],
        "testCases": [
          { "input": "...", "output": "...", "hidden": false },
          { "input": "...", "output": "...", "hidden": true }
        ],
        "timeLimit": "60",
        "constraints": ["Constraint 1", "Constraint 2"],
        "hints": ["Hint 1", "Hint 2"]
      }
    ]
  } `;


  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey || state.groqKey}`
    },
    body: JSON.stringify({
      model: model || state.groqModel,
      messages: [
        { role: 'system', content: 'You are an expert technical SME and software architect. You output ONLY valid JSON with no markdown formatting.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.8 + (Math.random() * 0.1), // Dynamic temperature for high variety
      max_tokens: 4096,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || 'API request failed');
  }

  const data = await response.json();
  let content = data.choices[0].message.content;

  try {
    const parsed = JSON.parse(content);
    const questions = parsed.questions || parsed.data || (Array.isArray(parsed) ? parsed : Object.values(parsed)[0]);

    if (!Array.isArray(questions)) throw new Error('Invalid JSON format from AI');

    return questions.map((q, i) => ({
      ...q,
      id: Date.now() + i,
      category,
      subtopic,
      smeName,
      difficulty: difficulty.toLowerCase()
    }));
  } catch (e) {
    console.error("AI Response Content:", content);
    throw new Error('Failed to parse AI response. Try again.');
  }
}


function generateMockQuestions(topic, type, difficulty, count, category, subtopic, smeName) {
  const questions = [];

  const pythonPool = {
    mcq: [
      { q: "What is the output of `type(None)` in Python?", opts: ["<class 'NoneType'>", "<class 'None'>", "<class 'null'>", "<class 'void'>"], correct: 0, exp: "None in Python is an object of NoneType." },
      { q: "How do you create a variable that is available throughout the program?", opts: ["Declare it outside all functions", "Use the 'global' keyword inside a function", "Pass it as an argument", "Use a protected name"], correct: 0, exp: "A variable declared outside all functions is globally scoped." },
      { q: "Which method is used to add an element at the end of a list?", opts: ["append()", "add()", "insert()", "push()"], correct: 0, exp: "The append() method adds an item to the end of a Python list." },
      { q: "What keyword defines the start of a function in Python?", opts: ["def", "func", "function", "define"], correct: 0, exp: "The 'def' keyword is used to define functions in Python." }
    ],
    coding: [
      { title: "Longest Substring Search", desc: "Write a Python function to find the length of the longest substring without repeating characters.", starter: "def longest_substring(s):\n    # Write your code here\n    pass", input: "abcabcbb", output: "3" },
      { title: "LRU Cache Mechanism", desc: "Implement a basic version of a Least Recently Used (LRU) Cache in Python using an OrderedDict.", starter: "from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        pass", input: "capacity=2, put(1,1), put(2,2), get(1)", output: "1" },
      { title: "Word Frequency Counter", desc: "Write a script that takes a string and returns a dictionary with the frequency of each word.", starter: "def word_frequency(s):\n    pass", input: "'Hello world hello'", output: "{'hello': 2, 'world': 1}" }
    ]
  };

  const isPython = topic.toLowerCase().includes('python');

  for (let i = 0; i < count; i++) {
    const id = Date.now() + i + Math.floor(Math.random() * 1000);

    if (type === 'mcq') {
      let qData = (isPython && pythonPool.mcq[i % pythonPool.mcq.length]) || {
        q: `Which concept of ${topic} is primary in ${difficulty} operations ? `,
        opts: ["A", "B", "C", "D"], correct: 0, exp: "Explanation here."
      };

      questions.push({
        id, category, subtopic, smeName,
        question: qData.q,
        options: qData.opts,
        correct: qData.correct,
        explanation: qData.exp,
        difficulty
      });
    } else {
      let qData = (isPython && pythonPool.coding[i % pythonPool.coding.length]) || {
        title: `${topic} Module ${i + 1} `,
        desc: `Implement ${topic} core logic for ${difficulty} level.`,
        starter: `def solve(): \n    pass`,
        input: "test_input",
        output: "test_output"
      };

      questions.push({
        id, category, subtopic, smeName,
        title: qData.title,
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1),
        description: qData.desc,
        starterCode: qData.starter,
        input: qData.input,
        output: qData.output,
        timeLimit: "30", // Default 30 mins
        constraints: ["Time: O(n)", "Memory < 128MB"]
      });
    }
  }
  return questions;
}

function downloadQuestions(questions, type, format) {
  const timestamp = new Date().toISOString().slice(0, 10);
  const subtopic = questions[0]?.subtopic || questions[0]?.title || 'questions';
  const safeFilename = `${subtopic.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${timestamp} `;

  if (format === 'json') {
    const blob = new Blob([JSON.stringify(questions, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${safeFilename}.json`;
    a.click(); URL.revokeObjectURL(url);
    showToast('success', 'Downloaded as JSON!');
    return;
  }

  // Markdown export
  let md = `# Question Bank — ${subtopic} \n`;
  md += `** Type:** ${type.toUpperCase()} | ** Generated:** ${new Date().toLocaleDateString()} \n\n-- -\n\n`;

  questions.forEach((q, i) => {
    if (type === 'mcq') {
      md += `## Q${i + 1}. ${q.question} \n\n`;
      md += `** Difficulty:** ${q.difficulty || 'N/A'} \n\n`;
      (q.options || []).forEach((opt, idx) => {
        const marker = idx === q.correct ? '✅' : '⬜';
        md += `${marker} ** ${String.fromCharCode(65 + idx)}.** ${opt} \n`;
      });
      if (q.explanation) md += `\n > ** Explanation:** ${q.explanation} \n`;
      md += `\n-- -\n\n`;
    } else {
      md += `## ${i + 1}. ${q.title} \n\n`;
      md += `** Difficulty:** ${q.difficulty || 'N/A'} | ** Time Limit:** ${q.timeLimit || '45'} mins\n\n`;
      md += `### 📋 Description\n${q.description} \n\n`;

      // Project Structure (auto-generate from starterCode for accuracy)
      const exportTree = (q.starterCode && typeof q.starterCode === 'object') ? buildTreeFromFiles(q.starterCode) : q.projectStructure;
      if (exportTree) {
        md += `### 📁 Project Structure\n\`\`\`\n${exportTree}\n\`\`\`\n\n`;
      }

      // Starter Code — all files merged into one block in the single Markdown file
      if (q.starterCode) {
        if (typeof q.starterCode === 'object') {
          md += `### 💻 Project Starter Code\n\n`;
          md += `> All project files are included below in sequence. Copy each section into the corresponding file.\n\n`;
          Object.entries(q.starterCode).forEach(([filename, code]) => {
            const ext = filename.split('.').pop();
            const langMap = { js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx', json: 'json', py: 'python', html: 'html', css: 'css', md: 'markdown' };
            const lang = langMap[ext] || ext;
            md += `#### 📄 \`${filename}\`\n\n\`\`\`${lang}\n${code}\n\`\`\`\n\n`;
          });
        } else {
          md += `### 💻 Starter Code\n\n\`\`\`\n${q.starterCode}\n\`\`\`\n\n`;
        }
      }

      md += `### 📥 Input Format\n${q.input || 'N/A'}\n\n`;
      md += `### 📤 Output Format\n${q.output || 'N/A'}\n\n`;

      if (q.examples && Array.isArray(q.examples)) {
        md += `### 📌 Examples\n\n`;
        q.examples.forEach((ex, idx) => {
          md += `#### Example ${idx + 1}\n`;
          md += `**Input:** \`${ex.input}\`  \n`;
          md += `**Output:** \`${ex.output}\`  \n`;
          if (ex.explanation) md += `**Explanation:** ${ex.explanation}  \n`;
          md += `\n`;
        });
      } else if (q.input && q.output) {
        md += `### 📌 Example Case\n`;
        md += `**Input:** \`${q.input}\`  \n`;
        md += `**Output:** \`${q.output}\`  \n\n`;
      }

      if (q.constraints && q.constraints.length) {
        md += `### ⚙️ Constraints\n`;
        q.constraints.forEach(c => { md += `- ${c}\n`; });
        md += `\n`;
      }

      if (q.hints && q.hints.length) {
        md += `### 💡 Hints\n`;
        q.hints.forEach((h, idx) => { md += `${idx + 1}. ${h}\n`; });
        md += `\n`;
      }

      if (q.testCases && q.testCases.length) {
        md += `### 🧪 Test Case Suite\n\n`;
        md += `| Case | Input | Output | Access |\n`;
        md += `| :--- | :--- | :--- | :--- |\n`;
        q.testCases.forEach((tc, idx) => {
          md += `| ${idx + 1} | \`${tc.input}\` | \`${tc.output}\` | ${tc.hidden ? '🔒 Hidden' : '👁️ Visible'} |\n`;
        });
        md += `\n`;
      }

      md += `---\n\n`;
    }
  });

  const blob = new Blob([md], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = `${safeFilename}.md`;
  a.click(); URL.revokeObjectURL(url);
  showToast('success', 'Downloaded as Markdown!');
}

function renderGeneratedPreview(questions, type) {
  const container = document.getElementById('gen-preview-content');

  if (!questions || questions.length === 0) {
    container.innerHTML = `
      <div class="empty-preview">
        <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;">✨</div>
        <p>No questions generated yet. Enter a topic and click generate.</p>
      </div>
    `;
    const saveBtn = document.getElementById('save-generated-btn');
    if (saveBtn) {
      if (state.activeSessionId) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `⏳ Auto-Saving on End Session`;
        saveBtn.classList.remove('btn-primary', 'btn-success');
        saveBtn.classList.add('btn-secondary');
      } else {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `💾 Save to Database`;
        saveBtn.classList.remove('btn-success', 'btn-secondary');
        saveBtn.classList.add('btn-primary');
      }
    }
    return;
  }

  const saveBtn = document.getElementById('save-generated-btn');
  if (saveBtn) {
    if (state.activeSessionId) {
      saveBtn.disabled = true;
      saveBtn.innerHTML = `⏳ Auto-Saving on End Session (${state.sessionPendingQuestions ? state.sessionPendingQuestions.length : 0} items pending)`;
      saveBtn.classList.remove('btn-primary', 'btn-success');
      saveBtn.classList.add('btn-secondary');
    } else {
      saveBtn.disabled = false;
      saveBtn.innerHTML = `💾 Save to Database`;
      saveBtn.classList.remove('btn-success', 'btn-secondary');
      saveBtn.classList.add('btn-primary');
    }
  }

  container.innerHTML = `
    <div class="preview-controls" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 5px; border-bottom: 1px solid var(--border); padding-bottom: 15px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <input type="checkbox" id="select-all-gen" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);">
        <label for="select-all-gen" style="font-size: 0.9rem; cursor: pointer; user-select: none; font-weight: 600;">Select All (${questions.length})</label>
      </div>
      <div style="display: flex; gap: 8px; align-items: center;">
        ${type === 'mcq' ? `
          <button class="btn btn-secondary btn-sm" id="download-json-btn" style="padding: 6px 12px; font-size: 0.75rem; border-radius: 6px;">⬇️ JSON</button>
          <button class="btn btn-secondary btn-sm" id="download-md-btn" style="padding: 6px 12px; font-size: 0.75rem; border-radius: 6px;">📄 Markdown</button>
        ` : ''}
        <button class="btn btn-danger btn-sm" id="delete-selected-btn" disabled style="padding: 6px 12px; font-size: 0.75rem; border-radius: 6px;">🗑️ Delete Selected</button>
      </div>
    </div>
    <div class="preview-list">
      ${questions.map((q, idx) => `
        <div class="gen-preview-card" data-id="${q.id}">
          <div class="gen-card-left">
            <input type="checkbox" class="gen-item-check" data-index="${idx}" style="cursor: pointer; width: 18px; height: 18px; accent-color: var(--primary);">
            <div class="gen-info" style="margin-left: 15px;">
              <div class="gen-q-title" style="white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 320px;" title="${type === 'mcq' ? q.question : q.title}">
                ${type === 'mcq' ? q.question : q.title}
              </div>
              <div class="gen-q-meta">
                <span class="badge ${type === 'mcq' ? 'badge-primary' : 'badge-warning'}">${type.toUpperCase()}</span>
                <span class="gen-q-diff">${q.difficulty || state.difficulty}</span>
              </div>
            </div>
          </div>
          <div class="gen-card-right">
            <button class="btn btn-secondary btn-sm preview-detail-btn" data-index="${idx}" style="padding: 6px 10px;">
              👁️ View
            </button>
            <button class="btn btn-secondary btn-sm download-single-btn" data-index="${idx}" title="${type === 'coding' ? 'Download Project ZIP' : 'Download this question'}" style="padding: 6px 10px;">
              ${type === 'coding' ? '📦 ZIP' : '⬇️'}
            </button>
            <button class="btn btn-danger btn-sm delete-gen-btn" data-index="${idx}" style="padding: 6px 10px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--danger-light);">
              🗑️
            </button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

  // Attach Listeners
  const selectAll = document.getElementById('select-all-gen');
  const deleteSelectedBtn = document.getElementById('delete-selected-btn');
  const itemChecks = container.querySelectorAll('.gen-item-check');

  const updateBulkActions = () => {
    const checked = container.querySelectorAll('.gen-item-check:checked');
    deleteSelectedBtn.disabled = checked.length === 0;
    deleteSelectedBtn.textContent = `🗑️ Delete Selected (${checked.length})`;
    selectAll.checked = checked.length === itemChecks.length && itemChecks.length > 0;
  };

  if (selectAll) {
    selectAll.addEventListener('change', () => {
      itemChecks.forEach(check => check.checked = selectAll.checked);
      updateBulkActions();
    });
  }

  itemChecks.forEach(check => {
    check.addEventListener('change', updateBulkActions);
  });

  // Individual Delete
  container.querySelectorAll('.delete-gen-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.closest('.delete-gen-btn').dataset.index);
      const qToRemove = state.lastGenerated[idx];
      state.lastGenerated.splice(idx, 1);

      // Also remove from pending session memory if it exists
      if (state.sessionPendingQuestions && qToRemove) {
        state.sessionPendingQuestions = state.sessionPendingQuestions.filter(q => q.id !== qToRemove.id);
      }

      renderGeneratedPreview(state.lastGenerated, state.lastGeneratedType);
      showToast('info', 'Question removed from preview');
    });
  });

  // Bulk Delete
  if (deleteSelectedBtn) {
    deleteSelectedBtn.addEventListener('click', () => {
      const checkedIndices = Array.from(container.querySelectorAll('.gen-item-check:checked'))
        .map(check => parseInt(check.dataset.index))
        .sort((a, b) => b - a); // Sort descending

      const idsToRemove = checkedIndices.map(idx => state.lastGenerated[idx]?.id);

      checkedIndices.forEach(idx => state.lastGenerated.splice(idx, 1));

      // Remove from session pending questions 
      if (state.sessionPendingQuestions && idsToRemove.length > 0) {
        state.sessionPendingQuestions = state.sessionPendingQuestions.filter(q => !idsToRemove.includes(q.id));
      }

      renderGeneratedPreview(state.lastGenerated, state.lastGeneratedType);
      showToast('success', `Deleted ${checkedIndices.length} questions`);
    });
  }

  // Per-question individual download
  container.querySelectorAll('.download-single-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.closest('.download-single-btn').dataset.index);
      const q = questions[idx];
      if (type === 'coding' || q.type === 'coding') {
        downloadAsZip(q);
      } else {
        downloadQuestions([q], type, 'md');
      }
    });
  });

  // Download all JSON
  const dlJsonBtn = document.getElementById('download-json-btn');
  if (dlJsonBtn) {
    dlJsonBtn.addEventListener('click', () => downloadQuestions(questions, type, 'json'));
  }

  // Download Markdown
  const dlMdBtn = document.getElementById('download-md-btn');
  if (dlMdBtn) {
    dlMdBtn.addEventListener('click', () => downloadQuestions(questions, type, 'md'));
  }

  // Detail View
  container.querySelectorAll('.preview-detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.closest('.preview-detail-btn').dataset.index;
      showQuestionDetailModal(questions[idx], type, (updated) => {
        state.lastGenerated[idx] = updated;
        renderGeneratedPreview(state.lastGenerated, type);
      });
    });
  });
}

function showQuestionDetailModal(q, type, onSave) {
  let modal = document.getElementById('preview-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'preview-modal';
    modal.className = 'modal-overlay';
    document.body.appendChild(modal);
  }

  modal.innerHTML = `
    <div class="modal-content card card-glass" style="max-width: 900px; width: 95%;">
      <div class="modal-header" style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 20px;">
        <h3 class="modal-title">🛠️ SME Content Editor - ${type === 'mcq' ? 'MCQ' : 'Coding Problem'}</h3>
        <button class="modal-close" id="close-modal-btn" style="background: none; border: none; color: var(--text-primary); font-size: 1.5rem; cursor: pointer;">&times;</button>
      </div>
      <div class="modal-body" style="max-height: 75vh; overflow-y: auto; padding-right: 10px;">
        <div class="edit-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
          <div class="form-group">
            <label class="form-label">Authorized SME Name</label>
            <input type="text" class="form-input" id="edit-sme" value="${q.smeName || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Difficulty Level</label>
            <select class="form-select" id="edit-difficulty">
              <option value="Easy" ${q.difficulty === 'Easy' ? 'selected' : ''}>Easy</option>
              <option value="Medium" ${q.difficulty === 'Medium' ? 'selected' : ''}>Medium</option>
              <option value="Hard" ${q.difficulty === 'Hard' ? 'selected' : ''}>Hard</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Topic / Category</label>
            <input type="text" class="form-input" id="edit-category" value="${q.category || ''}">
          </div>
          <div class="form-group">
            <label class="form-label">Subtopic</label>
            <input type="text" class="form-input" id="edit-subtopic" value="${q.subtopic || ''}">
          </div>
        </div>

        ${type === 'mcq' ? `
          <div class="form-group" style="margin-top: 25px;">
            <label class="form-label" style="font-size: 0.95rem; color: var(--primary-light); margin-bottom: 12px;">Question Content</label>
            <textarea class="form-input" id="edit-question" style="min-height: 150px; font-size: 1.1rem; line-height: 1.5; padding: 15px;">${q.question}</textarea>
          </div>
          <div class="form-group" style="margin-top: 25px;">
            <label class="form-label">Available Options (Select the correct one)</label>
            <div class="edit-options-list" style="display: grid; gap: 12px; margin-top: 10px;">
              ${q.options.map((opt, i) => `
                <div style="display: flex; gap: 15px; align-items: center; background: rgba(255,255,255,0.03); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
                  <input type="radio" name="edit-correct" value="${i}" ${q.correct === i ? 'checked' : ''} style="width: 20px; height: 20px; cursor: pointer;">
                  <input type="text" class="form-input edit-opt-val" data-idx="${i}" value="${opt}" style="flex: 1; height: 45px; font-size: 1rem;">
                </div>
              `).join('')}
            </div>
          </div>
          <div class="form-group" style="margin-top: 25px;">
            <label class="form-label">High-Quality Explanation</label>
            <textarea class="form-input" id="edit-explanation" style="min-height: 150px; font-size: 1.05rem; line-height: 1.6; padding: 15px;">${q.explanation || ''}</textarea>
          </div>
        ` : `
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">Problem Title</label>
            <input type="text" class="form-input" id="edit-title" value="${q.title}">
          </div>
          <div class="form-group" style="margin-top: 25px;">
            <label class="form-label" style="font-size: 0.95rem; color: var(--primary-light); margin-bottom: 12px;">Descriptive Scenario (Markdown Supported)</label>
            <textarea class="form-input" id="edit-desc" style="min-height: 350px; font-size: 1.05rem; line-height: 1.6; padding: 20px; background: rgba(0,0,0,0.2);">${typeof q.description === 'object' ? JSON.stringify(q.description, null, 2) : q.description}</textarea>
          </div>

          ${(q.projectStructure || (q.starterCode && typeof q.starterCode === 'object')) ? `
          <div class="form-group" style="margin-top: 24px;">
            <div class="editor-section-card">
              <div class="editor-section-header">
                <span style="font-size: 1.1rem;">📂</span>
                <span class="editor-section-title">Project Structure (Tree View)</span>
              </div>
              <div class="editor-project-tree" style="background: #0d0d16; color: #a5b4fc; font-weight: 500; font-family: var(--font-mono); font-size: 0.85rem; padding: 15px; white-space: pre; overflow-x: auto; line-height: 1.4; border-radius: 6px; border: 1px solid var(--border);">${(q.starterCode && typeof q.starterCode === 'object') ? buildTreeFromFiles(q.starterCode, q.title) : q.projectStructure}</div>
            </div>
          </div>
          ` : ''}

          <div class="form-group" style="margin-top: 30px;">
            <div class="editor-section-card" style="border: 1px solid var(--border-active); background: rgba(99, 102, 241, 0.03);">
              <div class="editor-section-header" style="background: rgba(99, 102, 241, 0.1); padding: 12px 20px;">
                <span style="font-size: 1.2rem;">💻</span>
                <span class="editor-section-title" style="font-size: 1rem; font-weight: 700;">Starter Code Implementation ${typeof q.starterCode === 'object' ? '(Enterprise Structure)' : ''}</span>
              </div>
              <div class="editor-file-list" style="padding: 15px;">
                ${typeof q.starterCode === 'object' ?
      Object.entries(q.starterCode).map(([filename, code]) => `
                    <div class="editor-file-item" style="margin-bottom: 25px;">
                      <div class="editor-file-label" style="font-weight: 600; margin-bottom: 10px; color: var(--primary-light);">📄 ${filename}</div>
                      <textarea class="form-input multi-file-code editor-code-area" data-filename="${filename}" placeholder="Code for ${filename}" style="min-height: 250px; font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.5; padding: 15px;">${code}</textarea>
                    </div>
                  `).join('') : `
                  <textarea class="form-input editor-code-area" id="edit-starter" style="min-height: 400px; font-family: var(--font-mono); font-size: 0.95rem; line-height: 1.5; padding: 15px;" placeholder="Base starter code...">${q.starterCode || ''}</textarea>
                `}
              </div>
            </div>
          </div>

          <div class="edit-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div class="form-group">
              <label class="form-label">Primary Sample Input</label>
              <textarea class="form-input" id="edit-input" rows="2" style="font-family: monospace;">${q.input || ''}</textarea>
            </div>
            <div class="form-group">
              <label class="form-label">Primary Expected Output</label>
              <textarea class="form-input" id="edit-output" rows="2" style="font-family: monospace;">${q.output || ''}</textarea>
            </div>
          </div>
          <div class="form-group" style="margin-top: 15px;">
             <label class="form-label">Timer (Minutes)</label>
             <input type="number" class="form-input" id="edit-timer" value="${q.timeLimit || '45'}" style="width: 120px;">
          </div>

          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">⚙️ Constraints (One per line)</label>
            <textarea class="form-input" id="edit-constraints" style="min-height: 80px;" placeholder="e.g.\nTime Complexity: O(N)\nSpace Complexity: O(1)">${(q.constraints || []).join('\n')}</textarea>
          </div>

          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">💡 Language-Specific Hints (One per line)</label>
            <textarea class="form-input" id="edit-hints" style="min-height: 80px;" placeholder="e.g.\nUse a Hashmap for O(1) lookups\nTraverse the array once">${(q.hints || []).join('\n')}</textarea>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px dashed var(--border);">
            <p class="form-label" style="display: flex; align-items: center; gap: 8px; font-size: 1rem; color: var(--primary-light);">
               🧪 Advanced Test Case Suite
            </p>
            <div id="edit-testcases-container">
              ${[0, 1, 2, 3, 4].map(i => {
        let tc = (q.testCases && q.testCases[i]) || { input: '', output: '', hidden: i >= 2 };
        return `
                  <div style="margin-bottom: 15px; padding: 12px; background: rgba(255,255,255,0.03); border: 1px solid var(--border); border-radius: 8px;">
                    <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                      <span style="font-size: 0.75rem; font-weight: 700; opacity: 0.7;">CASE ${i + 1}</span>
                      <label style="font-size: 0.75rem; cursor: pointer; display: flex; align-items: center; gap: 4px;">
                        <input type="checkbox" class="edit-tc-hidden" ${tc.hidden ? 'checked' : ''}> Hidden Case
                      </label>
                    </div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                      <input type="text" class="form-input edit-tc-input" value="${tc.input}" placeholder="Input" style="font-family: monospace; font-size: 0.8rem;">
                      <input type="text" class="form-input edit-tc-output" value="${tc.output}" placeholder="Output" style="font-family: monospace; font-size: 0.8rem;">
                    </div>
                  </div>
                `;
      }).join('')}
            </div>
          </div>

          <div style="margin-top: 25px; padding-top: 20px; border-top: 1px dashed var(--border);">
            <p class="form-label" style="display: flex; align-items: center; gap: 8px;">
               📌 Examples (2 Cases)
            </p>
            ${[0, 1].map(i => {
        let ex = (q.examples && q.examples[i]);
        // Fallback for Case 1 if examples are missing
        if (!ex && i === 0 && (q.input || q.output)) {
          ex = { input: q.input || '', output: q.output || '', explanation: 'Primary case logic' };
        }
        ex = ex || { input: '', output: '', explanation: '' };

        return `
                <div style="margin-bottom: 20px; padding: 15px; background: rgba(255,255,255,0.04); border: 1px solid var(--border); border-radius: 10px;">
                  <div class="form-group">
                    <label class="form-label" style="font-weight: 700; color: var(--primary-light);">Example ${i + 1} Input</label>
                    <textarea class="form-input edit-ex-input" rows="2" style="font-family: monospace; background: rgba(0,0,0,0.2);">${ex.input}</textarea>
                  </div>
                  <div class="form-group" style="margin-top: 12px;">
                    <label class="form-label" style="font-weight: 700; color: var(--primary-light);">Example ${i + 1} Output</label>
                    <textarea class="form-input edit-ex-output" rows="2" style="font-family: monospace; background: rgba(0,0,0,0.2);">${ex.output}</textarea>
                  </div>
                  <div class="form-group" style="margin-top: 12px;">
                    <label class="form-label" style="opacity: 0.7;">Example ${i + 1} Explanation</label>
                    <textarea class="form-input edit-ex-explain" rows="2" placeholder="e.g. Because x is prime...">${ex.explanation || ''}</textarea>
                  </div>
                </div>
              `;
      }).join('')}
          </div>
        `}
      </div>
      <div class="modal-footer" style="margin-top: 30px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border); padding-top: 20px;">
        <div style="display: flex; gap: 8px;">
          <button class="btn btn-secondary btn-sm" id="modal-dl-json-btn">⬇️ JSON</button>
          <button class="btn btn-secondary btn-sm" id="modal-dl-md-btn">📄 Markdown</button>
        </div>
        <div style="display: flex; gap: 12px;">
          <button class="btn btn-secondary" id="modal-cancel-btn">Discard Changes</button>
          <button class="btn btn-primary" id="modal-save-btn">✨ Save Changes</button>
        </div>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeMod = () => modal.classList.remove('active');
  document.getElementById('close-modal-btn').onclick = closeMod;
  document.getElementById('modal-cancel-btn').onclick = closeMod;

  // Single question download buttons in modal
  document.getElementById('modal-dl-json-btn').onclick = () => downloadQuestions([q], type, 'json');
  document.getElementById('modal-dl-md-btn').onclick = () => downloadQuestions([q], type, 'md');

  document.getElementById('modal-save-btn').onclick = () => {
    const updated = { ...q };
    updated.smeName = document.getElementById('edit-sme').value;
    updated.difficulty = document.getElementById('edit-difficulty').value;
    updated.category = document.getElementById('edit-category').value;
    updated.subtopic = document.getElementById('edit-subtopic').value;

    if (type === 'mcq') {
      updated.question = document.getElementById('edit-question').value;
      updated.correct = parseInt(document.querySelector('input[name="edit-correct"]:checked').value);
      updated.options = Array.from(document.querySelectorAll('.edit-opt-val')).map(el => el.value);
      updated.explanation = document.getElementById('edit-explanation')?.value || q.explanation;
    } else {
      updated.title = document.getElementById('edit-title').value;
      updated.description = document.getElementById('edit-desc').value;
      updated.input = document.getElementById('edit-input').value;
      updated.output = document.getElementById('edit-output').value;
      updated.timeLimit = document.getElementById('edit-timer').value;

      // Handle multi-file vs single file starter code
      const multiFiles = document.querySelectorAll('.multi-file-code');
      if (multiFiles.length > 0) {
        const codeObj = {};
        multiFiles.forEach(el => { codeObj[el.dataset.filename] = el.value; });
        updated.starterCode = codeObj;
      } else {
        updated.starterCode = document.getElementById('edit-starter')?.value || q.starterCode;
      }

      // Save constraints and hints if edited
      const constraintsEl = document.getElementById('edit-constraints');
      if (constraintsEl) updated.constraints = constraintsEl.value.split('\n').filter(Boolean);
      const hintsEl = document.getElementById('edit-hints');
      if (hintsEl) updated.hints = hintsEl.value.split('\n').filter(Boolean);

      // Save examples
      const exInputs = document.querySelectorAll('.edit-ex-input');
      const exOutputs = document.querySelectorAll('.edit-ex-output');
      const exExplains = document.querySelectorAll('.edit-ex-explain');
      updated.examples = Array.from(exInputs).map((el, i) => ({
        input: el.value,
        output: exOutputs[i].value,
        explanation: exExplains[i].value
      })).filter(ex => ex.input || ex.output);

      // Save Test Cases (New)
      const tcInputs = document.querySelectorAll('.edit-tc-input');
      const tcOutputs = document.querySelectorAll('.edit-tc-output');
      const tcHidden = document.querySelectorAll('.edit-tc-hidden');
      updated.testCases = Array.from(tcInputs).map((el, i) => ({
        input: el.value,
        output: tcOutputs[i].value,
        hidden: tcHidden[i].checked
      })).filter(tc => tc.input || tc.output);
    }

    if (onSave) onSave(updated);
    closeMod();
  };

  modal.onclick = (e) => { if (e.target === modal) closeMod(); };
}


window.editSavedQuestion = async (mongoId) => {
  const q = state.savedQuestions.find(it => it._id === mongoId);
  if (!q) {
    showToast('error', 'Question not found in local cache');
    return;
  }

  showQuestionDetailModal(q, q.type, async (updated) => {
    try {
      const resp = await fetch(`http://localhost:5000/api/questions/${mongoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });

      if (!resp.ok) throw new Error('Failed to update question');

      showToast('success', 'Question updated in database!');
      fetchAndRenderSavedQuestions(); // Refresh list
      updateDashboardStats();
    } catch (err) {
      console.error(err);
      showToast('error', 'Update failed: ' + err.message);
    }
  });
};

window.downloadSavedQuestion = (mongoId) => {
  const q = state.savedQuestions.find(it => it._id === mongoId);
  if (!q) {
    showToast('error', 'Question not found in local cache');
    return;
  }
  if (q.type === 'coding') {
    downloadAsZip(q);
  } else {
    downloadQuestions([q], q.type, 'md');
  }
};

async function downloadAsZip(q) {
  if (typeof JSZip === 'undefined') {
    showToast('error', 'ZIP generator not ready. Refresing page might help.');
    return;
  }

  const zip = new JSZip();
  const topFolderName = (q.title || q.subtopic || 'coding_export').replace(/[^a-z0-9]/gi, '_').toLowerCase();
  const topFolder = zip.folder(topFolderName);

  // Helper to generate a single question's folder contents
  const generateQuestionFolder = (folder, question, index) => {
    // 1. README.md
    let readme = `# ${question.title || question.subtopic || 'Question ' + index}\n\n`;

    if (question.type === 'mcq') {
      readme += `## Question\n${question.question}\n\n`;
      if (question.options) {
        question.options.forEach((opt, i) => {
          const marker = i === question.correct ? '✅' : '⬜';
          readme += `${marker} **${String.fromCharCode(65 + i)}.** ${opt}\n`;
        });
      }
      if (question.explanation) readme += `\n> **Explanation:** ${question.explanation}\n`;
    } else {
      readme += `## Challenge Description\n${question.description || ''}\n\n`;
      readme += `### Input Format\n${question.input || 'N/A'}\n\n`;
      readme += `### Output Format\n${question.output || 'N/A'}\n\n`;

      if (question.constraints && question.constraints.length) {
        readme += `### Constraints\n`;
        question.constraints.forEach(c => readme += `- ${c}\n`);
        readme += `\n`;
      }

      if (question.hints && question.hints.length) {
        readme += `### Hints\n`;
        question.hints.forEach((h, i) => readme += `${i + 1}. ${h}\n`);
        readme += `\n`;
      }
    }
    folder.file("README.md", readme);

    // 2. Sample Data / Examples (Coding Only)
    if (question.type !== 'mcq' && question.examples && question.examples.length) {
      let exMd = `# Examples\n\n`;
      question.examples.forEach((ex, i) => {
        exMd += `### Example ${i + 1}\n**Input:** \`${ex.input}\`  \n**Output:** \`${ex.output}\`  \n**Explanation:** ${ex.explanation || 'N/A'}\n\n`;
      });
      folder.file("EXAMPLES.md", exMd);
    }

    // 3. Starter Code (Coding Only)
    if (question.type !== 'mcq' && question.starterCode) {
      if (typeof question.starterCode === 'object') {
        // Multi-file project
        Object.entries(question.starterCode).forEach(([filename, code]) => {
          folder.file(filename, code);
        });
      } else {
        // Single file
        const extMap = { python: 'py', javascript: 'js', java: 'java', cpp: 'cpp', sql: 'sql', php: 'php', c: 'c' };
        const topic = (question.subtopic || '').toLowerCase();
        let ext = 'txt';
        for (const [key, val] of Object.entries(extMap)) {
          if (topic.includes(key)) { ext = val; break; }
        }
        folder.file(`solution.${ext}`, question.starterCode || '');
      }
    }
  };

  if (q.exportedQuestions && Array.isArray(q.exportedQuestions)) {
    // Bulk Export Mode
    q.exportedQuestions.forEach((question, idx) => {
      const subFolderName = `Q${idx + 1}_${(question.title || question.subtopic || 'question').replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
      const subFolder = topFolder.folder(subFolderName);
      generateQuestionFolder(subFolder, question, idx + 1);
    });
  } else {
    // Single Question Mode
    generateQuestionFolder(topFolder, q, 1);
  }

  try {
    const blob = await zip.generateAsync({ type: "blob" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${topFolderName}.zip`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('success', 'Project ZIP generated and downloaded!');
  } catch (err) {
    showToast('error', 'Failed to generate ZIP');
    console.error(err);
  }
}



// =============================================
// START TEST
// =============================================
async function startTest() {
  if (!state.groqKey) {
    showToast('error', 'Groq API Key missing! Please add it in Admin Settings.');
    showPage('admin-page');
    const settingsTab = document.querySelector('[data-tab="settings"]');
    if (settingsTab) settingsTab.click();
    return;
  }

  const loadingText = document.querySelector('#loading-overlay .loading-text');
  if (loadingText) loadingText.textContent = `AI is crafting your ${state.difficulty} ${state.testType.toUpperCase()} test on ${state.subtopic}...`;

  showLoading(true);

  try {
    const topic = state.subtopic;
    const type = state.testType;
    const difficulty = state.difficulty;
    const count = type === 'mcq' ? 10 : 3; // Standard practice counts

    const questions = await generateAIQuestions(topic, type, difficulty, count, state.category, state.subtopic, 'AI Practice System');

    if (type === 'mcq') {
      state.questions = questions;
      state.currentQuestion = 0;
      state.answers = new Array(questions.length).fill(null);
      state.timeLeft = questions.length * 60; // 1 min per question
      state.totalTime = state.timeLeft;

      showPage('mcq-page');

      const diffLabel = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
      document.getElementById('mcq-difficulty-label').textContent = `${diffLabel} · MCQ`;
      document.getElementById('mcq-total-num').textContent = questions.length;

      renderMCQQuestion();
      renderMCQDots();
      startTimer('mcq');
    } else {
      state.questions = questions; // Coding challenges
      state.problem = questions[0];
      state.currentQuestion = 0;

      // Dynamic Language Detection
      const isSqlTopic = topic.toLowerCase().includes('sql') || topic.toLowerCase().includes('dbms');
      state.language = isSqlTopic ? 'sql' : 'python';

      // Calculate total time from AI provided limits or default
      const totalMins = questions.reduce((acc, q) => acc + parseInt(q.timeLimit || 30), 0);
      state.timeLeft = totalMins * 60;
      state.totalTime = state.timeLeft;

      showPage('coding-page');

      const diffLabel = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
      document.getElementById('coding-difficulty-label').textContent = `${diffLabel} · Problem 1`;

      renderCodingProblem();
      startTimer('coding');
      attachCodingListeners();
    }
  } catch (error) {
    console.error(error);
    showToast('error', 'Failed to generate test: ' + error.message);
  } finally {
    showLoading(false);
    if (loadingText) loadingText.textContent = 'Generating your test...'; // Reset
  }
}

// =============================================
// MCQ TEST
// =============================================

function renderMCQQuestion() {
  const q = state.questions[state.currentQuestion];
  const idx = state.currentQuestion;
  const total = state.questions.length;

  document.getElementById('mcq-current-num').textContent = idx + 1;
  document.getElementById('mcq-q-badge').textContent = `Question ${idx + 1}`;
  document.getElementById('mcq-question-text').textContent = q.question;

  const progress = ((idx + 1) / total) * 100;
  document.getElementById('mcq-progress-bar').style.width = `${progress}%`;

  // Options
  const letters = ['A', 'B', 'C', 'D'];
  const optionsGrid = document.getElementById('mcq-options-grid');
  optionsGrid.innerHTML = q.options.map((opt, i) => `
    <div class="option-item" id="option-item-${i}">
      <input type="radio" name="mcq-option" id="opt-${i}" value="${i}"
        ${state.answers[idx] === i ? 'checked' : ''}>
      <label class="option-label" for="opt-${i}">
        <div class="option-radio-visual"></div>
        <span class="option-letter">${letters[i]}</span>
        <span>${opt}</span>
      </label>
    </div>
  `).join('');

  // Prev/Next buttons
  document.getElementById('mcq-prev-btn').disabled = idx === 0;
  document.getElementById('mcq-next-btn').textContent =
    idx === total - 1 ? '✓ Submit Test' : 'Next →';

  // Update dots
  updateMCQDots();
  const card = document.getElementById('mcq-question-card');
  card.style.animation = 'none';
  card.offsetHeight; // reflow
  card.style.animation = 'pageIn 0.3s ease forwards';

  // Attach option listeners for auto-transition
  const optionInputs = optionsGrid.querySelectorAll('input[name="mcq-option"]');
  optionInputs.forEach(input => {
    input.addEventListener('change', () => {
      saveCurrentAnswer();
      // Brief delay for visual feedback before auto-moving
      setTimeout(() => {
        if (state.currentQuestion < state.questions.length - 1) {
          state.currentQuestion++;
          renderMCQQuestion();
        }
      }, 300);
    });
  });
}

function renderMCQDots() {
  const dots = document.getElementById('mcq-dots');
  dots.innerHTML = state.questions.map((_, i) => `
    <div class="q-dot ${i === state.currentQuestion ? 'current' : ''} ${state.answers[i] !== null ? 'answered' : ''}"
      data-index="${i}" title="Question ${i + 1}"></div>
  `).join('');

  dots.querySelectorAll('.q-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      saveCurrentAnswer();
      state.currentQuestion = parseInt(dot.dataset.index);
      renderMCQQuestion();
    });
  });
}

function updateMCQDots() {
  const dots = document.querySelectorAll('.q-dot');
  dots.forEach((dot, i) => {
    dot.className = 'q-dot';
    if (i === state.currentQuestion) dot.classList.add('current');
    if (state.answers[i] !== null) dot.classList.add('answered');
  });
}

function saveCurrentAnswer() {
  const selected = document.querySelector('input[name="mcq-option"]:checked');
  if (selected) {
    state.answers[state.currentQuestion] = parseInt(selected.value);
  }
}

function attachMCQListeners() {
  document.getElementById('mcq-prev-btn').addEventListener('click', () => {
    saveCurrentAnswer();
    if (state.currentQuestion > 0) {
      state.currentQuestion--;
      renderMCQQuestion();
    }
  });

  document.getElementById('mcq-next-btn').addEventListener('click', () => {
    saveCurrentAnswer();
    if (state.currentQuestion < state.questions.length - 1) {
      state.currentQuestion++;
      renderMCQQuestion();
    } else {
      submitMCQTest();
    }
  });

  const exitBtn = document.getElementById('mcq-exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to exit the test? Your progress will be lost.')) {
        stopTimer();
        showPage('home-page');
      }
    });
  }
}

function submitMCQTest() {
  stopTimer();

  let correct = 0;
  state.questions.forEach((q, i) => {
    if (state.answers[i] === q.correct) correct++;
  });

  showResultPage(correct, state.questions.length, 'mcq');
}

// =============================================
// CODING TEST
// =============================================
// HELPER: Build ASCII tree from starterCode file paths
// =============================================
function buildTreeFromFiles(starterCode, rootName = '.') {
  if (!starterCode || typeof starterCode !== 'object') return '';
  const files = Object.keys(starterCode);
  if (files.length === 0) return '';

  // Build a nested tree structure
  const root = {};
  files.forEach(filePath => {
    const parts = filePath.split('/');
    let current = root;
    parts.forEach((part, idx) => {
      if (!current[part]) {
        current[part] = (idx === parts.length - 1) ? null : {};
      }
      if (current[part] !== null) {
        current = current[part];
      }
    });
  });

  // Render ASCII tree
  function renderNode(node, prefix) {
    const entries = Object.keys(node).sort((a, b) => {
      const aIsDir = node[a] !== null;
      const bIsDir = node[b] !== null;
      if (aIsDir && !bIsDir) return -1;
      if (!aIsDir && bIsDir) return 1;
      return a.localeCompare(b);
    });
    let result = '';
    entries.forEach((key, idx) => {
      const isLast = idx === entries.length - 1;
      const connector = isLast ? '└── ' : '├── ';
      const childPrefix = isLast ? '    ' : '│   ';
      result += prefix + connector + key + '\n';
      if (node[key] !== null) {
        result += renderNode(node[key], prefix + childPrefix);
      }
    });
    return result;
  }

  const cleanRootName = (rootName || '.').toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return cleanRootName + '\n' + renderNode(root, '');
}


function renderCodingProblem() {
  const p = state.problem;
  if (!p) return;

  // Header Title
  const titleEl = document.getElementById('problem-title');
  if (titleEl) titleEl.textContent = p.title;

  // Metadata Header (LeetCode Style)
  const metaEl = document.getElementById('problem-meta');
  if (metaEl) {
    const diffColors = { Easy: 'badge-success', Medium: 'badge-warning', Hard: 'badge-danger' };
    metaEl.innerHTML = `
      <div style="display: flex; gap: 8px; align-items: center;">
        <span class="badge ${diffColors[p.difficulty] || 'badge-primary'}" style="padding: 4px 10px; font-size: 0.75rem; border-radius: 12px;">${p.difficulty}</span>
        <button class="btn btn-secondary btn-sm" style="background: rgba(255,255,255,0.04); border: 1px solid var(--border); padding: 4px 10px; font-size: 0.75rem; border-radius: 12px; height: auto;">🏷️ Topics</button>
      </div>
    `;
  }

  // Description
  const descriptionEl = document.getElementById('problem-description');
  if (descriptionEl) {
    let desc = p.description;
    if (typeof desc === 'object') {
      desc = desc.task || desc.objective || JSON.stringify(desc, null, 2);
    }
    descriptionEl.innerHTML = (desc || '')
      .replace(/`([^`]+)`/g, '<code class="code-span">$1</code>')
      .split('\n').map(line => line.trim() ? `<p style="margin-bottom: 20px; line-height: 1.6; color: #f1f5f9; font-size: 0.95rem;">${line}</p>` : '').join('');
  }

  // Examples
  const examplesEl = document.getElementById('problem-examples');
  if (examplesEl && p.examples && Array.isArray(p.examples)) {
    examplesEl.innerHTML = p.examples.map((ex, i) => `
      <div style="margin-bottom: 30px;">
        <p style="font-weight: 600; margin-bottom: 12px; font-size: 1rem; color: #fff;">Example ${i + 1}:</p>
        <div class="example-box" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); padding: 20px; border-radius: 8px;">
          <div style="margin-bottom: 8px;"><strong style="color: #94a3b8; font-family: var(--font-mono); font-size: 0.85rem; display: inline-block; width: 85px;">Input:</strong> <span style="font-family: var(--font-mono); color: #fff; font-size: 0.9rem;">${ex.input}</span></div>
          <div style="margin-bottom: 8px;"><strong style="color: #94a3b8; font-family: var(--font-mono); font-size: 0.85rem; display: inline-block; width: 85px;">Output:</strong> <span style="font-family: var(--font-mono); color: #fff; font-size: 0.9rem;">${ex.output}</span></div>
          ${ex.explanation ? `<div style="margin-top: 15px; font-size: 0.9rem; color: #94a3b8; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 15px;"><strong style="color: #94a3b8; font-size: 0.85rem;">Explanation:</strong> ${ex.explanation}</div>` : ''}
        </div>
      </div>
    `).join('');
  }

  // Constraints section
  const constraintsContainer = document.getElementById('problem-constraints');
  if (constraintsContainer) {
    if (p.constraints && p.constraints.length) {
      constraintsContainer.innerHTML = `
        <p style="font-weight: 600; margin-bottom: 15px; font-size: 1rem; color: #fff;">Constraints:</p>
        <ul style="list-style: none; padding: 0; color: #94a3b8; font-size: 0.9rem;">
          ${p.constraints.map(c => `<li style="margin-bottom: 10px; display: flex; align-items: flex-start; gap: 10px;"><span style="color: var(--primary); font-size: 0.8rem;">●</span> <code class="code-span" style="background: rgba(255,255,255,0.03); border-color: rgba(255,255,255,0.1);">${c}</code></li>`).join('')}
        </ul>
      `;
    } else {
      constraintsContainer.innerHTML = '';
    }
  }

  // Project Structure (auto-generate from starterCode for accuracy)
  const structurePanel = document.getElementById('project-structure-panel');
  if (structurePanel) {
    // Prefer auto-generated tree from starterCode keys for accuracy
    const autoTree = (p.starterCode && typeof p.starterCode === 'object') ? buildTreeFromFiles(p.starterCode, p.title) : '';

    const treeContent = autoTree || p.projectStructure || '';
    if (treeContent) {
      structurePanel.style.display = 'block';
      structurePanel.innerHTML = `
        <p style="font-weight: 600; margin: 30px 0 15px 0; font-size: 1rem; color: #fff;">Project Structure:</p>
        <div class="editor-project-tree" style="background: rgba(13, 13, 26, 0.4); border: 1px solid var(--border); font-family: var(--font-mono); font-size: 0.85rem; padding: 20px; color: #a5b4fc; white-space: pre; overflow-x: auto; line-height: 1.5; border-radius: 8px;">${treeContent}</div>
      `;
    } else {
      structurePanel.style.display = 'none';
    }
  }

  // Editor - Handle AI string starter vs multi-file object
  const tabsContainer = document.getElementById('file-tabs-container');
  if (p.starterCode && typeof p.starterCode === 'object') {
    // Initialize working code if not already set or if problem changed
    state.workingCode = { ...p.starterCode };
    const files = Object.keys(p.starterCode);
    state.activeFile = files.find(f => f.toLowerCase().includes('app') || f.toLowerCase().includes('solution') || f.toLowerCase().includes('main') || f.endsWith('.js') || f.endsWith('.py')) || files[0];

    if (tabsContainer) {
      tabsContainer.style.display = 'flex';
      tabsContainer.style.alignItems = 'center';
      tabsContainer.innerHTML = files.map(file => {
        const isActive = file === state.activeFile;
        return `
          <div class="file-tab" onclick="switchFile('${file}')" style="
            display: inline-flex;
            align-items: center;
            padding: 0 16px;
            height: 100%;
            font-family: var(--font-mono);
            font-size: 0.75rem;
            cursor: pointer;
            border-right: 1px solid var(--border);
            color: ${isActive ? 'var(--primary-light)' : 'var(--text-muted)'};
            background: ${isActive ? 'rgba(255,255,255,0.05)' : 'transparent'};
            transition: var(--transition);
          ">
            📄 ${file}
          </div>
        `;
      }).join('');
    }
    document.getElementById('code-editor').value = state.workingCode[state.activeFile] || '';
  } else {
    if (tabsContainer) tabsContainer.style.display = 'none';
    document.getElementById('code-editor').value = p.starterCode || '';
    state.activeFile = null;
    state.workingCode = {};
  }

  document.getElementById('lang-select').value = state.language;
}

// Global functions for interactive elements
window.switchFile = (filename) => {
  if (!state.activeFile || !state.workingCode) return;

  // Save current work
  state.workingCode[state.activeFile] = document.getElementById('code-editor').value;

  // Update active file
  state.activeFile = filename;
  document.getElementById('code-editor').value = state.workingCode[filename] || '';

  // Update UI tabs
  document.querySelectorAll('.file-tab').forEach(tab => {
    const isMatched = tab.textContent.trim().includes(filename);
    tab.style.color = isMatched ? 'var(--primary-light)' : 'var(--text-muted)';
    tab.style.background = isMatched ? 'rgba(255,255,255,0.05)' : 'transparent';
  });

  showToast('info', `Switched to: ${filename}`);
};

window.toggleHint = (idx) => {
  const content = document.getElementById(`hint-content-${idx}`);
  if (content) content.classList.toggle('active');
};

window.selectTestCase = (idx) => {
  state.selectedTestCaseIndex = idx;
  document.querySelectorAll('.test-card').forEach((c, i) => {
    c.classList.toggle('active', i === idx);
  });
  const p = state.problem;
  const visibleTests = (p.testCases || []).filter(t => !t.hidden);
  const test = visibleTests[idx];
  if (test) {
    const output = document.getElementById('output-content');
    output.innerHTML = `
      <div style="margin-bottom: 10px; opacity: 0.7; font-size: 0.8rem;">Selected Test Case ${idx + 1}:</div>
      <div style="background: rgba(0,0,0,0.3); padding: 10px; border-radius: 6px; font-family: monospace;">
        <div><span style="color: var(--primary-light)">Input:</span> ${test.input}</div>
        <div><span style="color: var(--primary-light)">Expected:</span> ${test.output}</div>
      </div>
    `;
  }
};



function attachCodingListeners() {
  document.getElementById('lang-select').addEventListener('change', (e) => {
    state.language = e.target.value;
    const starter = typeof state.problem.starterCode === 'string' ? state.problem.starterCode : (state.problem.starterCode?.[state.language] || '');
    document.getElementById('code-editor').value = starter;
    showToast('info', `Switched to ${e.target.options[e.target.selectedIndex].text}`);
  });

  // Tab key and Real-time Sync
  const editor = document.getElementById('code-editor');
  editor.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = ta.value.substring(0, start) + '    ' + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + 4;

      // Update working code after tab manipulation
      if (state.activeFile) state.workingCode[state.activeFile] = ta.value;
    }
  });

  editor.addEventListener('input', (e) => {
    if (state.activeFile) {
      state.workingCode[state.activeFile] = e.target.value;
    }
  });

  document.getElementById('run-code-btn').addEventListener('click', runCode);
  document.getElementById('submit-code-btn').addEventListener('click', submitCode);

  const exitBtn = document.getElementById('coding-exit-btn');
  if (exitBtn) {
    exitBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to exit the test? Your progress will be lost.')) {
        stopTimer();
        showPage('home-page');
      }
    });
  }
}

async function runCode() {
  const code = document.getElementById('code-editor').value.trim();
  const outputEl = document.getElementById('output-content');
  const p = state.problem;

  if (!code) {
    outputEl.className = 'output-content error';
    outputEl.textContent = '⚠ No code to run. Please write your solution first.';
    return;
  }

  if (!state.groqKey) {
    showToast('error', 'Groq API Key missing! Please add it in Admin Settings.');
    return;
  }

  outputEl.className = 'output-content';
  outputEl.textContent = '⏳ AI is executing your code...';

  try {
    const visibleTests = (p.testCases || []).filter(t => !t.hidden);
    const selectedTest = visibleTests[state.selectedTestCaseIndex] || { input: p.input, output: p.output };

    const prompt = `
      [EXECUTION ENVIRONMENT]
      Runtime: ${state.language}
      Goal: Solve "${p.title}"
      
      Input to Process: ${selectedTest.input}
      Expected Behavior: ${selectedTest.output}
      
      [PROJECT CONTEXT]
      ${p.projectStructure ? `Architecture:\n${p.projectStructure}` : 'Single-file problem.'}
      
      Code to Execute (Current File):
      \`\`\`${state.language}
      ${code}
      \`\`\`
      
      [RULES]
      1. Return ONLY the literal output/console logs of this code. 
      2. If it fails, return ONLY the clear error message.
      3. No surrounding text. No explanation.
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.groqKey}` },
      body: JSON.stringify({
        model: state.groqModel,
        messages: [{ role: 'system', content: 'You are a raw stdout stream. Output ONLY data.' }, { role: 'user', content: prompt }],
        temperature: 0.0
      })
    });

    if (!response.ok) throw new Error('AI Execution Service Down');

    const data = await response.json();
    const result = data.choices[0].message.content.trim();

    const isCorrect = result.toLowerCase().includes(selectedTest.output.toLowerCase());

    outputEl.className = `output-content ${isCorrect ? 'success' : 'error'}`;
    outputEl.innerHTML = `
      <div style="margin-bottom: 5px; font-weight: 700; color: ${isCorrect ? '#10b981' : '#ef4444'}">${isCorrect ? '✔ Passed' : '✖ Result Mismatch'}</div>
      <div style="font-family: monospace; opacity: 0.9;">${result}</div>
    `;
    showToast(isCorrect ? 'success' : 'info', isCorrect ? 'Test case passed!' : 'Result mismatch for selected input.');
  } catch (error) {
    console.error(error);
    outputEl.className = 'output-content error';
    outputEl.textContent = '❌ Execution Failed: ' + error.message;
    showToast('error', 'AI Compiler Error');
  }
}

async function submitCode() {
  const code = document.getElementById('code-editor').value.trim();
  const p = state.problem;

  const isMultiFile = typeof p.starterCode === 'object';
  const isModified = isMultiFile
    ? true // For multi-file we assume they might have changed something other than just the current editor
    : (code !== p.starterCode && code !== (p.starterCode?.[state.language] || ''));

  if (!code || !isModified) {
    showToast('error', 'Please write or modify your solution before submitting!');
    return;
  }

  if (!state.groqKey) {
    showToast('error', 'Groq API Key missing! Check Settings.');
    return;
  }

  showLoading(true);
  const loadingText = document.querySelector('#loading-overlay .loading-text');
  if (loadingText) loadingText.textContent = "AI is evaluating your code...";

  try {
    const prompt = `
      Perform a deep technical evaluation of this code for the challenge: "${p.title}"
      
      [CONTEXT]
      Core Requirements: ${p.description}
      Visual Test Cases: ${JSON.stringify((p.testCases || []).filter(t => !t.hidden))}
      Hidden Edge Cases (Verify Internally): ${JSON.stringify((p.testCases || []).filter(t => t.hidden))}
      
      [PROJECT ENVIRONMENT]
      ${p.projectStructure ? `Full Project Structure:\n${p.projectStructure}` : 'Single standalone file.'}
      ${typeof p.starterCode === 'object' ? `Background Project Files: ${JSON.stringify(p.starterCode)}` : ''}
      
      [STUDENT SUBMISSION]
      \`\`\`${state.language}
      ${code}
      \`\`\`
      
      [OUTPUT FORMAT: JSON ONLY]
      {
        "passed": boolean,
        "score": number, 
        "summary": "Brief result summary",
        "analysis": {
           "status": "Success/Failure reason",
           "optimizedApproach": "Describe the most efficient algorithm for this",
           "timeComplexity": "O(log n), O(n), etc.",
           "spaceComplexity": "O(1), O(n), etc.",
           "visualization": "Textual representation of the algorithm flow"
        },
        "feedback": "Expert feedback to student"
      }
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.groqKey}` },
      body: JSON.stringify({
        model: state.groqModel,
        messages: [{ role: 'system', content: 'You are a senior technical interviewer and algorithm expert. You output JSON only.' }, { role: 'user', content: prompt }],
        temperature: 0.0,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);

    state.codingResults[state.currentQuestion] = evaluation.passed;
    state.codingHints[state.currentQuestion] = evaluation.analysis.optimizedApproach;

    showLoading(false);
    showAIAnalysisModal(evaluation);

    // If passed, we'll continue after modal close in a real app, 
    // but here we wait for interaction. I'll add a 'Continue' button to modal.

    // Advancing is now handled by the 'Next challenge' button in the AI Analysis modal

  } catch (error) {
    console.error(error);
    showLoading(false);
    showToast('error', 'Evaluation failed. Please try again.');
  } finally {
    if (loadingText) loadingText.textContent = "Generating your test...";
  }
}

// =============================================
// RESULT PAGE
// =============================================
function showResultPage(correct, total, type) {
  showPage('result-page');

  const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
  const wrong = total - correct;

  document.getElementById('stat-correct').textContent = correct;
  document.getElementById('stat-wrong').textContent = wrong;
  document.getElementById('stat-total').textContent = total;
  document.getElementById('score-percent').textContent = `${percent}%`;

  // Animate ring
  const circumference = 2 * Math.PI * 70; // r=70
  const offset = circumference - (percent / 100) * circumference;
  const ring = document.getElementById('score-ring-fill');
  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = circumference;
  setTimeout(() => {
    ring.style.strokeDashoffset = offset;
  }, 300);

  // Performance
  let perf;
  if (percent >= 90) {
    perf = { cls: 'excellent', emoji: '🏆', title: 'Excellent!', desc: 'Outstanding performance! You\'re a star student.' };
  } else if (percent >= 75) {
    perf = { cls: 'good', emoji: '🎯', title: 'Great Job!', desc: 'Very good performance! A little more practice and you\'ll be perfect.' };
  } else if (percent >= 50) {
    perf = { cls: 'average', emoji: '📚', title: 'Good Effort!', desc: 'Decent performance. Review the topics and try again.' };
  } else {
    perf = { cls: 'needs-improvement', emoji: '💪', title: 'Needs Improvement', desc: 'Don\'t give up! Practice more and you\'ll get better.' };
  }

  document.getElementById('result-emoji').textContent = perf.emoji;
  document.getElementById('result-title').textContent = type === 'coding' ? (correct ? 'Solution Accepted! 🎉' : 'Keep Practicing! 💪') : 'Test Complete!';
  document.getElementById('result-message').textContent =
    type === 'coding'
      ? (correct === total ? 'All solutions accepted! Exceptional logic.' : `You solved ${correct} out of ${total} challenges. Review the hints below.`)
      : `You answered ${correct} out of ${total} questions correctly.`;

  // Show Hints if coding
  const hintsPanel = document.getElementById('ai-hints-panel');
  const hintsContent = document.getElementById('ai-hints-content');
  if (type === 'coding' && state.codingHints.length > 0) {
    hintsPanel.classList.add('active');
    hintsContent.innerHTML = state.codingHints.map((hint, i) => `
      <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">PROBLEM ${i + 1}: ${state.questions[i].title}</div>
        <div style="color: ${state.codingResults[i] ? 'var(--success-light)' : 'var(--text-primary)'}">${hint}</div>
      </div>
    `).join('');
  } else {
    hintsPanel.classList.remove('active');
  }

  const banner = document.getElementById('performance-banner');
  banner.className = `performance-banner ${perf.cls}`;
  document.getElementById('perf-icon').textContent = perf.emoji;
  document.getElementById('perf-title').textContent = perf.title;
  document.getElementById('perf-desc').textContent = perf.desc;

  // Actions
  document.getElementById('go-home-btn').onclick = () => {
    stopTimer();
    showPage('home-page');
  };

  document.getElementById('retry-btn').onclick = () => {
    stopTimer();
    startTest();
  };
}

// =============================================
// TIMER
// =============================================
function startTimer(type) {
  stopTimer();

  const timerId = type === 'mcq' ? 'mcq-timer' : 'coding-timer';
  const timerTextId = type === 'mcq' ? 'mcq-timer-text' : 'coding-timer-text';

  function updateDisplay() {
    const mins = Math.floor(state.timeLeft / 60);
    const secs = state.timeLeft % 60;
    const text = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    const timerEl = document.getElementById(timerId);
    const timerText = document.getElementById(timerTextId);

    if (timerText) timerText.textContent = text;

    if (timerEl) {
      timerEl.className = 'timer-display';
      const pct = state.timeLeft / state.totalTime;
      if (pct <= 0.1) timerEl.classList.add('critical');
      else if (pct <= 0.25) timerEl.classList.add('warning');
    }
  }

  updateDisplay();

  state.timerInterval = setInterval(() => {
    state.timeLeft--;
    updateDisplay();

    if (state.timeLeft <= 0) {
      stopTimer();
      showToast('error', 'Time\'s up! Submitting your test...');
      setTimeout(() => {
        if (type === 'mcq') submitMCQTest();
        else submitCode();
      }, 1500);
    }
  }, 1000);
}

function stopTimer() {
  if (state.timerInterval) {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

// =============================================
// LOADING
// =============================================
function showLoading(show) {
  const overlay = document.getElementById('loading-overlay');
  if (overlay) overlay.classList.toggle('active', show);
}

// =============================================
// TOAST
// =============================================
function showToast(type, message) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const icons = { success: '✅', error: '❌', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'none';
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(120%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// =============================================
// MONGODB MANAGEMENT
// =============================================
async function updateDashboardStats() {
  const mcqEl = document.getElementById('stat-mcq-count');
  const codingEl = document.getElementById('stat-coding-count');
  const smeCountEl = document.getElementById('stat-sme-count');
  const totalEl = document.getElementById('stat-total-questions');
  const smeContainer = document.getElementById('dashboard-sme-stats');
  const activityContainer = document.getElementById('dashboard-recent-activity');
  const smeSearch = document.getElementById('sme-search');

  // Content Mix elements
  const mixMcqBar = document.getElementById('mix-mcq-bar');
  const mixCodingBar = document.getElementById('mix-coding-bar');
  const mixMcqLabel = document.getElementById('mix-mcq-label');
  const mixCodingLabel = document.getElementById('mix-coding-label');

  if (!mcqEl) return;

  // Efficiency: Cache-lookahead (Don't refetch if synced in last 30s)
  const now = Date.now();
  const isStale = now - state.lastStatsFetch > 30000;
  if (!isStale && !force) return;

  try {
    const response = await fetch('/api/stats');
    if (!response.ok) throw new Error();
    const data = await response.json();
    state.lastStatsFetch = now;

    // Update timestamp
    const timeEl = document.getElementById('dashboard-last-updated');
    if (timeEl) timeEl.textContent = `Last synced: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const total = (data.mcqCount || 0) + (data.codingCount || 0);

    // Update main counters
    mcqEl.textContent = (data.mcqCount || 0).toLocaleString();
    codingEl.textContent = (data.codingCount || 0).toLocaleString();
    if (smeCountEl) smeCountEl.textContent = data.smeStats ? data.smeStats.length : 0;
    if (totalEl) totalEl.textContent = total.toLocaleString();

    // Update Content Mix
    if (mixMcqBar && mixCodingBar) {
      const mcqPercent = total > 0 ? (data.mcqCount / total) * 100 : 50;
      const codingPercent = total > 0 ? (data.codingCount / total) * 100 : 50;

      mixMcqBar.style.width = `${mcqPercent}%`;
      mixCodingBar.style.width = `${codingPercent}%`;

      if (mixMcqLabel) mixMcqLabel.textContent = `MCQs: ${Math.round(mcqPercent)}%`;
      if (mixCodingLabel) mixCodingLabel.textContent = `Coding: ${Math.round(codingPercent)}%`;
    }

    // Update Recent Activity
    if (activityContainer && data.recentActivity) {
      if (data.recentActivity.length === 0) {
        activityContainer.innerHTML = `<div class="empty-state-v2">No recent generation activity found</div>`;
      } else {
        activityContainer.innerHTML = data.recentActivity.map((act, idx) => `
          <div class="activity-item-v2" style="animation-delay: ${idx * 0.1}s">
            <div class="activity-icon-v2 ${act.type}">${act.type === 'mcq' ? '📝' : '💻'}</div>
            <div class="activity-details-v2">
              <div class="activity-text-v2"><strong>${act.type.toUpperCase()}</strong> added to <span class="topic-tag-v2">${act.subtopic}</span></div>
              <div class="activity-meta-v2">
                <span class="meta-tag-v2 ${act.difficulty}">${act.difficulty.toUpperCase()}</span>
                <span class="meta-time-v2">• Created ${new Date(act.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        `).join('');
      }
    }

  } catch (err) {
    console.warn('Dashboard sync failed:', err);
  }
}

async function fetchAndRenderSavedQuestions(force = false) {
  const container = document.getElementById('questions-table-container');
  if (!container) return;

  const now = Date.now();
  const isStale = now - state.lastQuestionsFetch > 60000;

  if (isStale || force || state.savedQuestions.length === 0) {
    container.innerHTML = `
      <div class="loading-state" style="padding: 100px; text-align: center;">
          <span class="spinner"></span>
          <p style="margin-top: 15px;">Syncing question bank...</p>
      </div>
    `;
    try {
      const response = await fetch('/api/questions');
      if (!response.ok) throw new Error();
      state.savedQuestions = await response.json();
      state.lastQuestionsFetch = now;
      populateFilterDropdowns(); // Update dynamic dropdowns
    } catch (error) {
      console.error(error);
      container.innerHTML = `<div class="empty-state-v2">Failed to sync with cloud database.</div>`;
      return;
    }
  }

  applyFiltersAndRender();
}

function populateFilterDropdowns() {
  const sessions = new Map();
  const smes = new Set();

  // Collect unique sessions and SMEs (order of insertion preserved)
  state.savedQuestions.forEach(q => {
    if (q.smeName) smes.add(q.smeName);
    if (q.sessionId) sessions.set(q.sessionId, q.sessionName || q.sessionId);
  });

  const populateDropdown = (inputId, listId, html) => {
    const list = document.getElementById(listId);
    if (list) list.innerHTML = html || '<div class="custom-dropdown-empty">No options</div>';
  };

  // Sessions Logic - Top 5 recent vs Older
  const sessionsArray = Array.from(sessions.entries()).reverse(); // Newest first
  const recentSessions = sessionsArray.slice(0, 5);
  const olderSessions = sessionsArray.slice(5);

  let sessionHtml = '<div class="custom-dropdown-item" data-value="">All Sessions</div>';
  if (recentSessions.length > 0) {
    sessionHtml += '<div style="padding: 8px 16px 4px 16px; font-size: 0.7rem; color: var(--primary-light); text-transform: uppercase; font-weight: bold;">Recent Sessions</div>';
    sessionHtml += recentSessions.map(([id, name]) => `<div class="custom-dropdown-item" data-value="${id}">${name} (${id})</div>`).join('');
  }
  if (olderSessions.length > 0) {
    sessionHtml += '<div style="padding: 8px 16px 4px 16px; font-size: 0.7rem; color: var(--primary-light); text-transform: uppercase; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 4px;">Older Sessions</div>';
    sessionHtml += olderSessions.map(([id, name]) => `<div class="custom-dropdown-item" data-value="${id}">${name} (${id})</div>`).join('');
  }
  populateDropdown('filter-session', 'list-filter-session', sessionHtml);

  // SMEs
  populateDropdown('filter-sme', 'list-filter-sme',
    '<div class="custom-dropdown-item" data-value="">All SMEs</div>' +
    Array.from(smes).map(sme => `<div class="custom-dropdown-item" data-value="${sme}">${sme}</div>`).join('')
  );

  // Type
  populateDropdown('filter-type', 'list-filter-type', `
    <div class="custom-dropdown-item" data-value="">All Types</div>
    <div class="custom-dropdown-item" data-value="mcq">MCQ</div>
    <div class="custom-dropdown-item" data-value="coding">Coding</div>
  `);

  // Category
  populateDropdown('filter-category', 'list-filter-category', `
    <div class="custom-dropdown-item" data-value="">All Categories</div>
    <div class="custom-dropdown-item" data-value="languages">Languages</div>
    <div class="custom-dropdown-item" data-value="subjects">Subjects</div>
    <div class="custom-dropdown-item" data-value="stacks">Stacks</div>
    <div class="custom-dropdown-item" data-value="frameworks">Frameworks</div>
  `);

  // Difficulty
  populateDropdown('filter-difficulty', 'list-filter-difficulty', `
    <div class="custom-dropdown-item" data-value="">All Difficulties</div>
    <div class="custom-dropdown-item" data-value="Easy">Easy</div>
    <div class="custom-dropdown-item" data-value="Medium">Medium</div>
    <div class="custom-dropdown-item" data-value="Hard">Hard</div>
  `);
}

function attachFilterListeners() {
  const customDropdowns = ['filter-session', 'filter-sme', 'filter-type', 'filter-category', 'filter-difficulty'];

  customDropdowns.forEach(id => {
    const input = document.getElementById(id);
    const list = document.getElementById(`list-${id}`);
    const container = document.getElementById(`container-${id}`);
    if (!input || !list || !container) return;

    // Show list
    input.addEventListener('focus', () => {
      document.querySelectorAll('.custom-dropdown-list.active').forEach(l => l !== list && l.classList.remove('active'));
      list.classList.add('active');
      // Reset filter options
      list.querySelectorAll('.custom-dropdown-item').forEach(item => item.style.display = 'block');
      list.querySelectorAll('div[style*="uppercase"]').forEach(el => el.style.display = 'block');
    });

    // Search logic
    input.addEventListener('input', (e) => {
      if (input.classList.contains('readonly-mode')) return;
      const searchTerm = e.target.value.toLowerCase();
      input.dataset.value = ''; // Reset value indicating custom typing

      let hasVisible = false;
      list.querySelectorAll('.custom-dropdown-item').forEach(item => {
        if (item.dataset.value === '' && searchTerm.length > 0) {
          // Hide "All ..." options when searching
          item.style.display = 'none';
        } else if (item.textContent.toLowerCase().includes(searchTerm)) {
          item.style.display = 'block';
          hasVisible = true;
        } else {
          item.style.display = 'none';
        }
      });

      // Hide headers if searching
      list.querySelectorAll('div[style*="uppercase"]').forEach(el => {
        el.style.display = searchTerm.length > 0 ? 'none' : 'block';
      });

      list.classList.add('active');
      applyFiltersAndRender();
    });

    // Handle Selection
    list.addEventListener('click', (e) => {
      if (e.target.classList.contains('custom-dropdown-item')) {
        const val = e.target.dataset.value;
        const label = e.target.dataset.value === '' ? '' : e.target.textContent;
        // The placeholder handles the "All Options" text, so if cleared, leave it blank to show placeholder
        input.value = label;
        input.dataset.value = val;
        list.classList.remove('active');
        applyFiltersAndRender();
      }
    });

    // Click outside
    document.addEventListener('click', (e) => {
      if (!container.contains(e.target)) {
        list.classList.remove('active');
      }
    });
  });

  const filterIds = ['filter-topic', 'filter-date-start', 'filter-date-end'];
  filterIds.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.addEventListener('input', applyFiltersAndRender);
  });

  const clearBtn = document.getElementById('clear-filters-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      customDropdowns.forEach(id => {
        const input = document.getElementById(id);
        if (input) {
          input.value = '';
          input.dataset.value = '';
        }
      });
      filterIds.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.value = '';
      });
      applyFiltersAndRender();
    });
  }

  const exportBtn = document.getElementById('export-selected-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      const selectedIds = Array.from(document.querySelectorAll('.mq-checkbox:checked')).map(cb => cb.dataset.id);
      if (selectedIds.length === 0) return;
      const questionsToExport = state.savedQuestions.filter(q => selectedIds.includes(q._id));

      const hasCoding = questionsToExport.some(q => q.type === 'coding');
      if (hasCoding) {
        // Build a unique ZIP download structure
        downloadAsZip({ title: 'Exported_Questions', subtopic: 'Export', starterCode: {}, textExportMode: true, exportedQuestions: questionsToExport });
      } else {
        downloadQuestions(questionsToExport, 'mcq', 'md');
      }
    });
  }
}

function applyFiltersAndRender() {
  const container = document.getElementById('questions-table-container');
  if (!container) return;

  // Custom dropdowns fallback to typing if data-value isn't set, except readonlys
  const getInputVal = (id) => {
    const el = document.getElementById(id);
    if (!el) return '';
    if (el.dataset.value !== undefined && el.dataset.value !== '') return el.dataset.value.toLowerCase();
    return el.classList.contains('readonly-mode') ? '' : el.value.toLowerCase();
  };

  const fSession = getInputVal('filter-session');
  const fSme = getInputVal('filter-sme');
  const fType = getInputVal('filter-type');
  const fCategory = getInputVal('filter-category');
  const fDiff = getInputVal('filter-difficulty');

  const fTopic = (document.getElementById('filter-topic')?.value || '').toLowerCase();
  const fStart = document.getElementById('filter-date-start')?.value;
  const fEnd = document.getElementById('filter-date-end')?.value;

  const filtered = state.savedQuestions.filter(q => {
    // Exact or loose match depending on if selected from dropdown or manually typed
    if (fSession) {
      const sessionSearch = fSession;
      const qSessionId = (q.sessionId || '').toLowerCase();
      const qSessionName = (q.sessionName || '').toLowerCase();
      if (!qSessionId.includes(sessionSearch) && !qSessionName.includes(sessionSearch)) return false;
    }

    if (fSme) {
      const smeSearch = fSme;
      const qSmeName = (q.smeName || '').toLowerCase();
      if (!qSmeName.includes(smeSearch)) return false;
    }

    if (fType && (q.type || '').toLowerCase() !== fType) return false;
    if (fCategory && (q.category || '').toLowerCase() !== fCategory) return false;
    if (fDiff && (q.difficulty || '').toLowerCase() !== fDiff) return false;

    if (fTopic) {
      const txt = ((q.subtopic || '') + ' ' + (q.title || '') + ' ' + (q.question || '')).toLowerCase();
      if (!txt.includes(fTopic)) return false;
    }

    if (fStart || fEnd) {
      const qDate = new Date(q.createdAt);
      if (fStart && qDate < new Date(fStart)) return false;
      if (fEnd) {
        const endDate = new Date(fEnd);
        endDate.setHours(23, 59, 59, 999);
        if (qDate > endDate) return false;
      }
    }

    return true;
  });

  // Reset pagination if filters are actively used (so users don't get stuck on an empty page 2)
  if (fSession || fSme || fType || fCategory || fDiff || fTopic || fStart || fEnd) {
    state.mqPagination.sessionPage = 1;
  }

  renderQuestionsTable(filtered);
}

function renderQuestionsTable(questions) {
  const container = document.getElementById('questions-table-container');
  if (!container) return;

  if (questions.length === 0) {
    container.innerHTML = `<div class="empty-state-v2">No questions match your current filters.</div>`;
    return;
  }

  // Group by session and calculate latest date for sorting
  const groups = {};
  questions.forEach(q => {
    const sId = q.sessionId || 'ungrouped';
    if (!groups[sId]) {
      groups[sId] = {
        name: q.sessionName || (sId === 'ungrouped' ? 'All Questions' : sId),
        id: sId,
        items: [],
        latestDate: 0
      };
    }
    groups[sId].items.push(q);

    // Track most recent item in group for sorting capabilities
    const qDate = new Date(q.createdAt).getTime();
    if (qDate > groups[sId].latestDate) {
      groups[sId].latestDate = qDate;
    }
  });

  // Sort items within each group: newest first
  Object.values(groups).forEach(group => {
    group.items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  });

  // Convert to array and sort: Ungrouped first, then mostly recently generated overall
  const groupArray = Object.values(groups).sort((a, b) => {
    if (a.id === 'ungrouped') return -1;
    if (b.id === 'ungrouped') return 1;
    return b.latestDate - a.latestDate;
  });

  // --- Session Pagination (Global) ---
  const totalSessionPages = Math.ceil(groupArray.length / state.mqPagination.sessionsPerPage) || 1;
  // Failsafe bounds
  if (state.mqPagination.sessionPage > totalSessionPages) state.mqPagination.sessionPage = totalSessionPages;
  if (state.mqPagination.sessionPage < 1) state.mqPagination.sessionPage = 1;

  const sessionStartIdx = (state.mqPagination.sessionPage - 1) * state.mqPagination.sessionsPerPage;
  const sessionEndIdx = sessionStartIdx + state.mqPagination.sessionsPerPage;
  const paginatedGroups = groupArray.slice(sessionStartIdx, sessionEndIdx);

  // --- HTML Build ---
  let html = '';

  paginatedGroups.forEach(group => {
    // Hide session groups — only show ungrouped ("All Questions")
    if (group.id !== 'ungrouped') return;
    // Formatting Timestamp nicely
    const dateObj = new Date(group.latestDate);
    const timeStr = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const dateStr = dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
    const formattedDate = group.latestDate > 0 ? `${dateStr}, ${timeStr}` : 'Unknown Date';

    // Default: collapsed. Only expanded if user explicitly clicked to open.
    const isCollapsed = state.collapsedGroups[group.id] !== false;

    // --- Item Pagination (Internal) ---
    const totalItems = group.items.length;
    let currentItemPage = state.mqPagination.groupPages[group.id] || 1;
    const totalItemPages = Math.ceil(totalItems / state.mqPagination.itemsPerPage) || 1;
    if (currentItemPage > totalItemPages) currentItemPage = totalItemPages;
    if (currentItemPage < 1) currentItemPage = 1;

    const itemStartIdx = (currentItemPage - 1) * state.mqPagination.itemsPerPage;
    const itemEndIdx = itemStartIdx + state.mqPagination.itemsPerPage;
    const paginatedItems = group.items.slice(itemStartIdx, itemEndIdx);

    html += `
    <div class="session-group-card" style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 24px; overflow: hidden; transition: all 0.3s ease;">
      <div style="background: rgba(255,255,255,0.02); padding: 12px 20px; border-bottom: ${isCollapsed ? 'none' : '1px solid var(--border)'}; display: flex; justify-content: space-between; align-items: center; cursor: pointer; transition: background 0.2s ease;" onclick="toggleGroupCollapse('${group.id}')" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">
        
        <div style="display: flex; align-items: center; gap: 15px;">
           <span style="font-size: 1.2rem; display: inline-block; width: 20px; transition: transform 0.3s ease; transform: ${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; color: var(--primary-light);">▼</span>
           <div>
             <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
               <input type="checkbox" class="session-checkbox" data-session="${group.id}" style="accent-color: var(--primary); cursor: pointer; width: 16px; height: 16px;" title="Select all in session (Even hidden pages)" onclick="event.stopPropagation();">
               <span style="font-weight: 600;">${group.name}</span>
               <span class="badge badge-primary" style="font-size: 0.7rem; background: rgba(99, 102, 241, 0.15); color: var(--primary-light);">${totalItems} Items</span>
             </h3>
             <div style="display: flex; gap: 12px; font-family: monospace; font-size: 0.75rem; color: var(--text-secondary); margin-top: 6px; padding-left: 24px;">
                ${group.id !== 'ungrouped' ? `<span>ID: <span style="opacity: 0.7;">${group.id}</span></span>` : ''}
                ${group.id !== 'ungrouped' && group.latestDate > 0 ? `<span style="opacity: 0.5;">|</span> <span>🕒 ${formattedDate}</span>` : ''}
             </div>
           </div>
        </div>
        
        <div style="display: flex; gap: 8px;" onclick="event.stopPropagation();">
          ${group.id !== 'ungrouped' ? `
            <button class="btn btn-secondary btn-sm" onclick="renameSession('${group.id}', '${group.name.replace(/'/g, "\\'")}')" style="background: transparent; border: 1px solid rgba(255,255,255,0.1);">Rename</button>
            <button class="btn btn-secondary btn-sm" onclick="exportSession('${group.id}')" style="background: transparent; border: 1px solid rgba(255,255,255,0.1);">Export ZIP</button>
            <button class="btn btn-danger btn-sm" onclick="deleteSession('${group.id}')" style="background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); color: var(--danger-light);">Delete Session</button>
          ` : ''}
        </div>

      </div>
      
      <div id="col-body-${group.id}" style="display: ${isCollapsed ? 'none' : 'block'};">
        <div class="table-responsive" style="margin: 0; border: none; background: transparent;">
          <table class="admin-table" style="margin: 0;">
            <thead>
              <tr>
                 <th style="width: 40px; text-align: center;">✓</th>
                <th>Type</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>SME</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedItems.map(q => `
                <tr id="q-row-${q._id}">
                  <td style="text-align: center;">
                     <input type="checkbox" class="mq-checkbox" data-id="${q._id}" data-session="${group.id}" style="accent-color: var(--primary); cursor: pointer; width: 16px; height: 16px;">
                  </td>
                  <td><span class="badge badge-${q.type}">${q.type.toUpperCase()}</span></td>
                  <td><div style="font-weight: 600; color: var(--text-primary);">${q.subtopic}</div><div style="font-size: 0.75rem; opacity: 0.7;">${q.title || (q.question ? q.question.substring(0, 50) + '...' : 'No description available')}</div></td>
                  <td><span class="diff-tag ${q.difficulty}">${q.difficulty}</span></td>
                  <td style="opacity: 0.8;"><div>${q.smeName || 'System'}</div><div style="font-size: 0.7rem; opacity: 0.6; margin-top: 2px;">🕒 ${new Date(q.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}, ${new Date(q.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div></td>
                  <td>
                    <div style="display: flex; gap: 8px;">
                      <button class="btn btn-secondary btn-sm" onclick="editSavedQuestion('${q._id}')" style="padding: 4px 8px; font-size: 0.75rem;">👁️ View</button>
                      <button class="btn btn-secondary btn-sm" onclick="downloadSavedQuestion('${q._id}')" style="padding: 4px 8px; font-size: 0.75rem;">${q.type === 'coding' ? '📦 ZIP' : '⬇️ Download'}</button>
                      <button class="btn btn-danger btn-sm" onclick="this.disabled=true; deleteSavedQuestion('${q._id}')" style="padding: 4px 8px; font-size: 0.75rem; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); color: var(--danger-light);">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        
        ${totalItemPages > 1 ? `
        <div style="padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.15);">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">Showing ${(itemStartIdx + 1)} - ${Math.min(itemEndIdx, totalItems)} of ${totalItems} questions in this block</span>
          <div style="display: flex; gap: 5px; align-items: center;">
             <button class="btn btn-secondary btn-sm" onclick="changeMqGroupPage('${group.id}', ${currentItemPage - 1})" ${currentItemPage === 1 ? 'disabled' : ''} style="padding: 2px 8px; font-size: 0.8rem;">&lt;</button>
             <span style="font-size: 0.8rem; margin: 0 8px;">Page ${currentItemPage} / ${totalItemPages}</span>
             <button class="btn btn-secondary btn-sm" onclick="changeMqGroupPage('${group.id}', ${currentItemPage + 1})" ${currentItemPage === totalItemPages ? 'disabled' : ''} style="padding: 2px 8px; font-size: 0.8rem;">&gt;</button>
          </div>
        </div>
        ` : ''}

      </div>
    </div>
    `;
  });

  // Global Session Pagination Bar
  if (totalSessionPages > 1 || state.mqPagination.sessionPage > 1) {
    html += `
       <div class="global-pagination-bar" style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 30px; margin-bottom: 20px; padding: 15px; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid var(--border);">
          <button class="btn btn-secondary btn-sm" onclick="changeMqSessionPage(${state.mqPagination.sessionPage - 1})" ${state.mqPagination.sessionPage === 1 ? 'disabled' : ''}>← Previous Page</button>
          <span style="font-weight: bold; color: var(--primary-light);">Session Block ${state.mqPagination.sessionPage} of ${totalSessionPages}</span>
          <button class="btn btn-secondary btn-sm" onclick="changeMqSessionPage(${state.mqPagination.sessionPage + 1})" ${state.mqPagination.sessionPage === totalSessionPages ? 'disabled' : ''}>Next Page →</button>
       </div>
     `;
  }

  container.innerHTML = html;

  // Re-attach Checkbox Listeners (Preserved functionality)
  const sessionCbs = container.querySelectorAll('.session-checkbox');
  const itemCbs = container.querySelectorAll('.mq-checkbox');
  const exportBtn = document.getElementById('export-selected-btn');

  const updateExportBtn = () => {
    // Note: Due to pagination, we can only safely export items currently visible unless stored in a deeper selection buffer state. 
    // The current limitation export logic is inherently constrained to what checkboxes are physically rendered.
    const cnt = document.querySelectorAll('#questions-table-container .mq-checkbox:checked').length;
    if (exportBtn) {
      exportBtn.disabled = cnt === 0;
      exportBtn.textContent = `📦 Export Selected (${cnt})`;
    }
  };

  sessionCbs.forEach(scb => {
    scb.addEventListener('change', (e) => {
      const sId = e.target.dataset.session;
      const isChecked = e.target.checked;

      // Select all currently VISIBLE checkboxes in this group
      container.querySelectorAll(`.mq-checkbox[data-session="${sId}"]`).forEach(cb => {
        cb.checked = isChecked;
      });
      updateExportBtn();
    });
  });

  itemCbs.forEach(cb => {
    cb.addEventListener('change', (e) => {
      const sId = e.target.dataset.session;
      const groupCbs = Array.from(container.querySelectorAll(`.mq-checkbox[data-session="${sId}"]`));
      const sessCb = document.querySelector(`.session-checkbox[data-session="${sId}"]`);
      if (sessCb) {
        sessCb.checked = groupCbs.every(c => c.checked) && groupCbs.length > 0;
      }
      updateExportBtn();
    });
  });
}

// =============================================
// PAGINATION & UI TOGGLE GLOBALS
// =============================================

window.toggleGroupCollapse = (groupId) => {
  if (state.collapsedGroups[groupId] === false) {
    delete state.collapsedGroups[groupId]; // Re-collapse (back to default)
  } else {
    state.collapsedGroups[groupId] = false; // Expand
  }
  // Re-render directly with current visual filters
  applyFiltersAndRender();
};

window.changeMqSessionPage = (newPage) => {
  state.mqPagination.sessionPage = newPage;
  // Scroll to top of table gently
  const container = document.getElementById('questions-table-container');
  if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
  applyFiltersAndRender();
};

window.changeMqGroupPage = (groupId, newPage) => {
  state.mqPagination.groupPages[groupId] = newPage;
  applyFiltersAndRender();
};

// Ensure filter listeners attach when the tab is accessed or globally initialized
document.addEventListener('DOMContentLoaded', () => { setTimeout(attachFilterListeners, 500); });


window.renameSession = async (sessionId, currentName) => {
  const newName = prompt('Enter a new name for this session:', currentName);
  if (!newName || newName.trim() === '' || newName === currentName) return;

  try {
    const response = await fetch(`/api/questions/session/${sessionId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sessionName: newName.trim() })
    });

    if (response.ok) {
      showToast('success', 'Session renamed successfully!');
      fetchAndRenderSavedQuestions(true); // Force refetch to update all group labels
    } else {
      throw new Error('Failed to rename session');
    }
  } catch (error) {
    console.error(error);
    showToast('error', error.message);
  }
};

window.exportSession = (sessionId) => {
  const sessionQuestions = state.savedQuestions.filter(q => q.sessionId === sessionId);
  if (sessionQuestions.length === 0) {
    showToast('error', 'No questions found for this session.');
    return;
  }

  const hasCoding = sessionQuestions.some(q => q.type === 'coding');
  const sessionName = sessionQuestions[0].sessionName || sessionId;

  if (hasCoding) {
    // Treat as a mixed batch export logic (requires downloadAsZip support for multiple/mixed formats)
    downloadAsZip({
      title: sessionName,
      subtopic: 'Session Export',
      starterCode: {}, // Dummy object
      textExportMode: true,
      exportedQuestions: sessionQuestions
    });
  } else {
    // Pure MCQ markdown export
    downloadQuestions(sessionQuestions, 'mcq', 'md');
  }
};

window.deleteSession = async (sessionId) => {
  if (!confirm('Are you sure you want to delete ALL questions in this session? This action cannot be undone.')) return;

  try {
    const response = await fetch(`/api/questions/session/${sessionId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      showToast('success', 'Session deleted successfully!');
      fetchAndRenderSavedQuestions(true); // Force refetch
      updateDashboardStats();
    } else {
      throw new Error('Failed to delete session');
    }
  } catch (error) {
    console.error(error);
    showToast('error', error.message);
  }
};

window.deleteSavedQuestion = async (mongoId) => {
  try {
    const response = await fetch(`/api/questions/${mongoId}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      const row = document.getElementById(`q-row-${mongoId}`);
      if (row) {
        row.style.opacity = '0';
        row.style.transform = 'translateX(-20px)';
        row.style.transition = 'all 0.4s ease';
        setTimeout(() => row.remove(), 400);
      }
      showToast('success', 'Question deleted successfully');
      updateDashboardStats();
    } else {
      throw new Error('Delete failed');
    }
  } catch (error) {
    console.error(error);
    showToast('error', 'Failed to delete: ' + error.message);
    fetchAndRenderSavedQuestions(); // Refresh to restore UI state
  }
};

// =============================================
// INIT
// =============================================
renderApp();
function showAIAnalysisModal(evaluation) {
  const modal = document.getElementById('common-modal');
  if (!modal) return;

  const isLast = state.currentQuestion >= state.questions.length - 1;

  modal.innerHTML = `
    <div class="modal-content analysis-modal" style="animation: slideIn 0.4s easeOut;">
      <div class="modal-header">
        <h3 style="display: flex; align-items: center; gap: 10px;">
           <span style="font-size: 1.5rem">${evaluation.passed ? '🎉' : '💡'}</span> 
           AI Solution Analysis
        </h3>
        <button class="close-btn" id="close-analysis-btn">×</button>
      </div>
      
      <div class="modal-body">
        <div class="analysis-section" style="border-left: 4px solid ${evaluation.passed ? '#10b981' : '#f59e0b'}">
           <div class="analysis-title">📊 Submission Status</div>
           <div class="analysis-body">
             <div style="font-size: 1.1rem; font-weight: 700; margin-bottom: 5px;">${evaluation.passed ? 'ACCEPTED' : 'REJECTED'}</div>
             <p>${evaluation.summary}</p>
             <div class="complexity-badge">${evaluation.analysis.timeComplexity} Time | ${evaluation.analysis.spaceComplexity} Space</div>
           </div>
        </div>

        <div class="analysis-section">
           <div class="analysis-title">🧠 Optimized Approach</div>
           <div class="analysis-body">${evaluation.analysis.optimizedApproach}</div>
        </div>

        <div class="analysis-section">
           <div class="analysis-title">✨ AI Visualization</div>
           <div class="analysis-body" style="font-family: var(--font-mono); font-size: 0.85rem; line-height: 1.4; background: rgba(0,0,0,0.4); padding: 15px; border-radius: 8px; white-space: pre-wrap;">${evaluation.analysis.visualization}</div>
        </div>

        <div class="analysis-section">
           <div class="analysis-title">🎓 Feedback from SME AI</div>
           <div class="analysis-body">${evaluation.feedback}</div>
        </div>
      </div>

      <div class="modal-footer" style="display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px;">
        <button class="btn btn-secondary" id="analysis-close-only">Review Code</button>
        <button class="btn btn-primary" id="analysis-next-btn">
          ${isLast ? 'Finish Test & Results' : 'Next Challenge →'}
        </button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const close = () => { modal.classList.remove('active'); };
  document.getElementById('close-analysis-btn').onclick = close;
  document.getElementById('analysis-close-only').onclick = close;

  document.getElementById('analysis-next-btn').onclick = () => {
    close();
    if (isLast) {
      stopTimer();
      const correct = state.codingResults.filter(r => r).length;
      showResultPage(correct, state.questions.length, 'coding');
    } else {
      state.currentQuestion++;
      state.problem = state.questions[state.currentQuestion];
      state.selectedTestCaseIndex = 0;

      const diffLabel = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
      const diffEl = document.getElementById('coding-difficulty-label');
      if (diffEl) diffEl.textContent = `${diffLabel} · Problem ${state.currentQuestion + 1}`;

      renderCodingProblem();
      showToast('success', 'Moving to next problem');
    }
  };
}

