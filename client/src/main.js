// =============================================
// MAIN.JS — Application Entry Point
// Imports all page shells and feature modules,
// renders the app shell, and boots the application.
// =============================================

import './style.css';

// Page shells
import { renderHomePage } from './pages/HomePage.js';
import { renderAdminPage } from './pages/AdminPage.js';
import { renderMCQPage } from './pages/MCQPage.js';
import { renderCodingPage } from './pages/CodingPage.js';
import { renderResultPage } from './pages/ResultPage.js';

// State
import { state } from './state/appState.js';

// Feature handlers — loaded after DOM is ready
import { attachHomeListeners, showLogoutConfirmation } from './features/auth/authHandlers.js';
import { enterAdminPanel, handleGenerateClick, updateGeneratorWatermark } from './features/generator/generatorHandlers.js';
import { attachMCQListeners } from './features/mcq/mcqHandlers.js';
import { initRouter, showAdminTab } from './router/router.js';

// Components
import { updateDashboardStats } from './components/DashboardStats.js';
import { loadSMEs } from './components/SMEManager.js';
import { fetchAndRenderSavedQuestions } from './components/QuestionBank.js';
import { bulkSaveQuestions } from './services/backendService.js';
import { showToast } from './utils/ui.js';

// Side-effect imports: these modules register critical window.* globals
// used by inline onclick handlers inside the rendered question bank table.
// They MUST be imported here even though no named exports are used.
import './features/questionBank/bankHandlers.js';   // window.toggleGroupCollapse, deleteSession, etc.
import './components/QuestionDetailModal.js';        // window.editSavedQuestion, downloadSavedQuestion

// =============================================
// RENDER APP SHELL
// =============================================
function renderApp() {
  document.getElementById('app').innerHTML = `
    <!-- Brand Header -->
    <header class="brand-header" id="brand-header">
      <div class="brand-header-inner">
        <img src="/new-edutech-logo.webp" alt="L&T EduTech Logo" class="brand-logo brand-logo-edutech" />
        <img src="/download.svg" alt="Solve Logo" class="brand-logo brand-logo-solve" />
      </div>
    </header>

    <!-- Animated Background -->
    <div class="bg-animated">
      <div class="bg-orb bg-orb-1"></div>
      <div class="bg-orb bg-orb-2"></div>
      <div class="bg-orb bg-orb-3"></div>
    </div>

    <!-- Toast Container -->
    <div class="toast-container" id="toast-container"></div>

    <!-- Loading Overlay -->
    <div class="loading-overlay" id="loading-overlay">
      <div class="spinner"></div>
      <div class="loading-text">Generating your test...</div>
    </div>

    <!-- SVG Defs for gradients -->
    <svg width="0" height="0" style="position:absolute">
      <defs>
        <linearGradient id="scoreGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#6366f1"/>
          <stop offset="50%" stop-color="#8b5cf6"/>
          <stop offset="100%" stop-color="#06b6d4"/>
        </linearGradient>
      </defs>
    </svg>

    <!-- HOME PAGE -->
    <div id="home-page" class="page active">
      ${renderHomePage()}
    </div>

    <!-- ADMIN PAGE -->
    <div id="admin-page" class="page">
      ${renderAdminPage()}
    </div>

    <!-- MCQ TEST PAGE -->
    <div id="mcq-page" class="page">
      ${renderMCQPage()}
    </div>

    <!-- CODING TEST PAGE -->
    <div id="coding-page" class="page">
      ${renderCodingPage()}
    </div>

    <!-- RESULT PAGE -->
    <div id="result-page" class="page">
      ${renderResultPage()}
    </div>

    <!-- Confirmation Modal (top-level for logout) -->
    <div class="loading-overlay" id="confirm-modal-overlay" style="z-index: 9999; backdrop-filter: blur(8px);">
      <div class="card card-glass" style="max-width: 420px; width: 90%; padding: 32px; text-align: center; animation: slideIn 0.3s ease;">
        <div id="confirm-modal-icon" style="font-size: 2.5rem; margin-bottom: 16px;">🚪</div>
        <h3 id="confirm-modal-title" style="font-size: 1.2rem; font-weight: 700; margin-bottom: 10px; color: var(--text);">Log Out?</h3>
        <p id="confirm-modal-message" style="font-size: 0.9rem; color: var(--text-secondary); line-height: 1.5; margin-bottom: 28px;">Are you sure you want to log out?</p>
        <div style="display: flex; gap: 12px; justify-content: center;">
          <button class="btn btn-secondary" id="confirm-modal-cancel" style="min-width: 120px;">Cancel</button>
          <button class="btn btn-primary" id="confirm-modal-confirm" style="min-width: 120px; background: linear-gradient(135deg, #ef4444, #dc2626);">Log Out</button>
        </div>
      </div>
    </div>
  `;

  // Attach all event listeners
  attachHomeListeners();
  attachAdminListeners();
  attachMCQListeners();
}

