// =============================================
// GENERATOR HANDLERS
// handleGenerateClick(), updateGeneratorWatermark(), enterAdminPanel()
// attachAdminListeners() – sub-section only for generator/admin logic
// =============================================

import { state } from '../../state/appState.js';
import { showPage } from '../../router/router.js';
import { showToast } from '../../utils/ui.js';
import { generateAIQuestions } from '../../services/groqService.js';
import { bulkSaveQuestions } from '../../services/backendService.js';

export function updateGeneratorWatermark() {
    const display = document.getElementById('active-sme-watermark-display');
    const hint = document.getElementById('active-sme-watermark-hint');
    if (!display || !hint) return;

    if (state.activeSme) {
        const modelNames = {
            'llama-3.3-70b-versatile': 'Llama 3.3 70B',
            'llama-3.1-8b-instant': 'Llama 3.1 8B',
            'mixtral-8x7b-32768': 'Mixtral 8x7B'
        };
        display.innerHTML = `🛡️ ${state.activeSme.name}`;
        display.style.color = 'var(--primary-light)';
        hint.innerHTML = `Using ${modelNames[state.activeSme.model] || state.activeSme.model}`;
    } else {
        display.innerHTML = `❌ No SME Selected`;
        display.style.color = 'var(--danger-light)';
        hint.innerHTML = `Select SME in Settings to apply watermark`;
    }
}

export function enterAdminPanel() {
    showPage('admin-page');
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    const genNavItem = document.querySelector('[data-tab="generator"]');
    const genTab = document.getElementById('tab-generator');
    if (genNavItem) genNavItem.classList.add('active');
    if (genTab) genTab.classList.add('active');
    const loginEmail = document.getElementById('login-email');
    const loginPass = document.getElementById('login-password');
    if (loginEmail) loginEmail.value = '';
    if (loginPass) loginPass.value = '';
    const authMsg = document.getElementById('auth-message');
    if (authMsg) authMsg.style.display = 'none';
}

export async function handleGenerateClick() {
    if (!state.activeSme) {
        showToast('error', 'No ACTIVE SME Selected! Please register and select one in Settings.');
        const settingsTab = document.querySelector('[data-tab="settings"]');
        if (settingsTab) settingsTab.click();
        return;
    }

    const category = document.getElementById('gen-category').value;
    const subtopic = document.getElementById('gen-subtopic').value;
    const specificTopic = document.getElementById('gen-topic').value.trim();
    const activeSegment = document.querySelector('#gen-type-toggle .type-segment.active');
    const type = activeSegment ? activeSegment.dataset.value : 'mcq';
    const difficulty = document.getElementById('gen-difficulty').value;
    const count = parseInt(document.getElementById('gen-count').value);
    const smeName = state.activeSme.name;
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

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = `💾 Save to Database`;
        saveBtn.classList.remove('btn-success');
        saveBtn.classList.add('btn-primary');
    }

    try {
        const generated = await generateAIQuestions(finalTopic, type, difficulty, count, category, subtopic, smeName, state.activeSme.apiKey, state.activeSme.model);
        state.lastGenerated = generated;
        state.lastGeneratedType = type;

        if (state.activeSessionId) {
            const questionsWithSession = generated.map(q => ({
                ...q,
                sessionId: state.activeSessionId,
                sessionName: state.activeSessionName
            }));
            state.sessionPendingQuestions = [...(state.sessionPendingQuestions || []), ...questionsWithSession];
            showToast('success', `AI generated ${count} questions and auto-added to session memory!`);
        } else {
            showToast('success', `AI generated ${count} questions successfully!`);
        }

        const { renderGeneratedPreview } = await import('../../components/GeneratedPreview.js');
        renderGeneratedPreview(generated, type);
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
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = `💾 Save to Database`;
            saveBtn.classList.remove('btn-success');
            saveBtn.classList.add('btn-primary');
        }
    }
}
