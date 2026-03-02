// =============================================
// GENERATED PREVIEW COMPONENT — renderGeneratedPreview()
// Shows the list of just-generated questions in the admin panel.
// Extracted from main.js L2428-2611
// =============================================

import { state } from '../state/appState.js';
import { showToast } from '../utils/ui.js';
import { downloadQuestions, downloadAsZip } from '../utils/exportUtils.js';
import { showQuestionDetailModal } from './QuestionDetailModal.js';

export function renderGeneratedPreview(questions, type) {
    const container = document.getElementById('gen-preview-content');
    if (!container) return;

    if (!questions || questions.length === 0) {
        container.innerHTML = `
      <div class="empty-preview">
        <div style="font-size: 3rem; margin-bottom: 16px; opacity: 0.3;">✨</div>
        <p>No questions generated yet. Enter a topic and click generate.</p>
      </div>
    `;
        const saveBtn = document.getElementById('save-generated-btn');
        if (saveBtn) { saveBtn.disabled = true; saveBtn.innerHTML = `💾 Save to Database`; }
        return;
    }

    const saveBtn = document.getElementById('save-generated-btn');
    if (saveBtn) {
        if (state.activeSessionId) {
            saveBtn.disabled = true;
            saveBtn.innerHTML = `⏳ Auto-Saving on End Session (${state.sessionPendingQuestions ? state.sessionPendingQuestions.length : 0} items pending)`;
            saveBtn.classList.remove('btn-primary', 'btn-success'); saveBtn.classList.add('btn-secondary');
        } else {
            saveBtn.disabled = false; saveBtn.innerHTML = `💾 Save to Database`;
            saveBtn.classList.remove('btn-success', 'btn-secondary'); saveBtn.classList.add('btn-primary');
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
            <button class="btn btn-secondary btn-sm preview-detail-btn" data-index="${idx}" style="padding: 6px 10px;">👁️ View</button>
            <button class="btn btn-secondary btn-sm download-single-btn" data-index="${idx}" title="${type === 'coding' ? 'Download Project ZIP' : 'Download this question'}" style="padding: 6px 10px;">
              ${type === 'coding' ? '📦 ZIP' : '⬇️'}
            </button>
            <button class="btn btn-danger btn-sm delete-gen-btn" data-index="${idx}" style="padding: 6px 10px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); color: var(--danger-light);">🗑️</button>
          </div>
        </div>
      `).join('')}
    </div>
  `;

    const selectAll = document.getElementById('select-all-gen');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    const itemChecks = container.querySelectorAll('.gen-item-check');

    const updateBulkActions = () => {
        const checked = container.querySelectorAll('.gen-item-check:checked');
        deleteSelectedBtn.disabled = checked.length === 0;
        deleteSelectedBtn.textContent = `🗑️ Delete Selected (${checked.length})`;
        if (selectAll) selectAll.checked = checked.length === itemChecks.length && itemChecks.length > 0;
    };

    if (selectAll) selectAll.addEventListener('change', () => { itemChecks.forEach(check => check.checked = selectAll.checked); updateBulkActions(); });
    itemChecks.forEach(check => check.addEventListener('change', updateBulkActions));

    container.querySelectorAll('.delete-gen-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.closest('.delete-gen-btn').dataset.index);
            const qToRemove = state.lastGenerated[idx];
            state.lastGenerated.splice(idx, 1);
            if (state.sessionPendingQuestions && qToRemove) state.sessionPendingQuestions = state.sessionPendingQuestions.filter(q => q.id !== qToRemove.id);
            renderGeneratedPreview(state.lastGenerated, state.lastGeneratedType);
            showToast('info', 'Question removed from preview');
        });
    });

    if (deleteSelectedBtn) {
        deleteSelectedBtn.addEventListener('click', () => {
            const checkedIndices = Array.from(container.querySelectorAll('.gen-item-check:checked')).map(check => parseInt(check.dataset.index)).sort((a, b) => b - a);
            const idsToRemove = checkedIndices.map(idx => state.lastGenerated[idx]?.id);
            checkedIndices.forEach(idx => state.lastGenerated.splice(idx, 1));
            if (state.sessionPendingQuestions && idsToRemove.length > 0) state.sessionPendingQuestions = state.sessionPendingQuestions.filter(q => !idsToRemove.includes(q.id));
            renderGeneratedPreview(state.lastGenerated, state.lastGeneratedType);
            showToast('success', `Deleted ${checkedIndices.length} questions`);
        });
    }

    container.querySelectorAll('.download-single-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.closest('.download-single-btn').dataset.index);
            const q = questions[idx];
            if (type === 'coding' || q.type === 'coding') downloadAsZip(q);
            else downloadQuestions([q], type, 'md');
        });
    });

    const dlJsonBtn = document.getElementById('download-json-btn');
    if (dlJsonBtn) dlJsonBtn.addEventListener('click', () => downloadQuestions(questions, type, 'json'));
    const dlMdBtn = document.getElementById('download-md-btn');
    if (dlMdBtn) dlMdBtn.addEventListener('click', () => downloadQuestions(questions, type, 'md'));

    container.querySelectorAll('.preview-detail-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(e.target.closest('.preview-detail-btn').dataset.index);
            showQuestionDetailModal(questions[idx], type, (updated) => {
                state.lastGenerated[idx] = updated;
                renderGeneratedPreview(state.lastGenerated, type);
            });
        });
    });
}