// =============================================
// ADMIN LISTENERS — Tab switching,
// Generator form, SME management, Question Bank
// =============================================
function attachAdminListeners() {
  // Tab switching — delegate fully to the router so history is updated
  document.querySelectorAll('.nav-item').forEach(navItem => {
    navItem.addEventListener('click', () => {
      const tabId = navItem.dataset.tab;
      showAdminTab(tabId); // updates URL + CSS + triggers side-effects
    });
  });

  // Logout
  const backBtn = document.getElementById('admin-back-btn');
  if (backBtn) backBtn.addEventListener('click', showLogoutConfirmation);

  // View All -> jump to questions tab
  const viewAllBtn = document.getElementById('view-all-questions-btn');
  if (viewAllBtn) {
    viewAllBtn.addEventListener('click', () => {
      const questionsNav = document.querySelector('[data-tab="questions"]');
      if (questionsNav) questionsNav.click();
    });
  }

  // Refresh questions
  const refreshBtn = document.getElementById('refresh-questions-btn');
  if (refreshBtn) refreshBtn.addEventListener('click', () => fetchAndRenderSavedQuestions(true));

  // Generator category & subtopic
  const subtopicsPool = {
    languages: ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'SQL', 'C', 'TypeScript', 'MATLAB', 'R'],
    subjects: ['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering', 'System Design', 'Theory of Computation', 'Computer Architecture'],
    stacks: ['MERN Stack', 'MEAN Stack', 'LAMP Stack', 'JAMstack', 'Serverless', 'Microservices', 'Django + PostgreSQL', 'Spring Boot + MySQL', 'FastAPI + MongoDB', 'Ruby on Rails'],
    frameworks: ['React.js', 'Angular', 'Vue.js', 'Next.js', 'Nuxt.js', 'Spring Boot', 'Django', 'FastAPI', 'Flask', 'Flutter', 'React Native', 'Laravel', 'Express.js', 'ASP.NET Core']
  };

  const genCategory = document.getElementById('gen-category');
  const genSubtopic = document.getElementById('gen-subtopic');

  function updateSubtopics() {
    const cat = genCategory?.value || 'subjects';
    const options = subtopicsPool[cat] || [];
    if (genSubtopic) {
      genSubtopic.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
    }
  }

  if (genCategory) {
    genCategory.addEventListener('change', updateSubtopics);
    updateSubtopics(); // Initialize
  }

  // Type toggle
  const typeSegments = document.querySelectorAll('#gen-type-toggle .type-segment');
  typeSegments.forEach(seg => {
    seg.addEventListener('click', () => {
      typeSegments.forEach(s => s.classList.remove('active'));
      seg.classList.add('active');
    });
  });

  // Generate button
  const genBtn = document.getElementById('generate-questions-btn');
  if (genBtn) genBtn.addEventListener('click', handleGenerateClick);

  // Save generated questions
  const saveBtn = document.getElementById('save-generated-btn');
  if (saveBtn) {
    saveBtn.addEventListener('click', async () => {
      const questions = state.lastGenerated;
      const type = state.lastGeneratedType;
      if (!questions || questions.length === 0) return;

      saveBtn.disabled = true;
      saveBtn.innerHTML = '<span class="spinner-sm"></span> Saving...';

      try {
        await bulkSaveQuestions(questions, type);
        showToast('success', `${questions.length} questions saved to MongoDB!`);
        saveBtn.innerHTML = '✅ Saved!';
        saveBtn.classList.remove('btn-primary'); saveBtn.classList.add('btn-success');
        updateDashboardStats(true);
        fetchAndRenderSavedQuestions(true);
      } catch (err) {
        console.error(err);
        showToast('error', 'Failed to save: ' + err.message);
        saveBtn.disabled = false;
        saveBtn.innerHTML = '💾 Save to Database';
      }
    });
  }

  // Add SME
  const addSmeBtn = document.getElementById('add-sme-btn');
  if (addSmeBtn) {
    addSmeBtn.addEventListener('click', async () => {
      const name = document.getElementById('sme-name-input')?.value.trim();
      const apiKey = document.getElementById('sme-key-input')?.value.trim();
      const model = document.getElementById('sme-model-input')?.value;

      if (!name || !apiKey) {
        showToast('error', 'Please fill in the SME name and API key.');
        return;
      }

      addSmeBtn.disabled = true;
      addSmeBtn.innerHTML = '<span class="spinner-sm"></span> Adding...';

      try {
        const res = await fetch('/api/smes', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, apiKey, model })
        });
        if (!res.ok) throw new Error('Failed to add SME');
        const saved = await res.json();
        state.smes = [...(state.smes || []), saved];
        document.getElementById('sme-name-input').value = '';
        document.getElementById('sme-key-input').value = '';
        showToast('success', `SME "${name}" added successfully!`);
        loadSMEs();
      } catch (err) {
        showToast('error', err.message);
      } finally {
        addSmeBtn.disabled = false;
        addSmeBtn.innerHTML = '✨ Add SME Profile';
      }
    });
  }

  // On initial admin load, trigger dashboard fetch
  updateDashboardStats(true);
  updateGeneratorWatermark();
  loadSMEs();
}

// =============================================
// BOOT
// =============================================
renderApp();

// Initialise URL-based routing (must be after renderApp so pages exist in DOM)
initRouter();


