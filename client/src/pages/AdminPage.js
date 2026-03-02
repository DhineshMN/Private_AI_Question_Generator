// =============================================
// ADMIN PAGE — renderAdminPage()
// Returns the HTML shell for the admin panel.
// Sidebar nav, Dashboard, Generator, Question Bank, Settings tabs.
// Extracted from main.js L303-710
// =============================================

export function renderAdminPage() {
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
                  <div class="status-item-v2"><span class="status-dot online"></span><span>MongoDB Connection</span></div>
                  <div class="status-item-v2"><span class="status-dot online"></span><span>AI Provider (Groq)</span></div>
                  <div class="status-item-v2"><span class="status-dot online"></span><span>API Endpoint</span></div>
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
              <!-- Session Controller (hidden) -->
              <div id="session-controller-ui" style="display: none; pointer-events: none; margin-bottom: 24px; padding: 16px; background: rgba(0,0,0,0.2); border: 1px solid var(--border); border-radius: 8px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                  <label class="form-label" style="margin: 0;">Generation Session</label>
                  <span id="session-status-badge" class="badge badge-secondary" style="font-size: 0.65rem;">Inactive</span>
                </div>
                <div id="session-inactive-view">
                  <p style="font-size: 0.8rem; color: var(--text-secondary); margin-bottom: 12px;">Start a session to group generated questions together.</p>
                  <div style="display: flex; gap: 8px;">
                    <input type="text" class="form-input" id="session-name-input" placeholder="e.g. React Patterns..." style="flex: 1;" />
                    <button class="btn btn-primary btn-sm" id="start-session-btn" style="white-space: nowrap;">▶ Start</button>
                  </div>
                </div>
                <div id="session-active-view" style="display: none;">
                  <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
                    <div style="flex: 1;">
                      <div id="active-session-name-display" style="font-weight: 600; color: var(--primary-light);">Session Name</div>
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
                  <select class="form-select" id="gen-subtopic"><!-- Dynamic subtopics --></select>
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
              <div style="margin: 20px 0; padding: 16px; background: rgba(15,23,42,0.4); border: 1px dashed var(--primary-light); border-radius: 8px; text-align: center;">
                <label class="form-label" style="font-size: 0.70rem; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px;">ACTIVE SME WATERMARK</label>
                <div id="active-sme-watermark-display" style="font-weight: 600; font-size: 1.1rem; color: var(--danger-light); margin-bottom: 8px;">❌ No SME Selected</div>
                <p id="active-sme-watermark-hint" style="font-size: 0.75rem; color: var(--text-secondary); margin: 0;">Select SME in Settings to apply watermark</p>
              </div>

              <button class="btn btn-primary btn-lg w-full" id="generate-questions-btn" style="margin-top: 8px;">✨ Generate Questions</button>
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

              <style>
                .filter-group { margin-bottom: 16px; }
                .filter-label { font-size: 0.70rem; text-transform: uppercase; color: var(--text-secondary); margin-bottom: 6px; display: block; letter-spacing: 0.5px; }
                .filter-input { width: 100%; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); color: var(--text); padding: 8px 12px; border-radius: 6px; font-size: 0.85rem; outline: none; }
                .filter-input:focus { border-color: var(--primary); }
              </style>

              <div class="filter-group" style="display: none;">
                <label class="filter-label">Session</label>
                <div class="custom-dropdown-container" id="container-filter-session">
                  <input type="text" class="filter-input custom-dropdown-input" id="filter-session" placeholder="All Sessions" autocomplete="off" data-value="">
                  <div class="custom-dropdown-list" id="list-filter-session"></div>
                </div>
              </div>

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
              <h3 style="display: flex; align-items: center; gap: 8px; font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 20px;">📝 Register SME Profile</h3>
              
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

              <button class="btn btn-primary" id="add-sme-btn" style="width: 100%; display: flex; justify-content: center; align-items: center; gap: 8px;">✨ Add SME Profile</button>
            </div>

            <!-- Managed SME Profiles Card -->
            <div class="card card-glass" style="min-height: 380px;">
              <h3 style="display: flex; align-items: center; gap: 8px; font-size: 1.1rem; border-bottom: 1px solid var(--border); padding-bottom: 15px; margin-bottom: 20px;">🕵️ Managed SME Profiles</h3>
              <div id="sme-list" style="display: flex; flex-direction: column; gap: 12px; max-height: 400px; overflow-y: auto; padding-right: 5px;">
                <div style="text-align: center; opacity: 0.5; padding: 40px 0; font-size: 0.9rem;">
                  <span class="spinner-sm" style="border-width: 2px;"></span> Loading profiles...
                </div>
              </div>
            </div>
          </div>

          <!-- Privacy Notice Box -->
          <div style="margin-top: 24px; padding: 18px 24px; background: rgba(15,23,42,0.4); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); display: flex; gap: 16px; align-items: flex-start;">
            <div style="font-size: 1.5rem; line-height: 1;">🔑</div>
            <p style="font-size: 0.85rem; line-height: 1.5; color: var(--text-secondary); margin: 0;">
              <strong style="color: var(--text);">Data Privacy & Security:</strong> All API keys are stored in your private MongoDB instance. Each generated question is automatically <strong>watermarked</strong> with the SME's name and a <strong>timestamp</strong>.
            </p>
          </div>
        </div>
      </main>
    </div>
  `;
}
