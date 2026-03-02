// =============================================
// QUESTION DETAIL MODAL — showQuestionDetailModal()
// editSavedQuestion(), downloadSavedQuestion()
// Extracted from main.js L2613-2921
// =============================================

import { state } from '../state/appState.js';
import { showToast } from '../utils/ui.js';
import { downloadQuestions, downloadAsZip } from '../utils/exportUtils.js';
import { buildTreeFromFiles } from '../utils/treeUtils.js';

export function showQuestionDetailModal(q, type, onSave) {
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
            <label class="form-label">Question Content</label>
            <textarea class="form-input" id="edit-question" style="min-height: 150px; font-size: 1.1rem; padding: 15px;">${q.question}</textarea>
          </div>
          <div class="form-group" style="margin-top: 25px;">
            <label class="form-label">Options (Select the correct one)</label>
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
            <textarea class="form-input" id="edit-explanation" style="min-height: 150px; font-size: 1.05rem; padding: 15px;">${q.explanation || ''}</textarea>
          </div>
        ` : `
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">Problem Title</label>
            <input type="text" class="form-input" id="edit-title" value="${q.title}">
          </div>
          <div class="form-group" style="margin-top: 25px;">
            <label class="form-label">Descriptive Scenario (Markdown Supported)</label>
            <textarea class="form-input" id="edit-desc" style="min-height: 350px; font-size: 1.05rem; padding: 20px;">${typeof q.description === 'object' ? JSON.stringify(q.description, null, 2) : q.description}</textarea>
          </div>
          <div class="form-group" style="margin-top: 30px;">
            <label class="form-label">Starter Code</label>
            ${typeof q.starterCode === 'object' ? `
              ${q.projectStructure || buildTreeFromFiles(q.starterCode, q.title) ? `
              <div style="margin-bottom: 24px;">
                <div style="font-size: 0.72rem; text-transform: uppercase; letter-spacing: 0.6px; color: var(--text-secondary); font-weight: 600; margin-bottom: 10px;">📁 Project Structure</div>
                <pre style="background: rgba(13,13,26,0.6); border: 1px solid var(--border); border-radius: 8px; padding: 16px; font-family: var(--font-mono); font-size: 0.82rem; color: #a5b4fc; white-space: pre; overflow-x: auto; line-height: 1.6; margin: 0;">${q.projectStructure || buildTreeFromFiles(q.starterCode, q.title)}</pre>
              </div>` : ''}
            ` + Object.entries(q.starterCode).map(([filename, code]) => `
                <div class="editor-file-item" style="margin-bottom: 25px;">
                  <div style="font-weight: 600; margin-bottom: 10px; color: var(--primary-light);">📄 ${filename}</div>
                  <textarea class="form-input multi-file-code" data-filename="${filename}" style="min-height: 250px; font-family: var(--font-mono); font-size: 0.95rem; padding: 15px;">${code}</textarea>
                </div>
              `).join('') : `
              <textarea class="form-input" id="edit-starter" style="min-height: 400px; font-family: var(--font-mono); font-size: 0.95rem; padding: 15px;">${q.starterCode || ''}</textarea>
            `}
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
            <textarea class="form-input" id="edit-constraints" style="min-height: 80px;">${(q.constraints || []).join('\n')}</textarea>
          </div>
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label">💡 Hints (One per line)</label>
            <textarea class="form-input" id="edit-hints" style="min-height: 80px;">${(q.hints || []).join('\n')}</textarea>
          </div>
          <div class="form-group" style="margin-top: 20px;">
            <label class="form-label" style="display: flex; justify-content: space-between; align-items: center;">
              <span>🧪 Test Cases</span>
              <button type="button" id="add-test-case-btn" style="font-size: 0.72rem; padding: 3px 10px; border-radius: 6px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: var(--primary-light); cursor: pointer;">+ Add Test Case</button>
            </label>
            <div id="edit-test-cases-list" style="display: flex; flex-direction: column; gap: 10px; margin-top: 8px;">
              ${(q.testCases || []).map((tc, i) => `
                <div class="test-case-row" data-index="${i}" style="background: rgba(255,255,255,0.02); border: 1px solid var(--border); border-radius: 8px; padding: 12px; display: grid; grid-template-columns: 1fr 1fr auto auto; gap: 10px; align-items: start;">
                  <div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase;">Input</div>
                    <textarea class="form-input tc-input" rows="2" style="font-family: monospace; font-size: 0.82rem; padding: 8px;">${tc.input || ''}</textarea>
                  </div>
                  <div>
                    <div style="font-size: 0.7rem; color: var(--text-secondary); margin-bottom: 4px; text-transform: uppercase;">Expected Output</div>
                    <textarea class="form-input tc-output" rows="2" style="font-family: monospace; font-size: 0.82rem; padding: 8px;">${tc.output || ''}</textarea>
                  </div>
                  <div style="display: flex; flex-direction: column; align-items: center; gap: 4px; padding-top: 18px;">
                    <input type="checkbox" class="tc-hidden" ${tc.hidden ? 'checked' : ''} title="Hidden test case" style="width: 16px; height: 16px; cursor: pointer; accent-color: var(--primary);">
                    <span style="font-size: 0.65rem; color: var(--text-secondary);">Hidden</span>
                  </div>
                  <div style="padding-top: 18px;">
                    <button type="button" class="remove-tc-btn btn btn-danger btn-sm" style="padding: 2px 8px; font-size: 0.75rem;">✕</button>
                  </div>
                </div>
              `).join('')}
            </div>
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
  document.getElementById('modal-dl-json-btn').onclick = () => downloadQuestions([q], type, 'json');
  document.getElementById('modal-dl-md-btn').onclick = () => downloadQuestions([q], type, 'md');

  // Test case add / remove (coding questions only)
  const addTcBtn = document.getElementById('add-test-case-btn');
  const tcList = document.getElementById('edit-test-cases-list');
  if (addTcBtn && tcList) {
    addTcBtn.addEventListener('click', () => {
      const row = document.createElement('div');
      row.className = 'test-case-row';
      row.style.cssText = 'background:rgba(255,255,255,0.02);border:1px solid var(--border);border-radius:8px;padding:12px;display:grid;grid-template-columns:1fr 1fr auto auto;gap:10px;align-items:start;';
      row.innerHTML = `
        <div><div style="font-size:0.7rem;color:var(--text-secondary);margin-bottom:4px;text-transform:uppercase;">Input</div><textarea class="form-input tc-input" rows="2" style="font-family:monospace;font-size:0.82rem;padding:8px;"></textarea></div>
        <div><div style="font-size:0.7rem;color:var(--text-secondary);margin-bottom:4px;text-transform:uppercase;">Expected Output</div><textarea class="form-input tc-output" rows="2" style="font-family:monospace;font-size:0.82rem;padding:8px;"></textarea></div>
        <div style="display:flex;flex-direction:column;align-items:center;gap:4px;padding-top:18px;"><input type="checkbox" class="tc-hidden" style="width:16px;height:16px;cursor:pointer;accent-color:var(--primary);"><span style="font-size:0.65rem;color:var(--text-secondary);">Hidden</span></div>
        <div style="padding-top:18px;"><button type="button" class="remove-tc-btn btn btn-danger btn-sm" style="padding:2px 8px;font-size:0.75rem;">✕</button></div>`;
      tcList.appendChild(row);
    });
    tcList.addEventListener('click', (e) => {
      const btn = e.target.closest('.remove-tc-btn');
      if (btn) btn.closest('.test-case-row').remove();
    });
  }


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
      const multiFiles = document.querySelectorAll('.multi-file-code');
      if (multiFiles.length > 0) { const codeObj = {}; multiFiles.forEach(el => { codeObj[el.dataset.filename] = el.value; }); updated.starterCode = codeObj; }
      else updated.starterCode = document.getElementById('edit-starter')?.value || q.starterCode;
      const constraintsEl = document.getElementById('edit-constraints');
      if (constraintsEl) updated.constraints = constraintsEl.value.split('\n').filter(Boolean);
      const hintsEl = document.getElementById('edit-hints');
      if (hintsEl) updated.hints = hintsEl.value.split('\n').filter(Boolean);
      // Collect test cases from DOM
      updated.testCases = Array.from(document.querySelectorAll('#edit-test-cases-list .test-case-row')).map(row => ({
        input: row.querySelector('.tc-input')?.value || '',
        output: row.querySelector('.tc-output')?.value || '',
        hidden: row.querySelector('.tc-hidden')?.checked || false
      }));
    }

    if (onSave) onSave(updated);
    closeMod();
  };

  modal.onclick = (e) => { if (e.target === modal) closeMod(); };
}

// Global window functions for onclick attributes in question bank table
window.editSavedQuestion = async (mongoId) => {
  const q = state.savedQuestions.find(it => it._id === mongoId);
  if (!q) { showToast('error', 'Question not found in local cache'); return; }

  showQuestionDetailModal(q, q.type, async (updated) => {
    try {
      const resp = await fetch(`http://localhost:5000/api/questions/${mongoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated)
      });
      if (!resp.ok) throw new Error('Failed to update question');
      showToast('success', 'Question updated in database!');
      const { fetchAndRenderSavedQuestions } = await import('./QuestionBank.js');
      fetchAndRenderSavedQuestions();
      const { updateDashboardStats } = await import('./DashboardStats.js');
      updateDashboardStats();
    } catch (err) {
      console.error(err);
      showToast('error', 'Update failed: ' + err.message);
    }
  });
};

window.downloadSavedQuestion = (mongoId) => {
  const q = state.savedQuestions.find(it => it._id === mongoId);
  if (!q) { showToast('error', 'Question not found in local cache'); return; }
  if (q.type === 'coding') downloadAsZip(q);
  else downloadQuestions([q], q.type, 'md');
};
