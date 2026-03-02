import { state } from '../state/appState.js';

// =============================================
// TOAST NOTIFICATIONS
// =============================================
export function showToast(type, message) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'none';
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(120%)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// =============================================
// LOADING OVERLAY
// =============================================
export function showLoading(show) {
    const overlay = document.getElementById('loading-overlay');
    if (overlay) overlay.classList.toggle('active', show);
}

// =============================================
// TIMER MANAGEMENT
// =============================================
export function startTimer(type, onFinish) {
    stopTimer();

    const timerId = type === 'mcq' ? 'mcq-timer' : 'coding-timer';
    const timerTextId = type === 'mcq' ? 'mcq-timer-text' : 'coding-timer-text';

    function updateDisplay() {
        const mins = Math.floor(state.timeLeft / 60);
        const secs = state.timeLeft % 60;
        const text = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        const timerEl = document.getElementById(timerId);
        const timerText = document.getElementById(timerTextId);

        if (timerText) timerText.textContent = text;

        if (timerEl) {
            timerEl.className = 'timer-display';
            const pct = state.timeLeft / state.totalTime;
            if (pct <= 0.1) timerEl.classList.add('critical');
            else if (pct <= 0.25) timerEl.classList.add('warning');
        }
    }

    updateDisplay();

    state.timerInterval = setInterval(() => {
        state.timeLeft--;
        updateDisplay();

        if (state.timeLeft <= 0) {
            stopTimer();
            showToast('error', "Time's up! Submitting your test...");
            if (onFinish) onFinish();
        }
    }, 1000);
}

export function stopTimer() {
    if (state.timerInterval) {
        clearInterval(state.timerInterval);
        state.timerInterval = null;
    }
}
