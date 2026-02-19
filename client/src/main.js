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
  groqKey: localStorage.getItem('groq_key') || '',
  groqModel: localStorage.getItem('groq_model') || 'llama-3.3-70b-versatile',
  codingResults: [], // Track pass/fail for each problem
  codingHints: [], // Store AI hints
};

// =============================================
// RENDER APP SHELL
// =============================================
function renderApp() {
  document.getElementById('app').innerHTML = `
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
    <div id="landing-view" class="home-container">
      <div class="home-logo">
        <div class="logo-icon">🧠</div>
        <h1 class="home-title">AI Mock Test Generator</h1>
        <p class="landing-desc">
          Master your coding and technical skills with AI-powered assessments. <br>
          Generate customized mock tests and get instant performance insights.
        </p>
      </div>

      <div class="landing-actions">
        <button class="btn btn-primary btn-lg" id="goto-practice-btn" style="min-width: 220px;">
          🎓 Practice Portal
        </button>
        <button class="btn btn-secondary btn-lg" id="goto-admin-landing-btn" style="min-width: 220px;">
          ⚙️ Admin Portal
        </button>
      </div>

      <div class="home-features" style="margin-top: 20px;">
        <div class="feature-chip"><span>⏱️</span><span>Timed Tests</span></div>
        <div class="feature-chip"><span>📊</span><span>Instant Results</span></div>
        <div class="feature-chip"><span>🎯</span><span>3 Difficulty Levels</span></div>
        <div class="feature-chip"><span>💡</span><span>AI-Powered</span></div>
      </div>
    </div>

    <div id="selection-view" class="home-container" style="display: none;">
      <div class="home-logo" style="margin-bottom: 0;">
        <div class="logo-icon" style="width: 50px; height: 50px; border-radius: 14px; font-size: 1.4rem;">🧠</div>
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
            <span class="nav-icon">📚</span> Manage Questions
          </button>
          <button class="nav-item" data-tab="settings">
            <span class="nav-icon">⚙️</span> Settings
          </button>
        </nav>
        <div class="sidebar-footer">
          <button class="btn btn-secondary btn-sm w-full" id="admin-back-btn">
            ← Exit Admin
          </button>
        </div>
      </aside>

      <!-- Admin Main Content -->
      <main class="admin-main">
        <!-- Dashboard Tab -->
        <div id="tab-dashboard" class="admin-tab active">
          <header class="admin-header">
            <h2 class="admin-title">Dashboard Overview</h2>
            <div class="admin-actions">
              <span class="status-badge">🟢 System Online</span>
            </div>
          </header>
          
          <div class="admin-stats-grid">
            <div class="stat-box">
              <div class="stat-icon">👤</div>
              <div class="stat-info">
                <div class="stat-value">1,248</div>
                <div class="stat-label">Total Users</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">📝</div>
              <div class="stat-info">
                <div class="stat-value">458</div>
                <div class="stat-label">MCQ Questions</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">💻</div>
              <div class="stat-info">
                <div class="stat-value">82</div>
                <div class="stat-label">Coding Problems</div>
              </div>
            </div>
            <div class="stat-box">
              <div class="stat-icon">✅</div>
              <div class="stat-info">
                <div class="stat-value">98.5%</div>
                <div class="stat-label">Uptime</div>
              </div>
            </div>
          </div>

          <div class="card card-glass" style="margin-top: 24px;">
            <p class="card-title">Recent Activity</p>
            <div style="opacity: 0.7; padding: 20px; text-align: center;">
              No recent activity to display.
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

              <div class="form-group">
                <label class="form-label">Authorized SME Name</label>
                <input type="text" class="form-input" id="gen-sme" placeholder="Enter your name (e.g. Dr. Smith)...">
              </div>

              <button class="btn btn-primary btn-lg w-full" id="generate-questions-btn" style="margin-top: 8px;">
                ✨ Generate Questions
              </button>
            </div>

            <div class="generator-preview">
              <div class="card card-glass preview-card">
                <div class="preview-header">
                  <span class="preview-title">Preview</span>
                  <button class="btn btn-secondary btn-sm" id="save-generated-btn" disabled>Save to Database</button>
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

        <!-- Questions Tab (Placeholder) -->
        <div id="tab-questions" class="admin-tab">
           <header class="admin-header">
            <h2 class="admin-title">Manage Questions</h2>
            <div style="display: flex; gap: 10px;">
                <button class="btn btn-secondary btn-sm" id="refresh-questions-btn">🔄 Refresh Path</button>
            </div>
          </header>
          <div class="card card-glass questions-list-card">
            <div id="questions-table-container">
                <div style="padding: 40px; text-align: center;">
                    <span class="spinner"></span>
                    <p style="margin-top: 15px; opacity: 0.7;">Fetching questions from MongoDB...</p>
                </div>
            </div>
          </div>
        </div>

        <!-- Settings Tab -->
        <div id="tab-settings" class="admin-tab">
           <header class="admin-header">
            <h2 class="admin-title">Admin Settings</h2>
          </header>
          <div class="card card-glass" style="max-width: 600px;">
            <div class="form-group">
              <label class="form-label">Groq API Key</label>
              <div style="display: flex; gap: 10px;">
                <input type="password" class="form-input" id="groq-api-key" placeholder="gsk_..." value="${state.groqKey}" style="flex: 1;">
                <button class="btn btn-primary btn-sm" id="save-settings-btn">Save</button>
              </div>
              <p style="font-size: 0.75rem; color: var(--text-secondary); margin-top: 8px;">
                Get your free API key at <a href="https://console.groq.com/keys" target="_blank" style="color: var(--primary-light); text-decoration: underline;">Groq Console</a>.
              </p>
            </div>
            <div class="form-group" style="margin-top: 24px;">
              <label class="form-label">AI Model</label>
              <select class="form-select" id="groq-model-select" style="width: 100%;">
                <option value="llama-3.3-70b-versatile" ${state.groqModel === 'llama-3.3-70b-versatile' ? 'selected' : ''}>Llama 3.3 70B (SOTA / Versatile)</option>
                <option value="llama-3.1-8b-instant" ${state.groqModel === 'llama-3.1-8b-instant' ? 'selected' : ''}>Llama 3.1 8B (Fast / Lightweight)</option>
                <option value="mixtral-8x7b-32768" ${state.groqModel === 'mixtral-8x7b-32768' ? 'selected' : ''}>Mixtral 8x7B (High Context)</option>
              </select>
            </div>
            <div style="margin-top: 30px; padding: 15px; background: rgba(99, 102, 241, 0.1); border-radius: 8px; border-left: 4px solid var(--primary);">
              <p style="font-size: 0.85rem; line-height: 1.5;">
                <strong>💡 Note:</strong> Your API key is stored locally in your browser and is only used to make requests to Groq. 
              </p>
            </div>
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
    <div class="exam-header">
      <div class="exam-header-left">
        <div class="exam-logo-sm">💻</div>
        <div>
          <div class="exam-title-sm">Coding Test</div>
          <div class="exam-subtitle-sm" id="coding-difficulty-label">Medium · Problem 1</div>
        </div>
      </div>
      <div class="exam-header-right" style="display: flex; align-items: center; gap: 15px;">
        <div class="timer-display" id="coding-timer">
          <span class="timer-icon">⏱️</span>
          <span id="coding-timer-text">45:00</span>
        </div>
        <button class="btn btn-secondary btn-sm" id="coding-exit-btn" style="border-color: rgba(239, 68, 68, 0.3); color: var(--danger-light); background: rgba(239, 68, 68, 0.05);">
          Exit Test
        </button>
      </div>
    </div>

    <div class="coding-body">
      <!-- Problem Panel -->
      <div class="problem-panel" id="problem-panel">
        <div>
          <h2 class="problem-title" id="problem-title">Loading Problem...</h2>
          <div class="problem-meta" id="problem-meta">
            <span class="badge badge-warning">Medium</span>
          </div>
        </div>

        <div>
          <p class="problem-section-title">📋 Description</p>
          <p class="problem-description" id="problem-description">Loading...</p>
        </div>

        <div id="problem-examples">
          <!-- Examples rendered dynamically -->
        </div>

        <div>
          <p class="problem-section-title">⚠️ Constraints</p>
          <ul class="constraints-list" id="problem-constraints">
            <!-- Constraints rendered dynamically -->
          </ul>
        </div>
      </div>

      <!-- Editor Panel -->
      <div class="editor-panel">
        <div class="editor-toolbar">
          <div class="editor-toolbar-left">
            <span style="font-size:0.85rem; color:var(--text-muted); font-weight:600;">Language:</span>
            <select class="lang-select" id="lang-select">
              <option value="python">🐍 Python</option>
              <option value="java">☕ Java</option>
              <option value="cpp">⚡ C++</option>
              <option value="sql">🗄️ SQL</option>
              <option value="c">🔧 C</option>
            </select>
          </div>
          <div class="editor-toolbar-right">
            <button class="btn btn-secondary btn-sm" id="run-code-btn">
              ▶ Run Code
            </button>
            <button class="btn btn-success btn-sm" id="submit-code-btn">
              ✓ Submit
            </button>
          </div>
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
function attachAdminListeners() {
  const backBtn = document.getElementById('admin-back-btn');
  if (backBtn) {
    backBtn.addEventListener('click', () => {
      showPage('home-page');
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
        }
      }
    });
  });

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
          const response = await fetch('http://localhost:5000/api/questions/bulk', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              questions: state.lastGenerated,
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
        } catch (error) {
          console.error(error);
          showToast('error', 'Database Save Failed: ' + error.message);
          saveBtn.disabled = false;
          saveBtn.innerHTML = `💾 Save to Database`;
        }
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
    };

    catSelect.addEventListener('change', updateSubtopics);
    updateSubtopics(); // Init
  }

  // Type toggle listeners
  const typeSegments = document.querySelectorAll('.type-segment');
  if (typeSegments.length > 0) {
    typeSegments.forEach(seg => {
      seg.addEventListener('click', () => {
        typeSegments.forEach(s => s.classList.remove('active'));
        seg.classList.add('active');
      });
    });
  }

  // Settings listeners
  const saveSettingsBtn = document.getElementById('save-settings-btn');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', () => {
      const key = document.getElementById('groq-api-key').value.trim();
      const model = document.getElementById('groq-model-select').value;

      state.groqKey = key;
      state.groqModel = model;

      localStorage.setItem('groq_key', key);
      localStorage.setItem('groq_model', model);

      showToast('success', 'Settings saved successfully!');
    });
  }
}

async function handleGenerateClick() {
  if (!state.groqKey) {
    showToast('error', 'Groq API Key missing! Please add it in Settings.');
    const settingsTab = document.querySelector('[data-tab="settings"]');
    if (settingsTab) settingsTab.click();
    return;
  }

  const category = document.getElementById('gen-category').value;
  const subtopic = document.getElementById('gen-subtopic').value;
  const specificTopic = document.getElementById('gen-topic').value.trim();
  const activeSegment = document.querySelector('.type-segment.active');
  const type = activeSegment ? activeSegment.dataset.value : 'mcq';
  const difficulty = document.getElementById('gen-difficulty').value;
  const count = parseInt(document.getElementById('gen-count').value);
  const smeName = document.getElementById('gen-sme').value || 'System Default';

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

  try {
    const generated = await generateAIQuestions(finalTopic, type, difficulty, count, category, subtopic, smeName);
    state.lastGenerated = generated;
    state.lastGeneratedType = type;

    renderGeneratedPreview(generated, type);
    showToast('success', `AI generated ${count} questions successfully!`);
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
    saveBtn.disabled = false;
  }
}

async function generateAIQuestions(topic, type, difficulty, count, category, subtopic, smeName) {
  const isMcq = type === 'mcq';
  const prompt = isMcq ?
    `Generate ${count} multiple choice questions about ${topic} at ${difficulty} level.
     Format as valid JSON array of objects.
     Each object MUST have:
     "question": string,
     "options": array of 4 strings,
     "correct": index (0-3),
     "explanation": string.
     Output ONLY the JSON array.` :
    `Generate ${count} coding challenges about ${topic} at ${difficulty} level.
     Format as valid JSON array of objects.
     Each object MUST have:
     "title": string,
     "description": string,
     "starterCode": string (valid initial code),
     "input": string (example input),
     "output": string (expected output),
     "timeLimit": string (in minutes),
     "constraints": array of strings.
     Keep instructions concise. Output ONLY the JSON array.`;

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${state.groqKey}`
    },
    body: JSON.stringify({
      model: state.groqModel,
      messages: [
        { role: 'system', content: 'You are an expert technical interviewer and SME. You output ONLY valid JSON.' },
        { role: 'user', content: prompt }
      ],
      temperature: 0.7,
      response_format: { type: 'json_object' }
    })
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error?.message || 'API request failed');
  }

  const data = await response.json();
  let content = data.choices[0].message.content;

  // Parse logic (handle potential wrapping or extra text if model ignores system instruction)
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
      difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
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
        q: `Which concept of ${topic} is primary in ${difficulty} operations?`,
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
        title: `${topic} Module ${i + 1}`,
        desc: `Implement ${topic} core logic for ${difficulty} level.`,
        starter: `def solve():\n    pass`,
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
    if (saveBtn) saveBtn.disabled = true;
    return;
  }

  container.innerHTML = `
    <div class="preview-controls" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; padding: 0 5px; border-bottom: 1px solid var(--border); padding-bottom: 15px;">
      <div style="display: flex; align-items: center; gap: 12px;">
        <input type="checkbox" id="select-all-gen" style="width: 18px; height: 18px; cursor: pointer; accent-color: var(--primary);">
        <label for="select-all-gen" style="font-size: 0.9rem; cursor: pointer; user-select: none; font-weight: 600;">Select All (${questions.length})</label>
      </div>
      <button class="btn btn-danger btn-sm" id="delete-selected-btn" disabled style="padding: 6px 12px; font-size: 0.75rem; border-radius: 6px;">
        🗑️ Delete Selected
      </button>
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
      state.lastGenerated.splice(idx, 1);
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

      checkedIndices.forEach(idx => state.lastGenerated.splice(idx, 1));
      renderGeneratedPreview(state.lastGenerated, state.lastGeneratedType);
      showToast('success', `Deleted ${checkedIndices.length} questions`);
    });
  }

  // Detail View
  container.querySelectorAll('.preview-detail-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const idx = e.target.closest('.preview-detail-btn').dataset.index;
      showQuestionDetailModal(questions[idx], type);
    });
  });
}

function showQuestionDetailModal(q, type) {
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
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">Question Text</label>
            <textarea class="form-input" id="edit-question" style="min-height: 80px;">${q.question}</textarea>
          </div>
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">Options (Correct option should be selected)</label>
            <div class="edit-options-list" style="display: grid; gap: 10px;">
              ${q.options.map((opt, i) => `
                <div style="display: flex; gap: 10px; align-items: center;">
                  <input type="radio" name="edit-correct" value="${i}" ${q.correct === i ? 'checked' : ''}>
                  <input type="text" class="form-input edit-opt-val" data-idx="${i}" value="${opt}" style="flex: 1;">
                </div>
              `).join('')}
            </div>
          </div>
        ` : `
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">Problem Title</label>
            <input type="text" class="form-input" id="edit-title" value="${q.title}">
          </div>
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">Description</label>
            <textarea class="form-input" id="edit-desc" style="min-height: 100px;">${q.description}</textarea>
          </div>
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">Starter Code</label>
            <textarea class="form-input" id="edit-starter" style="min-height: 150px; font-family: monospace; font-size: 0.9rem; background: rgba(0,0,0,0.2);">${q.starterCode || ''}</textarea>
          </div>
          <div class="edit-grid" style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin-top: 20px;">
            <div class="form-group">
              <label class="form-label">Target Input</label>
              <input type="text" class="form-input" id="edit-input" value="${q.input || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Expected Output</label>
              <input type="text" class="form-input" id="edit-output" value="${q.output || ''}">
            </div>
            <div class="form-group">
              <label class="form-label">Timer (Minutes)</label>
              <input type="number" class="form-input" id="edit-timer" value="${q.timeLimit || '30'}">
            </div>
          </div>
        `}
      </div>
      <div class="modal-footer" style="margin-top: 30px; display: flex; justify-content: flex-end; gap: 12px; border-top: 1px solid var(--border); padding-top: 20px;">
        <button class="btn btn-secondary" id="modal-cancel-btn">Discard Changes</button>
        <button class="btn btn-primary" id="modal-save-btn">✨ Save Changes</button>
      </div>
    </div>
  `;

  modal.classList.add('active');

  const closeMod = () => modal.classList.remove('active');
  document.getElementById('close-modal-btn').onclick = closeMod;
  document.getElementById('modal-cancel-btn').onclick = closeMod;

  document.getElementById('modal-save-btn').onclick = () => {
    // Update the question object in state
    q.smeName = document.getElementById('edit-sme').value;
    q.difficulty = document.getElementById('edit-difficulty').value;
    q.category = document.getElementById('edit-category').value;
    q.subtopic = document.getElementById('edit-subtopic').value;

    if (type === 'mcq') {
      q.question = document.getElementById('edit-question').value;
      q.correct = parseInt(document.querySelector('input[name="edit-correct"]:checked').value);
      q.options = Array.from(document.querySelectorAll('.edit-opt-val')).map(el => el.value);
    } else {
      q.title = document.getElementById('edit-title').value;
      q.description = document.getElementById('edit-desc').value;
      q.starterCode = document.getElementById('edit-starter').value;
      q.input = document.getElementById('edit-input').value;
      q.output = document.getElementById('edit-output').value;
      q.timeLimit = document.getElementById('edit-timer').value;
    }

    renderGeneratedPreview(state.lastGenerated, type);
    showToast('success', 'Changes saved successfully!');
    closeMod();
  };

  modal.onclick = (e) => { if (e.target === modal) closeMod(); };
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
    showToast('error', 'Failled to generate test: ' + error.message);
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

function renderCodingProblem() {
  const p = state.problem;
  if (!p) return;

  document.getElementById('problem-title').textContent = p.title;

  // Meta badges
  const diffColors = { Easy: 'badge-success', Medium: 'badge-warning', Hard: 'badge-danger' };
  document.getElementById('problem-meta').innerHTML = `
    <span class="badge ${diffColors[p.difficulty] || 'badge-primary'}">${p.difficulty}</span>
    ${(p.constraints || []).map(c => `<span class="badge badge-primary">${c}</span>`).join('')}
  `;

  // Description (handle backtick formatting)
  document.getElementById('problem-description').innerHTML =
    p.description.replace(/`([^`]+)`/g, '<code style="background:rgba(99,102,241,0.15);padding:2px 6px;border-radius:4px;font-family:var(--font-mono);font-size:0.88em;color:var(--primary-light)">$1</code>').replace(/\n/g, '<br>');

  // Examples (handle AI format which might be single string or array)
  const examplesEl = document.getElementById('problem-examples');
  if (p.examples && Array.isArray(p.examples)) {
    examplesEl.innerHTML = p.examples.map((ex, i) => `
      <div>
        <p class="problem-section-title">📌 Example ${i + 1}</p>
        <div class="example-box">
          <div><span class="label">Input:</span>  ${ex.input}</div>
          <div><span class="label">Output:</span> ${ex.output}</div>
          ${ex.explanation ? `<div><span class="label">Explanation:</span> ${ex.explanation}</div>` : ''}
        </div>
      </div>
    `).join('');
  } else {
    // Single example from current AI prompt structure
    examplesEl.innerHTML = `
      <div>
        <p class="problem-section-title">📌 Example Case</p>
        <div class="example-box">
          <div><span class="label">Input:</span> ${p.input || 'N/A'}</div>
          <div><span class="label">Output:</span> ${p.output || 'N/A'}</div>
        </div>
      </div>
    `;
  }

  // Constraints
  document.getElementById('problem-constraints').innerHTML =
    (p.constraints || []).map(c => `<li>${c}</li>`).join('');

  // Editor - Handle AI string starter vs legacy object
  const starter = typeof p.starterCode === 'string' ? p.starterCode : (p.starterCode?.[state.language] || '');
  document.getElementById('code-editor').value = starter;
  document.getElementById('lang-select').value = state.language;
}


