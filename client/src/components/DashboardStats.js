// =============================================
// DASHBOARD STATS COMPONENT — updateDashboardStats()
// =============================================

import { state } from '../state/appState.js';

export async function updateDashboardStats(force = false) {
    const mcqEl = document.getElementById('stat-mcq-count');
    const codingEl = document.getElementById('stat-coding-count');
    const smeCountEl = document.getElementById('stat-sme-count');
    const totalEl = document.getElementById('stat-total-questions');
    const activityContainer = document.getElementById('dashboard-recent-activity');
    const mixMcqBar = document.getElementById('mix-mcq-bar');
    const mixCodingBar = document.getElementById('mix-coding-bar');
    const mixMcqLabel = document.getElementById('mix-mcq-label');
    const mixCodingLabel = document.getElementById('mix-coding-label');

    if (!mcqEl) return;

    const now = Date.now();
    const isStale = now - state.lastStatsFetch > 30000;
    if (!isStale && !force) return;

    try {
        const response = await fetch('/api/stats');
        if (!response.ok) throw new Error();
        const data = await response.json();
        state.lastStatsFetch = now;

        const timeEl = document.getElementById('dashboard-last-updated');
        if (timeEl) timeEl.textContent = `Last synced: ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

        const total = (data.mcqCount || 0) + (data.codingCount || 0);
        mcqEl.textContent = (data.mcqCount || 0).toLocaleString();
        codingEl.textContent = (data.codingCount || 0).toLocaleString();
        if (smeCountEl) smeCountEl.textContent = data.smeStats ? data.smeStats.length : 0;
        if (totalEl) totalEl.textContent = total.toLocaleString();

        if (mixMcqBar && mixCodingBar) {
            const mcqPercent = total > 0 ? (data.mcqCount / total) * 100 : 50;
            const codingPercent = total > 0 ? (data.codingCount / total) * 100 : 50;
            mixMcqBar.style.width = `${mcqPercent}%`;
            mixCodingBar.style.width = `${codingPercent}%`;
            if (mixMcqLabel) mixMcqLabel.textContent = `MCQs: ${Math.round(mcqPercent)}%`;
            if (mixCodingLabel) mixCodingLabel.textContent = `Coding: ${Math.round(codingPercent)}%`;
        }

        if (activityContainer && data.recentActivity) {
            if (data.recentActivity.length === 0) {
                activityContainer.innerHTML = `<div class="empty-state-v2">No recent generation activity found</div>`;
            } else {
                activityContainer.innerHTML = data.recentActivity.map((act, idx) => `
          <div class="activity-item-v2" style="animation-delay: ${idx * 0.1}s">
            <div class="activity-icon-v2 ${act.type}">${act.type === 'mcq' ? '📝' : '💻'}</div>
            <div class="activity-details-v2">
              <div class="activity-text-v2"><strong>${act.type.toUpperCase()}</strong> added to <span class="topic-tag-v2">${act.subtopic}</span></div>
              <div class="activity-meta-v2">
                <span class="meta-tag-v2 ${act.difficulty}">${act.difficulty.toUpperCase()}</span>
                <span class="meta-time-v2">• Created ${new Date(act.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        `).join('');
            }
        }
    } catch (err) {
        console.warn('Dashboard sync failed:', err);
    }
}
