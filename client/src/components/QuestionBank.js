// =============================================
// QUESTION BANK COMPONENT
// fetchAndRenderSavedQuestions(), populateFilterDropdowns(),
// attachFilterListeners(), applyFiltersAndRender(), renderQuestionsTable()
// =============================================

import { state } from '../state/appState.js';
import { showToast } from '../utils/ui.js';
import { downloadAsZip, downloadQuestions } from '../utils/exportUtils.js';

export async function fetchAndRenderSavedQuestions(force = false) {
    const container = document.getElementById('questions-table-container');
    if (!container) return;

    const now = Date.now();
    const isStale = now - state.lastQuestionsFetch > 60000;

    if (isStale || force || state.savedQuestions.length === 0) {
        container.innerHTML = `
      <div class="loading-state" style="padding: 100px; text-align: center;">
          <span class="spinner"></span>
          <p style="margin-top: 15px;">Syncing question bank...</p>
      </div>
    `;
        try {
            const response = await fetch('/api/questions');
            if (!response.ok) throw new Error();
            state.savedQuestions = await response.json();
            state.lastQuestionsFetch = now;
            populateFilterDropdowns();
        } catch (error) {
            console.error(error);
            container.innerHTML = `<div class="empty-state-v2">Failed to sync with cloud database.</div>`;
            return;
        }
    }

    applyFiltersAndRender();
}

export function populateFilterDropdowns() {
    const sessions = new Map();
    const smes = new Set();

    state.savedQuestions.forEach(q => {
        if (q.smeName) smes.add(q.smeName);
        if (q.sessionId) sessions.set(q.sessionId, q.sessionName || q.sessionId);
    });

    const populateDropdown = (inputId, listId, html) => {
        const list = document.getElementById(listId);
        if (list) list.innerHTML = html || '<div class="custom-dropdown-empty">No options</div>';
    };

    const sessionsArray = Array.from(sessions.entries()).reverse();
    const recentSessions = sessionsArray.slice(0, 5);
    const olderSessions = sessionsArray.slice(5);

    let sessionHtml = '<div class="custom-dropdown-item" data-value="">All Sessions</div>';
    if (recentSessions.length > 0) {
        sessionHtml += '<div style="padding: 8px 16px 4px 16px; font-size: 0.7rem; color: var(--primary-light); text-transform: uppercase; font-weight: bold;">Recent Sessions</div>';
        sessionHtml += recentSessions.map(([id, name]) => `<div class="custom-dropdown-item" data-value="${id}">${name} (${id})</div>`).join('');
    }
    if (olderSessions.length > 0) {
        sessionHtml += '<div style="padding: 8px 16px 4px 16px; font-size: 0.7rem; color: var(--primary-light); text-transform: uppercase; font-weight: bold; border-top: 1px solid rgba(255,255,255,0.05); margin-top: 4px;">Older Sessions</div>';
        sessionHtml += olderSessions.map(([id, name]) => `<div class="custom-dropdown-item" data-value="${id}">${name} (${id})</div>`).join('');
    }
    populateDropdown('filter-session', 'list-filter-session', sessionHtml);
    populateDropdown('filter-sme', 'list-filter-sme', '<div class="custom-dropdown-item" data-value="">All SMEs</div>' + Array.from(smes).map(sme => `<div class="custom-dropdown-item" data-value="${sme}">${sme}</div>`).join(''));
    populateDropdown('filter-type', 'list-filter-type', `<div class="custom-dropdown-item" data-value="">All Types</div><div class="custom-dropdown-item" data-value="mcq">MCQ</div><div class="custom-dropdown-item" data-value="coding">Coding</div>`);
    populateDropdown('filter-category', 'list-filter-category', `<div class="custom-dropdown-item" data-value="">All Categories</div><div class="custom-dropdown-item" data-value="languages">Languages</div><div class="custom-dropdown-item" data-value="subjects">Subjects</div><div class="custom-dropdown-item" data-value="stacks">Stacks</div><div class="custom-dropdown-item" data-value="frameworks">Frameworks</div>`);
    populateDropdown('filter-difficulty', 'list-filter-difficulty', `<div class="custom-dropdown-item" data-value="">All Difficulties</div><div class="custom-dropdown-item" data-value="Easy">Easy</div><div class="custom-dropdown-item" data-value="Medium">Medium</div><div class="custom-dropdown-item" data-value="Hard">Hard</div>`);
}

