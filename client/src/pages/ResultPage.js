// =============================================
// RESULT PAGE — renderResultPage()
// Returns the HTML string for the test result page.
// =============================================

export function renderResultPage() {
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
        <div class="hints-title">💡 AI Insights &amp; Hints</div>
        <div id="ai-hints-content" style="font-size: 0.92rem; line-height: 1.6; opacity: 0.9;"></div>
      </div>

      <div class="result-actions">
        <button class="btn btn-primary btn-lg" id="go-home-btn">🏠 Back to Home</button>
        <button class="btn btn-secondary btn-lg" id="retry-btn">🔄 Retry Test</button>
      </div>
    </div>
  `;
}
