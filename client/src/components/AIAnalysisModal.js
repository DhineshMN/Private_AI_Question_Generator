// =============================================
// AI ANALYSIS MODAL — showAIAnalysisModal()
// Shows the coding evaluation result after AI grades the submission.
// Extracted from main.js L4510-4586
// =============================================

import { state } from '../state/appState.js';
import { stopTimer } from '../utils/ui.js';
import { renderCodingProblem } from '../features/coding/codingHandlers.js';

export function showAIAnalysisModal(evaluation) {
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

    document.getElementById('analysis-next-btn').onclick = async () => {
        close();
        if (isLast) {
            stopTimer();
            const correct = state.codingResults.filter(r => r).length;
            const { showResultPage } = await import('./ResultRenderer.js');
            showResultPage(correct, state.questions.length, 'coding');
        } else {
            state.currentQuestion++;
            state.problem = state.questions[state.currentQuestion];
            state.selectedTestCaseIndex = 0;
            const diffLabel = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
            const diffEl = document.getElementById('coding-difficulty-label');
            if (diffEl) diffEl.textContent = `${diffLabel} · Problem ${state.currentQuestion + 1}`;
            renderCodingProblem();
        }
    };
}