export function attachFilterListeners() {
    const customDropdowns = ['filter-session', 'filter-sme', 'filter-type', 'filter-category', 'filter-difficulty'];
    customDropdowns.forEach(id => {
        const input = document.getElementById(id);
        const list = document.getElementById(`list-${id}`);
        const container = document.getElementById(`container-${id}`);
        if (!input || !list || !container) return;

        input.addEventListener('focus', () => {
            document.querySelectorAll('.custom-dropdown-list.active').forEach(l => l !== list && l.classList.remove('active'));
            list.classList.add('active');
            list.querySelectorAll('.custom-dropdown-item').forEach(item => item.style.display = 'block');
            list.querySelectorAll('div[style*="uppercase"]').forEach(el => el.style.display = 'block');
        });

        input.addEventListener('input', (e) => {
            if (input.classList.contains('readonly-mode')) return;
            const searchTerm = e.target.value.toLowerCase();
            input.dataset.value = '';
            list.querySelectorAll('.custom-dropdown-item').forEach(item => {
                if (item.dataset.value === '' && searchTerm.length > 0) { item.style.display = 'none'; }
                else if (item.textContent.toLowerCase().includes(searchTerm)) { item.style.display = 'block'; }
                else { item.style.display = 'none'; }
            });
            list.querySelectorAll('div[style*="uppercase"]').forEach(el => { el.style.display = searchTerm.length > 0 ? 'none' : 'block'; });
            list.classList.add('active');
            applyFiltersAndRender();
        });

        list.addEventListener('click', (e) => {
            if (e.target.classList.contains('custom-dropdown-item')) {
                const val = e.target.dataset.value;
                const label = e.target.dataset.value === '' ? '' : e.target.textContent;
                input.value = label; input.dataset.value = val; list.classList.remove('active'); applyFiltersAndRender();
            }
        });

        document.addEventListener('click', (e) => { if (!container.contains(e.target)) list.classList.remove('active'); });
    });

    ['filter-topic', 'filter-date-start', 'filter-date-end'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', applyFiltersAndRender);
    });

    const clearBtn = document.getElementById('clear-filters-btn');
    if (clearBtn) {
        clearBtn.addEventListener('click', () => {
            customDropdowns.forEach(id => { const input = document.getElementById(id); if (input) { input.value = ''; input.dataset.value = ''; } });
            ['filter-topic', 'filter-date-start', 'filter-date-end'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
            applyFiltersAndRender();
        });
    }

    const exportBtn = document.getElementById('export-selected-btn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            const selectedIds = Array.from(document.querySelectorAll('.mq-checkbox:checked')).map(cb => cb.dataset.id);
            if (selectedIds.length === 0) return;
            const questionsToExport = state.savedQuestions.filter(q => selectedIds.includes(q._id));
            const hasCoding = questionsToExport.some(q => q.type === 'coding');
            if (hasCoding) { downloadAsZip({ title: 'Exported_Questions', subtopic: 'Export', starterCode: {}, textExportMode: true, exportedQuestions: questionsToExport }); }
            else { downloadQuestions(questionsToExport, 'mcq', 'md'); }
        });
    }
}

