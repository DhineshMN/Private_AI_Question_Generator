// =============================================
// MCQ FEATURE HANDLERS
// renderMCQQuestion(), renderMCQDots(), updateMCQDots(),
// saveCurrentAnswer(), attachMCQListeners(), submitMCQTest(), startTest()
// =============================================

import { state } from '../../state/appState.js';
import { showPage } from '../../router/router.js';
import { showToast, showLoading, startTimer, stopTimer } from '../../utils/ui.js';
import { generateAIQuestions } from '../../services/groqService.js';
import { renderCodingProblem, attachCodingListeners } from '../coding/codingHandlers.js';

export function renderMCQQuestion() {
    const q = state.questions[state.currentQuestion];
    const idx = state.currentQuestion;
    const total = state.questions.length;

    document.getElementById('mcq-current-num').textContent = idx + 1;
    document.getElementById('mcq-q-badge').textContent = `Question ${idx + 1}`;
    document.getElementById('mcq-question-text').textContent = q.question;

    const progress = ((idx + 1) / total) * 100;
    document.getElementById('mcq-progress-bar').style.width = `${progress}%`;

    const letters = ['A', 'B', 'C', 'D'];
    const optionsGrid = document.getElementById('mcq-options-grid');
    optionsGrid.innerHTML = q.options.map((opt, i) => `
    <div class="option-item" id="option-item-${i}">
      <input type="radio" name="mcq-option" id="opt-${i}" value="${i}"
        ${state.answers[idx] === i ? 'checked' : ''}>
      <label class="option-label" for="opt-${i}">
        <div class="option-radio-visual"></div>
        <span class="option-letter">${letters[i]}</span>
        <span>${opt}</span>
      </label>
    </div>
  `).join('');

    document.getElementById('mcq-prev-btn').disabled = idx === 0;
    document.getElementById('mcq-next-btn').textContent =
        idx === total - 1 ? '✓ Submit Test' : 'Next →';

    updateMCQDots();
    const card = document.getElementById('mcq-question-card');
    card.style.animation = 'none';
    card.offsetHeight;
    card.style.animation = 'pageIn 0.3s ease forwards';

    const optionInputs = optionsGrid.querySelectorAll('input[name="mcq-option"]');
    optionInputs.forEach(input => {
        input.addEventListener('change', () => {
            saveCurrentAnswer();
            setTimeout(() => {
                if (state.currentQuestion < state.questions.length - 1) {
                    state.currentQuestion++;
                    renderMCQQuestion();
                }
            }, 300);
        });
    });
}

export function renderMCQDots() {
    const dots = document.getElementById('mcq-dots');
    dots.innerHTML = state.questions.map((_, i) => `
    <div class="q-dot ${i === state.currentQuestion ? 'current' : ''} ${state.answers[i] !== null ? 'answered' : ''}"
      data-index="${i}" title="Question ${i + 1}"></div>
  `).join('');

    dots.querySelectorAll('.q-dot').forEach(dot => {
        dot.addEventListener('click', () => {
            saveCurrentAnswer();
            state.currentQuestion = parseInt(dot.dataset.index);
            renderMCQQuestion();
        });
    });
}

export function updateMCQDots() {
    const dots = document.querySelectorAll('.q-dot');
    dots.forEach((dot, i) => {
        dot.className = 'q-dot';
        if (i === state.currentQuestion) dot.classList.add('current');
        if (state.answers[i] !== null) dot.classList.add('answered');
    });
}

export function saveCurrentAnswer() {
    const selected = document.querySelector('input[name="mcq-option"]:checked');
    if (selected) {
        state.answers[state.currentQuestion] = parseInt(selected.value);
    }
}

export function attachMCQListeners() {
    document.getElementById('mcq-prev-btn').addEventListener('click', () => {
        saveCurrentAnswer();
        if (state.currentQuestion > 0) {
            state.currentQuestion--;
            renderMCQQuestion();
        }
    });

    document.getElementById('mcq-next-btn').addEventListener('click', () => {
        saveCurrentAnswer();
        if (state.currentQuestion < state.questions.length - 1) {
            state.currentQuestion++;
            renderMCQQuestion();
        } else {
            submitMCQTest();
        }
    });

    const exitBtn = document.getElementById('mcq-exit-btn');
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to exit the test? Your progress will be lost.')) {
                stopTimer();
                showPage('home-page');
            }
        });
    }
}

export function submitMCQTest() {
    stopTimer();
    let correct = 0;
    state.questions.forEach((q, i) => {
        if (state.answers[i] === q.correct) correct++;
    });
    showResultPage(correct, state.questions.length, 'mcq');
}

export async function startTest() {
    if (!state.groqKey) {
        showToast('error', 'Groq API Key missing! Please add it in Admin Settings.');
        showPage('admin-page');
        const settingsTab = document.querySelector('[data-tab="settings"]');
        if (settingsTab) settingsTab.click();
        return;
    }

    const loadingText = document.querySelector('#loading-overlay .loading-text');
    if (loadingText) loadingText.textContent = `AI is crafting your ${state.difficulty} ${state.testType.toUpperCase()} test on ${state.subtopic}...`;

    showLoading(true);

    try {
        const topic = state.subtopic;
        const type = state.testType;
        const difficulty = state.difficulty;
        const count = type === 'mcq' ? 10 : 3;

        const questions = await generateAIQuestions(topic, type, difficulty, count, state.category, state.subtopic, 'AI Practice System');

        if (type === 'mcq') {
            state.questions = questions;
            state.currentQuestion = 0;
            state.answers = new Array(questions.length).fill(null);
            state.timeLeft = questions.length * 60;
            state.totalTime = state.timeLeft;

            showPage('mcq-page');

            const diffLabel = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
            document.getElementById('mcq-difficulty-label').textContent = `${diffLabel} · MCQ`;
            document.getElementById('mcq-total-num').textContent = questions.length;

            renderMCQQuestion();
            renderMCQDots();
            startTimer('mcq', submitMCQTest);
        } else {
            state.questions = questions;
            state.problem = questions[0];
            state.currentQuestion = 0;

            const isSqlTopic = topic.toLowerCase().includes('sql') || topic.toLowerCase().includes('dbms');
            state.language = isSqlTopic ? 'sql' : 'python';

            const totalMins = questions.reduce((acc, q) => acc + parseInt(q.timeLimit || 30), 0);
            state.timeLeft = totalMins * 60;
            state.totalTime = state.timeLeft;

            showPage('coding-page');

            const diffLabel = state.difficulty.charAt(0).toUpperCase() + state.difficulty.slice(1);
            document.getElementById('coding-difficulty-label').textContent = `${diffLabel} · Problem 1`;

            renderCodingProblem();
            startTimer('coding', () => { /* submitCode handled in codingHandlers */ });
            attachCodingListeners();
        }
    } catch (error) {
        console.error(error);
        showToast('error', 'Failed to generate test: ' + error.message);
    } finally {
        showLoading(false);
        if (loadingText) loadingText.textContent = 'Generating your test...';
    }
}

// Import here to avoid circular dependency — showResultPage is defined in ResultPage logic
// since it references the DOM, we lazy-import it at call time
async function showResultPage(correct, total, type) {
    const { showResultPage: _showResultPage } = await import('../../components/ResultRenderer.js');
    _showResultPage(correct, total, type);
}
