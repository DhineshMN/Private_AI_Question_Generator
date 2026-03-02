// =============================================
// CODING PAGE — renderCodingPage()
// Returns the HTML string for the coding test page.
// =============================================

export function renderCodingPage() {
    return `
    <div class="exam-header" style="height: 55px; border-bottom: 1px solid var(--border); padding: 0 20px;">
      <div class="exam-header-left">
        <div class="exam-logo-sm">🧠</div>
        <div>
          <div class="exam-title-sm">AI Coding Challenge</div>
          <div class="exam-subtitle-sm" id="coding-difficulty-label">Medium · Problem 1</div>
        </div>
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

        <div id="project-structure-panel" style="display: none;"></div>
        <div id="coding-hints-container"></div>
        <div id="visible-test-grid"></div>
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

    <!-- AI Analysis Modal -->
    <div class="modal-overlay" id="common-modal"></div>
  `;
}