export function applyFiltersAndRender() {
    const container = document.getElementById('questions-table-container');
    if (!container) return;

    const getInputVal = (id) => {
        const el = document.getElementById(id);
        if (!el) return '';
        if (el.dataset.value !== undefined && el.dataset.value !== '') return el.dataset.value.toLowerCase();
        return el.classList.contains('readonly-mode') ? '' : el.value.toLowerCase();
    };

    const fSession = getInputVal('filter-session');
    const fSme = getInputVal('filter-sme');
    const fType = getInputVal('filter-type');
    const fCategory = getInputVal('filter-category');
    const fDiff = getInputVal('filter-difficulty');
    const fTopic = (document.getElementById('filter-topic')?.value || '').toLowerCase();
    const fStart = document.getElementById('filter-date-start')?.value;
    const fEnd = document.getElementById('filter-date-end')?.value;

    const filtered = state.savedQuestions.filter(q => {
        if (fSession) { if (!((q.sessionId || '').toLowerCase().includes(fSession) || (q.sessionName || '').toLowerCase().includes(fSession))) return false; }
        if (fSme && !(q.smeName || '').toLowerCase().includes(fSme)) return false;
        if (fType && (q.type || '').toLowerCase() !== fType) return false;
        if (fCategory && (q.category || '').toLowerCase() !== fCategory) return false;
        if (fDiff && (q.difficulty || '').toLowerCase() !== fDiff) return false;
        if (fTopic) { const txt = ((q.subtopic || '') + ' ' + (q.title || '') + ' ' + (q.question || '')).toLowerCase(); if (!txt.includes(fTopic)) return false; }
        if (fStart || fEnd) {
            const qDate = new Date(q.createdAt);
            if (fStart && qDate < new Date(fStart)) return false;
            if (fEnd) { const endDate = new Date(fEnd); endDate.setHours(23, 59, 59, 999); if (qDate > endDate) return false; }
        }
        return true;
    });

    if (fSession || fSme || fType || fCategory || fDiff || fTopic || fStart || fEnd) {
        state.mqPagination.sessionPage = 1;
    }

    renderQuestionsTable(filtered);
}

