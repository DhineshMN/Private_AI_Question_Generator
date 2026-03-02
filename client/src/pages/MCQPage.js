// =============================================
// MCQ PAGE — renderMCQPage()
// Returns the HTML string for the MCQ test page.
// =============================================

export function renderMCQPage() {
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
          <button class="btn btn-secondary" id="mcq-prev-btn" disabled>← Previous</button>
          <button class="btn btn-primary" id="mcq-next-btn">Next →</button>
        </div>
      </div>
    </div>
  `;
}
