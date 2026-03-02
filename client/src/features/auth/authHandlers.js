// =============================================
// AUTH HANDLERS
// attachHomeListeners(), showLogoutConfirmation()
// Login, Signup, and logout confirmation logic.
// Extracted from main.js L942-1206
// =============================================

import { state } from '../../state/appState.js';
import { showPage, setLoggedIn } from '../../router/router.js';
import { showToast } from '../../utils/ui.js';
import { enterAdminPanel } from '../generator/generatorHandlers.js';
import { startTest } from '../mcq/mcqHandlers.js';

function showAuthMessage(type, msg) {
    const el = document.getElementById('auth-message');
    if (!el) return;
    el.style.display = 'block';
    el.style.background = type === 'error' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(16, 185, 129, 0.15)';
    el.style.border = `1px solid ${type === 'error' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`;
    el.style.color = type === 'error' ? '#fca5a5' : '#6ee7b7';
    el.innerHTML = `${type === 'error' ? '❌' : '✅'} ${msg}`;
}

export function showLogoutConfirmation() {
    const overlay = document.getElementById('confirm-modal-overlay');
    if (!overlay) return;
    overlay.classList.add('active');

    const confirmBtn = document.getElementById('confirm-modal-confirm');
    const cancelBtn = document.getElementById('confirm-modal-cancel');
    const cleanup = () => { overlay.classList.remove('active'); };

    const newConfirm = confirmBtn.cloneNode(true);
    const newCancel = cancelBtn.cloneNode(true);
    confirmBtn.parentNode.replaceChild(newConfirm, confirmBtn);
    cancelBtn.parentNode.replaceChild(newCancel, cancelBtn);

    newCancel.addEventListener('click', cleanup);
    newConfirm.addEventListener('click', () => {
        cleanup();
        setLoggedIn(false);          // ← clear auth flag
        showPage('home-page');
        const authView = document.getElementById('auth-view');
        const landingView = document.getElementById('landing-view');
        if (authView) authView.style.display = 'none';
        if (landingView) landingView.style.display = 'flex';
        showToast('info', 'You have been logged out successfully');
    });

    overlay.onclick = (e) => { if (e.target === overlay) cleanup(); };
}