function attachCodingListeners() {
  document.getElementById('lang-select').addEventListener('change', (e) => {
    state.language = e.target.value;
    const starter = typeof state.problem.starterCode === 'string' ? state.problem.starterCode : (state.problem.starterCode?.[state.language] || '');
    document.getElementById('code-editor').value = starter;
    showToast('info', `Switched to ${e.target.options[e.target.selectedIndex].text}`);
  });

  // Tab key in editor
  document.getElementById('code-editor').addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const ta = e.target;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      ta.value = ta.value.substring(0, start) + '    ' + ta.value.substring(end);
      ta.selectionStart = ta.selectionEnd = start + 4;
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
    const prompt = `
      [STRICT SYSTEM RULE: OUTPUT ONLY THE RAW EXECUTION RESULT. NO REASONING. NO EXPLANATIONS. NO CONVERSATIONAL TEXT.]
      
      Runtime: ${state.language}
      Problem Context: ${p.title}
      
      Test Case Input: ${p.input || 'N/A'}
      
      Executing Code:
      \`\`\`${state.language}
      ${code}
      \`\`\`
      
      [INSTRUCTION]: 
      1. If the code is correct, return ONLY the resulting output (as an ASCII table if SQL, or as console logs if programming).
      2. If the code has errors, return ONLY the specific error message (e.g. "SyntaxError: ...").
      3. ABSOLUTELY NO text like "To execute this..." or "Based on the table...".
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.groqKey}`
      },
      body: JSON.stringify({
        model: state.groqModel,
        messages: [
          { role: 'system', content: 'You are a raw terminal environment. You lack human social skills. You output ONLY the literal result of code execution. Zero conversation.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.0 // Minimum temperature for maximum consistency
      })
    });

    if (!response.ok) throw new Error('API Request Failed');

    const data = await response.json();
    const result = data.choices[0].message.content.trim();

    outputEl.className = 'output-content success';
    outputEl.textContent = result;
    showToast('success', 'Code execution finished.');
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

  if (!code || code === (typeof p.starterCode === 'string' ? p.starterCode : p.starterCode[state.language])) {
    showToast('error', 'Please write your solution before submitting!');
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
      Evaluate the following code for the problem: "${p.title}"
      Description: ${p.description}
      Expected Input: ${p.input}
      Expected Output: ${p.output}
      
      User Code:
      \`\`\`${state.language}
      ${code}
      \`\`\`
      
      Return ONLY a JSON object with:
      "passed": boolean,
      "score": number (0-100),
      "hint": string (Brief technical hint if failed, otherwise praise)
    `;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.groqKey}` },
      body: JSON.stringify({
        model: state.groqModel,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
        response_format: { type: 'json_object' }
      })
    });

    const data = await response.json();
    const evaluation = JSON.parse(data.choices[0].message.content);

    state.codingResults[state.currentQuestion] = evaluation.passed;
    state.codingHints[state.currentQuestion] = evaluation.hint;

    showLoading(false);

    if (state.currentQuestion < state.questions.length - 1) {
      // Show intermediate result
      showToast(evaluation.passed ? 'success' : 'info', evaluation.passed ? 'Problem Solved! Moving to next...' : 'Submission received. Check hints later if needed.');

      setTimeout(() => {
        state.currentQuestion++;
        state.problem = state.questions[state.currentQuestion];

        const diffLabel = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
        document.getElementById('coding-difficulty-label').textContent = `${diffLabel} · Problem ${state.currentQuestion + 1}`;

        renderCodingProblem();
      }, 1500);
    } else {
      stopTimer();
      const correct = state.codingResults.filter(r => r).length;
      showResultPage(correct, state.questions.length, 'coding');
    }
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
async function fetchAndRenderSavedQuestions() {
  const container = document.getElementById('questions-table-container');
  if (!container) return;

  container.innerHTML = `
    <div style="padding: 40px; text-align: center;">
        <span class="spinner"></span>
        <p style="margin-top: 15px; opacity: 0.7;">Syncing with MongoDB Compass...</p>
    </div>
  `;

  try {
    const response = await fetch('http://localhost:5000/api/questions');
    if (!response.ok) throw new Error('Failed to fetch from server');

    const questions = await response.json();

    if (questions.length === 0) {
      container.innerHTML = `
        <div style="padding: 60px; text-align: center; opacity: 0.5;">
            <div style="font-size: 3rem; margin-bottom: 20px;">📂</div>
            <p>No questions found in the database. Generate some first!</p>
        </div>
      `;
      return;
    }

    container.innerHTML = `
      <div class="table-responsive">
        <table class="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Type</th>
              <th>Topic</th>
              <th>Difficulty</th>
              <th>SME</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            ${questions.map(q => `
              <tr id="q-row-${q._id}">
                <td style="font-family: var(--font-mono); font-size: 0.8rem; opacity: 0.6;">#${q.id}</td>
                <td><span class="badge badge-${q.type}">${q.type.toUpperCase()}</span></td>
                <td><div style="font-weight: 600;">${q.subtopic}</div><div style="font-size: 0.75rem; opacity: 0.7;">${q.title || q.question.substring(0, 40) + '...'}</div></td>
                <td><span class="diff-tag ${q.difficulty}">${q.difficulty}</span></td>
                <td>${q.smeName || 'System'}</td>
                <td>
                  <button class="btn btn-secondary btn-sm" onclick="this.disabled=true; deleteSavedQuestion('${q._id}')">🗑️ Delete</button>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  } catch (error) {
    console.error(error);
    container.innerHTML = `
      <div style="padding: 40px; text-align: center; color: var(--danger-light);">
          <div style="font-size: 3rem; margin-bottom: 20px;">⚠️</div>
          <p>Error connecting to Database: ${error.message}</p>
          <button class="btn btn-primary btn-sm" style="margin-top: 15px;" onclick="fetchAndRenderSavedQuestions()">Retry Connection</button>
      </div>
    `;
  }
}

async function deleteSavedQuestion(mongoId) {
  try {
    // Note: We don't have a specific delete endpoint yet in server.js, 
    // but we can add it or just show an error if it fails.
    const response = await fetch(`http://localhost:5000/api/questions/${mongoId}`, {
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
    } else {
      throw new Error('Delete endpoint not implemented or failed');
    }
  } catch (error) {
    console.error(error);
    showToast('error', 'Failed to delete: ' + error.message);
    fetchAndRenderSavedQuestions(); // Refresh to restore UI state
  }
}

// =============================================
// INIT
// =============================================
renderApp();
