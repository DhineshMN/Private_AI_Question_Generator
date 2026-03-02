// =============================================
// RESULT RENDERER — showResultPage()
// Handles the show-result logic: score ring, performance banner, hints.
// Extracted from main.js L3663-3737
// =============================================

import { state } from '../state/appState.js';
import { showPage } from '../router/router.js';
import { stopTimer, startTimer } from '../utils/ui.js';

export function showResultPage(correct, total, type) {
    showPage('result-page');

    const percent = total > 0 ? Math.round((correct / total) * 100) : 0;
    const wrong = total - correct;

    document.getElementById('stat-correct').textContent = correct;
    document.getElementById('stat-wrong').textContent = wrong;
    document.getElementById('stat-total').textContent = total;
    document.getElementById('score-percent').textContent = `${percent}%`;

    // Animate ring
    const circumference = 2 * Math.PI * 70;
    const offset = circumference - (percent / 100) * circumference;
    const ring = document.getElementById('score-ring-fill');
    ring.style.strokeDasharray = circumference;
    ring.style.strokeDashoffset = circumference;
    setTimeout(() => { ring.style.strokeDashoffset = offset; }, 300);

    // Performance banner
    let perf;
    if (percent >= 90) perf = { cls: 'excellent', emoji: '🏆', title: 'Excellent!', desc: "Outstanding performance! You're a star student." };
    else if (percent >= 75) perf = { cls: 'good', emoji: '🎯', title: 'Great Job!', desc: "Very good performance! A little more practice and you'll be perfect." };
    else if (percent >= 50) perf = { cls: 'average', emoji: '📚', title: 'Good Effort!', desc: 'Decent performance. Review the topics and try again.' };
    else perf = { cls: 'needs-improvement', emoji: '💪', title: 'Needs Improvement', desc: "Don't give up! Practice more and you'll get better." };

    document.getElementById('result-emoji').textContent = perf.emoji;
    document.getElementById('result-title').textContent = type === 'coding' ? (correct ? 'Solution Accepted! 🎉' : 'Keep Practicing! 💪') : 'Test Complete!';
    document.getElementById('result-message').textContent =
        type === 'coding'
            ? (correct === total ? 'All solutions accepted! Exceptional logic.' : `You solved ${correct} out of ${total} challenges. Review the hints below.`)
            : `You answered ${correct} out of ${total} questions correctly.`;

    // Hints
    const hintsPanel = document.getElementById('ai-hints-panel');
    const hintsContent = document.getElementById('ai-hints-content');
    if (type === 'coding' && state.codingHints.length > 0) {
        hintsPanel.classList.add('active');
        hintsContent.innerHTML = state.codingHints.map((hint, i) => `
      <div style="margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.05);">
        <div style="font-weight: 600; font-size: 0.85rem; color: var(--text-muted); margin-bottom: 4px;">PROBLEM ${i + 1}: ${state.questions[i].title}</div>
        <div style="color: ${state.codingResults[i] ? 'var(--success-light)' : 'var(--text-primary)'}">${hint}</div>
      </div>
    `).join('');
    } else {
        hintsPanel.classList.remove('active');
    }

    const banner = document.getElementById('performance-banner');
    banner.className = `performance-banner ${perf.cls}`;
    document.getElementById('perf-icon').textContent = perf.emoji;
    document.getElementById('perf-title').textContent = perf.title;
    document.getElementById('perf-desc').textContent = perf.desc;

    document.getElementById('go-home-btn').onclick = () => {
        stopTimer();
        showPage('home-page');
    };

    document.getElementById('retry-btn').onclick = () => {
        stopTimer();
        import('../features/mcq/mcqHandlers.js').then(({ startTest }) => startTest());
    };
}
