// =============================================
// SME MANAGER COMPONENT
// loadSMEs(), renderSMEs(), setupInlineEdit()
// Extracted from main.js L1459-1706
// =============================================

import { state } from '../state/appState.js';
import { showToast } from '../utils/ui.js';
import { updateGeneratorWatermark } from '../features/generator/generatorHandlers.js';

export async function loadSMEs() {
    try {
        const response = await fetch('/api/smes');
        if (!response.ok) throw new Error('Failed to fetch SMEs');
        state.smes = await response.json();

        const activeSmeId = localStorage.getItem('activeSmeId');
        if (activeSmeId && state.smes.length > 0) {
            const found = state.smes.find(s => s._id === activeSmeId);
            if (found) {
                state.activeSme = found;
                state.groqKey = found.apiKey;
                state.groqModel = found.model;
            }
        } else if (!activeSmeId && state.smes.length === 1) {
            state.activeSme = state.smes[0];
            state.groqKey = state.smes[0].apiKey;
            state.groqModel = state.smes[0].model;
            localStorage.setItem('activeSmeId', state.smes[0]._id);
        }

        renderSMEs(state.smes);
        updateGeneratorWatermark();
    } catch (err) {
        console.error('Failed to load SMEs:', err);
    }
}

export function renderSMEs(smes) {
    const container = document.getElementById('sme-list');
    if (!container) return;

    if (!smes || smes.length === 0) {
        container.innerHTML = `<div class="empty-state-v2">No SMEs registered yet. Add one above.</div>`;
        return;
    }

    container.innerHTML = smes.map(sme => {
        const isActive = state.activeSme && state.activeSme._id === sme._id;
        const modelNames = {
            'llama-3.3-70b-versatile': 'Llama 3.3 70B',
            'llama-3.1-8b-instant': 'Llama 3.1 8B',
            'mixtral-8x7b-32768': 'Mixtral 8x7B'
        };
        return `
      <div class="sme-card" id="sme-card-${sme._id}" style="display: flex; align-items: center; justify-content: space-between; gap: 15px; padding: 16px 20px; background: rgba(255,255,255,0.02); border: 1px solid ${isActive ? 'var(--primary)' : 'var(--border)'}; border-radius: 10px; margin-bottom: 10px; transition: var(--transition);">
        <div style="display: flex; align-items: center; gap: 15px; flex: 1;">
          <div style="width: 42px; height: 42px; border-radius: 12px; background: ${isActive ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255,255,255,0.05)'}; display: flex; align-items: center; justify-content: center; font-size: 1.3rem; flex-shrink: 0;">${isActive ? '🛡️' : '👤'}</div>
          <div>
            <div style="font-weight: 700; font-size: 0.95rem; color: ${isActive ? 'var(--primary-light)' : 'var(--text-primary)'};">${sme.name} ${isActive ? '<span class="badge badge-primary" style="font-size: 0.65rem; padding: 2px 8px; margin-left: 6px;">ACTIVE</span>' : ''}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted); margin-top: 3px;">Model: ${modelNames[sme.model] || sme.model} · Key: ${sme.apiKey ? '••••••••' + sme.apiKey.slice(-4) : 'Not set'}</div>
          </div>
        </div>
        <div style="display: flex; gap: 8px;">
          ${!isActive ? `<button class="btn btn-secondary btn-sm" onclick="activateSME('${sme._id}')" style="padding: 4px 10px; font-size: 0.75rem;">Activate</button>` : ''}
          <button class="btn btn-secondary btn-sm" onclick="editSME('${sme._id}')" style="padding: 4px 10px; font-size: 0.75rem;">Edit</button>
          <button class="btn btn-danger btn-sm" onclick="deleteSME('${sme._id}')" style="padding: 4px 10px; font-size: 0.75rem; background: rgba(239,68,68,0.1); border-color: rgba(239,68,68,0.2); color: var(--danger-light);">Delete</button>
        </div>
      </div>
    `;
    }).join('');
}

// Window globals for inline onclick usage
window.activateSME = (smeId) => {
    const sme = state.smes.find(s => s._id === smeId);
    if (!sme) return;
    state.activeSme = sme;
    state.groqKey = sme.apiKey;
    state.groqModel = sme.model;
    localStorage.setItem('activeSmeId', smeId);
    renderSMEs(state.smes);
    updateGeneratorWatermark();
    showToast('success', `SME "${sme.name}" is now active!`);
};

window.deleteSME = async (smeId) => {
    if (!confirm('Are you sure you want to delete this SME profile?')) return;
    try {
        const res = await fetch(`/api/smes/${smeId}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to delete SME');
        state.smes = state.smes.filter(s => s._id !== smeId);
        if (state.activeSme && state.activeSme._id === smeId) {
            state.activeSme = null;
            state.groqKey = '';
            state.groqModel = '';
            localStorage.removeItem('activeSmeId');
        }
        renderSMEs(state.smes);
        updateGeneratorWatermark();
        showToast('success', 'SME profile deleted!');
    } catch (err) {
        showToast('error', err.message);
    }
};

window.editSME = (smeId) => {
    showToast('info', 'Edit functionality: Use the add form above to re-add with updated details.');
};
