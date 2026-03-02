// =============================================
// QUESTION BANK HANDLERS — bankHandlers.js
// toggleGroupCollapse, changeMqSessionPage, changeMqGroupPage,
// renameSession, exportSession, deleteSession, deleteSavedQuestion
// =============================================

import { state } from '../../state/appState.js';
import { showToast } from '../../utils/ui.js';
import { updateDashboardStats } from '../../components/DashboardStats.js';
import { downloadAsZip, downloadQuestions } from '../../utils/exportUtils.js';

// Use dynamic import for fetchAndRenderSavedQuestions to avoid circular deps
export async function fetchAndRenderSavedQuestions(force = false) {
    const { fetchAndRenderSavedQuestions: _fn } = await import('../../components/QuestionBank.js');
    _fn(force);
}

// Pagination & collapse globals
window.toggleGroupCollapse = (groupId) => {
    if (state.collapsedGroups[groupId] === true) {
        delete state.collapsedGroups[groupId]; // undefined = expanded (default)
    } else {
        state.collapsedGroups[groupId] = true; // true = collapsed
    }
    import('../../components/QuestionBank.js').then(({ applyFiltersAndRender }) => applyFiltersAndRender());
};

window.changeMqSessionPage = (newPage) => {
    state.mqPagination.sessionPage = newPage;
    const container = document.getElementById('questions-table-container');
    if (container) container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    import('../../components/QuestionBank.js').then(({ applyFiltersAndRender }) => applyFiltersAndRender());
};

window.changeMqGroupPage = (groupId, newPage) => {
    state.mqPagination.groupPages[groupId] = newPage;
    import('../../components/QuestionBank.js').then(({ applyFiltersAndRender }) => applyFiltersAndRender());
};

window.renameSession = async (sessionId, currentName) => {
    const newName = prompt('Enter a new name for this session:', currentName);
    if (!newName || newName.trim() === '' || newName === currentName) return;

    try {
        const response = await fetch(`/api/questions/session/${sessionId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionName: newName.trim() })
        });
        if (!response.ok) throw new Error('Failed to rename session');
        showToast('success', 'Session renamed successfully!');
        import('../../components/QuestionBank.js').then(({ fetchAndRenderSavedQuestions }) => fetchAndRenderSavedQuestions(true));
    } catch (error) {
        console.error(error);
        showToast('error', error.message);
    }
};

window.exportSession = (sessionId) => {
    const sessionQuestions = state.savedQuestions.filter(q => q.sessionId === sessionId);
    if (sessionQuestions.length === 0) {
        showToast('error', 'No questions found for this session.');
        return;
    }
    const hasCoding = sessionQuestions.some(q => q.type === 'coding');
    const sessionName = sessionQuestions[0].sessionName || sessionId;
    if (hasCoding) {
        downloadAsZip({ title: sessionName, subtopic: 'Session Export', starterCode: {}, textExportMode: true, exportedQuestions: sessionQuestions });
    } else {
        downloadQuestions(sessionQuestions, 'mcq', 'md');
    }
};

window.deleteSession = async (sessionId) => {
    if (!confirm('Are you sure you want to delete ALL questions in this session? This action cannot be undone.')) return;
    try {
        const response = await fetch(`/api/questions/session/${sessionId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete session');
        showToast('success', 'Session deleted successfully!');
        import('../../components/QuestionBank.js').then(({ fetchAndRenderSavedQuestions }) => fetchAndRenderSavedQuestions(true));
        updateDashboardStats();
    } catch (error) {
        console.error(error);
        showToast('error', error.message);
    }
};

window.deleteSavedQuestion = async (mongoId) => {
    try {
        const response = await fetch(`/api/questions/${mongoId}`, { method: 'DELETE' });
        if (response.ok) {
            const row = document.getElementById(`q-row-${mongoId}`);
            if (row) {
                row.style.opacity = '0';
                row.style.transform = 'translateX(-20px)';
                row.style.transition = 'all 0.4s ease';
                setTimeout(() => row.remove(), 400);
            }
            showToast('success', 'Question deleted successfully');
            updateDashboardStats();
        } else {
            throw new Error('Delete failed');
        }
    } catch (error) {
        console.error(error);
        showToast('error', 'Failed to delete: ' + error.message);
        import('../../components/QuestionBank.js').then(({ fetchAndRenderSavedQuestions }) => fetchAndRenderSavedQuestions());
    }
};