export function attachHomeListeners() {
    const landingView = document.getElementById('landing-view');
    const selectionView = document.getElementById('selection-view');
    const authView = document.getElementById('auth-view');

    document.getElementById('goto-practice-btn').addEventListener('click', () => {
        landingView.style.display = 'none';
        selectionView.style.display = 'flex';
    });

    document.getElementById('goto-login-btn').addEventListener('click', () => {
        landingView.style.display = 'none';
        authView.style.display = 'flex';
    });

    document.getElementById('auth-back-btn').addEventListener('click', () => {
        authView.style.display = 'none';
        landingView.style.display = 'flex';
        const msgEl = document.getElementById('auth-message');
        if (msgEl) msgEl.style.display = 'none';
    });

    // Auth mode toggle
    const authModeSegments = document.querySelectorAll('#auth-mode-toggle .type-segment');
    authModeSegments.forEach(seg => {
        seg.addEventListener('click', () => {
            authModeSegments.forEach(s => s.classList.remove('active'));
            seg.classList.add('active');
            const mode = seg.dataset.value;
            document.getElementById('auth-login-form').style.display = mode === 'login' ? 'block' : 'none';
            document.getElementById('auth-signup-form').style.display = mode === 'signup' ? 'block' : 'none';
            document.getElementById('auth-view-title').textContent = mode === 'login' ? 'Admin Login' : 'Create Account';
            const msgEl = document.getElementById('auth-message');
            if (msgEl) msgEl.style.display = 'none';
        });
    });

    // Login handler
    document.getElementById('login-submit-btn').addEventListener('click', async () => {
        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value;
        if (!email || !password) return showAuthMessage('error', 'Please fill in all fields');

        const btn = document.getElementById('login-submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Logging in...';

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Login failed');
            setLoggedIn(true);           // ← set auth flag before navigating
            showToast('success', `Welcome back, ${data.user.email}!`);
            enterAdminPanel();
        } catch (err) {
            showAuthMessage('error', err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '🔓 Sign In';
        }
    });

    // Signup handler
    document.getElementById('signup-submit-btn').addEventListener('click', async () => {
        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value;
        const confirm = document.getElementById('signup-confirm').value;

        if (!email || !password || !confirm) return showAuthMessage('error', 'Please fill in all fields');
        if (password.length < 6) return showAuthMessage('error', 'Password must be at least 6 characters');
        if (password !== confirm) return showAuthMessage('error', 'Passwords do not match');

        const btn = document.getElementById('signup-submit-btn');
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-sm"></span> Creating account...';

        try {
            const res = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Signup failed');

            showAuthMessage('success', 'Account created successfully! Please sign in with your credentials.');
            setTimeout(() => {
                const loginTab = Array.from(document.querySelectorAll('#auth-mode-toggle .type-segment')).find(el => el.dataset.value === 'login');
                if (loginTab) loginTab.click();
                const loginEmail = document.getElementById('login-email');
                if (loginEmail) loginEmail.value = email;
                const loginPass = document.getElementById('login-password');
                if (loginPass) loginPass.focus();
            }, 2000);
        } catch (err) {
            showAuthMessage('error', err.message);
        } finally {
            btn.disabled = false;
            btn.innerHTML = '✨ Create Account';
        }
    });

    // Enter key support
    document.getElementById('login-password').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('login-submit-btn').click();
    });
    document.getElementById('signup-confirm').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') document.getElementById('signup-submit-btn').click();
    });

    document.getElementById('goto-admin-landing-btn').addEventListener('click', () => {
        showPage('admin-page');
    });

    document.getElementById('back-to-landing-btn').addEventListener('click', () => {
        selectionView.style.display = 'none';
        landingView.style.display = 'flex';
    });

    // Difficulty buttons
    document.querySelectorAll('.diff-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.difficulty = btn.dataset.level;
        });
    });

    // Test type toggle
    const homeTypeSegments = document.querySelectorAll('#home-test-type-toggle .type-segment');
    homeTypeSegments.forEach(seg => {
        seg.addEventListener('click', () => {
            homeTypeSegments.forEach(s => s.classList.remove('active'));
            seg.classList.add('active');
            state.testType = seg.dataset.value;
        });
    });

    // Category & Subtopic logic
    const homeCatSelect = document.getElementById('test-category-select');
    const homeSubSelect = document.getElementById('test-subtopic-select');

    if (homeCatSelect && homeSubSelect) {
        const subtopicsPool = {
            languages: ['Python', 'JavaScript', 'Java', 'C++', 'Go', 'Rust', 'Swift', 'Kotlin', 'PHP', 'Ruby', 'SQL'],
            subjects: ['Data Structures', 'Algorithms', 'DBMS', 'Operating Systems', 'Computer Networks', 'Software Engineering'],
            stacks: ['MERN Stack', 'MEAN Stack', 'LAMP Stack', 'JAMstack', 'Serverless', 'Microservices'],
            frameworks: ['React.js', 'Angular', 'Vue.js', 'Spring Boot', 'Django', 'FastAPI', 'Flutter', 'React Native', 'Laravel']
        };

        const updateHomeSubtopics = () => {
            const cat = homeCatSelect.value;
            const options = subtopicsPool[cat] || [];
            homeSubSelect.innerHTML = options.map(opt => `<option value="${opt}">${opt}</option>`).join('');
            state.category = cat;
            state.subtopic = homeSubSelect.value;
        };

        homeCatSelect.addEventListener('change', updateHomeSubtopics);
        homeSubSelect.addEventListener('change', () => { state.subtopic = homeSubSelect.value; });
        updateHomeSubtopics();
    }

    // Start test
    document.getElementById('start-test-btn').addEventListener('click', async () => {
        if (!state.groqKey) {
            showToast('error', 'Please configure your Groq API Key in Admin Settings first!');
            showPage('admin-page');
            const settingsTab = document.querySelector('[data-tab="settings"]');
            if (settingsTab) settingsTab.click();
            return;
        }
        await startTest();
    });
}