export function renderQuestionsTable(questions) {
    const container = document.getElementById('questions-table-container');
    if (!container) return;

    if (questions.length === 0) {
        container.innerHTML = `<div class="empty-state-v2">No questions match your current filters.</div>`;
        return;
    }

    const groups = {};
    questions.forEach(q => {
        const sId = q.sessionId || 'ungrouped';
        if (!groups[sId]) groups[sId] = { name: q.sessionName || (sId === 'ungrouped' ? 'All Questions' : sId), id: sId, items: [], latestDate: 0 };
        groups[sId].items.push(q);
        const qDate = new Date(q.createdAt).getTime();
        if (qDate > groups[sId].latestDate) groups[sId].latestDate = qDate;
    });

    Object.values(groups).forEach(group => {
        group.items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    });

    const groupArray = Object.values(groups).sort((a, b) => {
        if (a.id === 'ungrouped') return -1;
        if (b.id === 'ungrouped') return 1;
        return b.latestDate - a.latestDate;
    });

    const totalSessionPages = Math.ceil(groupArray.length / state.mqPagination.sessionsPerPage) || 1;
    if (state.mqPagination.sessionPage > totalSessionPages) state.mqPagination.sessionPage = totalSessionPages;
    if (state.mqPagination.sessionPage < 1) state.mqPagination.sessionPage = 1;

    const sessionStartIdx = (state.mqPagination.sessionPage - 1) * state.mqPagination.sessionsPerPage;
    const paginatedGroups = groupArray.slice(sessionStartIdx, sessionStartIdx + state.mqPagination.sessionsPerPage);

    let html = '';
    paginatedGroups.forEach(group => {
        const dateObj = new Date(group.latestDate);
        const formattedDate = group.latestDate > 0 ? `${dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}, ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}` : 'Unknown Date';
        const isCollapsed = state.collapsedGroups[group.id] === true;
        const totalItems = group.items.length;
        let currentItemPage = state.mqPagination.groupPages[group.id] || 1;
        const totalItemPages = Math.ceil(totalItems / state.mqPagination.itemsPerPage) || 1;
        if (currentItemPage > totalItemPages) currentItemPage = totalItemPages;
        if (currentItemPage < 1) currentItemPage = 1;
        const itemStartIdx = (currentItemPage - 1) * state.mqPagination.itemsPerPage;
        const itemEndIdx = itemStartIdx + state.mqPagination.itemsPerPage;
        const paginatedItems = group.items.slice(itemStartIdx, itemEndIdx);

        html += `
    <div class="session-group-card" style="background: rgba(15, 23, 42, 0.4); border: 1px solid var(--border); border-radius: 8px; margin-bottom: 24px; overflow: hidden; transition: all 0.3s ease;">
      <div style="background: rgba(255,255,255,0.02); padding: 12px 20px; border-bottom: ${isCollapsed ? 'none' : '1px solid var(--border)'}; display: flex; justify-content: space-between; align-items: center; cursor: pointer;" onclick="toggleGroupCollapse('${group.id}')" onmouseover="this.style.background='rgba(255,255,255,0.05)'" onmouseout="this.style.background='rgba(255,255,255,0.02)'">
        <div style="display: flex; align-items: center; gap: 15px;">
           <span style="font-size: 1.2rem; display: inline-block; width: 20px; transition: transform 0.3s ease; transform: ${isCollapsed ? 'rotate(-90deg)' : 'rotate(0deg)'}; color: var(--primary-light);">▼</span>
           <div>
             <h3 style="margin: 0; font-size: 1.1rem; color: var(--text-primary); display: flex; align-items: center; gap: 8px;">
               <input type="checkbox" class="session-checkbox" data-session="${group.id}" style="accent-color: var(--primary); cursor: pointer; width: 16px; height: 16px;" title="Select all in session" onclick="event.stopPropagation();">
               <span style="font-weight: 600;">${group.name}</span>
               <span class="badge badge-primary" style="font-size: 0.7rem; background: rgba(99, 102, 241, 0.15); color: var(--primary-light);">${totalItems} Items</span>
             </h3>
           </div>
        </div>
        <div style="display: flex; gap: 8px;" onclick="event.stopPropagation();">
          ${group.id !== 'ungrouped' ? `
            <button class="btn btn-secondary btn-sm" onclick="renameSession('${group.id}', '${group.name.replace(/'/g, "\\'")}')">Rename</button>
            <button class="btn btn-secondary btn-sm" onclick="exportSession('${group.id}')">Export ZIP</button>
            <button class="btn btn-danger btn-sm" onclick="deleteSession('${group.id}')">Delete Session</button>
          ` : ''}
        </div>
      </div>
      
      <div id="col-body-${group.id}" style="display: ${isCollapsed ? 'none' : 'block'};">
        <div class="table-responsive" style="margin: 0; border: none; background: transparent;">
          <table class="admin-table" style="margin: 0;">
            <thead>
              <tr>
                 <th style="width: 40px; text-align: center;">✓</th>
                <th>Type</th>
                <th>Topic</th>
                <th>Difficulty</th>
                <th>SME</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              ${paginatedItems.map(q => `
                <tr id="q-row-${q._id}">
                  <td style="text-align: center;"><input type="checkbox" class="mq-checkbox" data-id="${q._id}" data-session="${group.id}" style="accent-color: var(--primary); cursor: pointer; width: 16px; height: 16px;"></td>
                  <td><span class="badge badge-${q.type}">${q.type.toUpperCase()}</span></td>
                  <td><div style="font-weight: 600; color: var(--text-primary);">${q.subtopic}</div><div style="font-size: 0.75rem; opacity: 0.7;">${q.title || (q.question ? q.question.substring(0, 50) + '...' : 'No description')}</div></td>
                  <td><span class="diff-tag ${q.difficulty}">${q.difficulty}</span></td>
                  <td style="opacity: 0.8;"><div>${q.smeName || 'System'}</div><div style="font-size: 0.7rem; opacity: 0.6; margin-top: 2px;">🕒 ${new Date(q.createdAt).toLocaleDateString([], { day: '2-digit', month: 'short', year: 'numeric' })}</div></td>
                  <td>
                    <div style="display: flex; gap: 8px;">
                      <button class="btn btn-secondary btn-sm" onclick="editSavedQuestion('${q._id}')" style="padding: 4px 8px; font-size: 0.75rem;">👁️ View</button>
                      <button class="btn btn-secondary btn-sm" onclick="downloadSavedQuestion('${q._id}')" style="padding: 4px 8px; font-size: 0.75rem;">${q.type === 'coding' ? '📦 ZIP' : '⬇️ Download'}</button>
                      <button class="btn btn-danger btn-sm" onclick="this.disabled=true; deleteSavedQuestion('${q._id}')" style="padding: 4px 8px; font-size: 0.75rem; background: rgba(239, 68, 68, 0.1); border-color: rgba(239, 68, 68, 0.2); color: var(--danger-light);">🗑️</button>
                    </div>
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        ${totalItemPages > 1 ? `
        <div style="padding: 10px 20px; display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.15);">
          <span style="font-size: 0.75rem; color: var(--text-secondary);">Showing ${itemStartIdx + 1} - ${Math.min(itemEndIdx, totalItems)} of ${totalItems}</span>
          <div style="display: flex; gap: 5px; align-items: center;">
             <button class="btn btn-secondary btn-sm" onclick="changeMqGroupPage('${group.id}', ${currentItemPage - 1})" ${currentItemPage === 1 ? 'disabled' : ''} style="padding: 2px 8px; font-size: 0.8rem;">&lt;</button>
             <span style="font-size: 0.8rem; margin: 0 8px;">Page ${currentItemPage} / ${totalItemPages}</span>
             <button class="btn btn-secondary btn-sm" onclick="changeMqGroupPage('${group.id}', ${currentItemPage + 1})" ${currentItemPage === totalItemPages ? 'disabled' : ''} style="padding: 2px 8px; font-size: 0.8rem;">&gt;</button>
          </div>
        </div>
        ` : ''}
      </div>
    </div>
    `;
    });

    if (totalSessionPages > 1 || state.mqPagination.sessionPage > 1) {
        html += `
       <div class="global-pagination-bar" style="display: flex; justify-content: center; align-items: center; gap: 15px; margin-top: 30px; padding: 15px; background: rgba(15, 23, 42, 0.4); border-radius: 8px; border: 1px solid var(--border);">
          <button class="btn btn-secondary btn-sm" onclick="changeMqSessionPage(${state.mqPagination.sessionPage - 1})" ${state.mqPagination.sessionPage === 1 ? 'disabled' : ''}>← Previous Page</button>
          <span style="font-weight: bold; color: var(--primary-light);">Session Block ${state.mqPagination.sessionPage} of ${totalSessionPages}</span>
          <button class="btn btn-secondary btn-sm" onclick="changeMqSessionPage(${state.mqPagination.sessionPage + 1})" ${state.mqPagination.sessionPage === totalSessionPages ? 'disabled' : ''}>Next Page →</button>
       </div>
     `;
    }

    container.innerHTML = html;

    // Re-attach checkbox listeners
    const sessionCbs = container.querySelectorAll('.session-checkbox');
    const itemCbs = container.querySelectorAll('.mq-checkbox');
    const exportBtnEl = document.getElementById('export-selected-btn');

    const updateExportBtn = () => {
        const cnt = document.querySelectorAll('#questions-table-container .mq-checkbox:checked').length;
        if (exportBtnEl) { exportBtnEl.disabled = cnt === 0; exportBtnEl.textContent = `📦 Export Selected (${cnt})`; }
    };

    sessionCbs.forEach(scb => {
        scb.addEventListener('change', (e) => {
            const sId = e.target.dataset.session;
            container.querySelectorAll(`.mq-checkbox[data-session="${sId}"]`).forEach(cb => { cb.checked = e.target.checked; });
            updateExportBtn();
        });
    });

    itemCbs.forEach(cb => {
        cb.addEventListener('change', (e) => {
            const sId = e.target.dataset.session;
            const groupCbs = Array.from(container.querySelectorAll(`.mq-checkbox[data-session="${sId}"]`));
            const sessCb = document.querySelector(`.session-checkbox[data-session="${sId}"]`);
            if (sessCb) sessCb.checked = groupCbs.every(c => c.checked) && groupCbs.length > 0;
            updateExportBtn();
        });
    });
}
