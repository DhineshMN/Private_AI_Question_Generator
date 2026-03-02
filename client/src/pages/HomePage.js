// =============================================
// HOME PAGE — renderHomePage()
// Returns the HTML string for the home/landing page.
// =============================================

export function renderHomePage() {
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
          Generate high-quality MCQ &amp; coding questions powered by AI. Manage sessions, export in multiple formats, and build your question bank effortlessly.
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
            <button class="diff-btn" data-level="easy" id="diff-easy">🟢 Easy</button>
            <button class="diff-btn active" data-level="medium" id="diff-medium">🟡 Medium</button>
            <button class="diff-btn" data-level="hard" id="diff-hard">🔴 Hard</button>
          </div>
        </div>

        <button class="btn btn-primary btn-lg w-full" id="start-test-btn">🚀 Start Test</button>
        <button class="btn btn-secondary btn-sm" id="back-to-landing-btn" style="margin-top: 15px; width: 100%; border: none; background: transparent; opacity: 0.6;">← Back to Home</button>
      </div>
    </div>
  `;
}
