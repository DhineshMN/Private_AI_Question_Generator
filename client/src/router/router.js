// =============================================
// ROUTER — Client-Side URL Routing with History API
// =============================================
// URL map:
//   /                → home-page (landing / login)
//   /admin           → admin-page (dashboard tab)
//   /admin/generator → admin-page (generator tab)
//   /admin/questions → admin-page (question bank tab)
//   /admin/settings  → admin-page (settings tab)
//   /mcq             → mcq-page
//   /coding          → coding-page
//   /result          → result-page

// ── which pageId does each URL path belong to? ──────────────────────────────
const PATH_TO_PAGE = {
    '/': 'home-page',
    '/admin': 'admin-page',
    '/admin/generator': 'admin-page',
    '/admin/questions': 'admin-page',
    '/admin/settings': 'admin-page',
    '/mcq': 'mcq-page',
    '/coding': 'coding-page',
    '/result': 'result-page',
};

// ── canonical URL for each top-level page ───────────────────────────────────
const PAGE_TO_PATH = {
    'home-page': '/',
    'admin-page': '/admin',
    'mcq-page': '/mcq',
    'coding-page': '/coding',
    'result-page': '/result',
};

// ── which admin tab does each URL path activate? ────────────────────────────
const PATH_TO_TAB = {
    '/admin': 'dashboard',
    '/admin/generator': 'generator',
    '/admin/questions': 'questions',
    '/admin/settings': 'settings',
};

// ── from tabId → URL path ────────────────────────────────────────────────────
const TAB_TO_PATH = {
    dashboard: '/admin',
    generator: '/admin/generator',
    questions: '/admin/questions',
    settings: '/admin/settings',
};

// ── auth helper ──────────────────────────────────────────────────────────────
export function setLoggedIn(value) {
    if (value) sessionStorage.setItem('isLoggedIn', 'true');
    else sessionStorage.removeItem('isLoggedIn');
}

function isLoggedIn() {
    return sessionStorage.getItem('isLoggedIn') === 'true';
}

// ── internal DOM helpers ─────────────────────────────────────────────────────
function _activatePage(pageId) {
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    const page = document.getElementById(pageId);
    if (page) page.classList.add('active');
}

function _activateAdminTab(tabId) {
    document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    const navItem = document.querySelector(`.nav-item[data-tab="${tabId}"]`);
    const tab = document.getElementById(`tab-${tabId}`);
    if (navItem) navItem.classList.add('active');
    if (tab) tab.classList.add('active');
}

// Call side-effects for a tab (used both on click and on popstate)
function _triggerTabSideEffects(tabId) {
    if (tabId === 'dashboard') {
        import('../components/DashboardStats.js')
            .then(({ updateDashboardStats }) => updateDashboardStats(true));
    } else if (tabId === 'questions') {
        import('../components/QuestionBank.js')
            .then(({ fetchAndRenderSavedQuestions, attachFilterListeners }) => {
                fetchAndRenderSavedQuestions();
                attachFilterListeners();
            });
    } else if (tabId === 'settings') {
        import('../components/SMEManager.js')
            .then(({ loadSMEs }) => loadSMEs());
    } else if (tabId === 'generator') {
        import('../features/generator/generatorHandlers.js')
            .then(({ updateGeneratorWatermark }) => updateGeneratorWatermark());
    }
}

// ── public API ────────────────────────────────────────────────────────────────

/**
 * Navigate to a top-level page.
 * Pushes a history entry so browser back/forward works.
 * @param {string} pageId   e.g. 'admin-page'
 * @param {boolean} replace use replaceState instead of pushState
 */
export function showPage(pageId, replace = false) {
    const path = PAGE_TO_PATH[pageId] || '/';
    const state = { pageId, tabId: 'dashboard' };

    if (window.location.pathname !== path) {
        if (replace) history.replaceState(state, '', path);
        else history.pushState(state, '', path);
    }

    _activatePage(pageId);
}

/**
 * Switch admin tab AND push a history entry.
 * Called from the main.js nav-item click handler.
 * @param {string} tabId  e.g. 'questions'
 */
export function showAdminTab(tabId) {
    const path = TAB_TO_PATH[tabId] || '/admin';
    history.pushState({ pageId: 'admin-page', tabId }, '', path);
    _activateAdminTab(tabId);
    _triggerTabSideEffects(tabId);
}

/**
 * Initialise the router after the app shell is rendered in the DOM.
 * Resolves the correct page (and tab) from the current URL,
 * installs the popstate listener, and ensures '/home' is always
 * the first entry in the history stack.
 */
export function initRouter() {
    const path = window.location.pathname;
    const pageId = PATH_TO_PAGE[path] || 'home-page';
    const tabId = PATH_TO_TAB[path] || 'dashboard';

    // If the user lands directly on a protected page (e.g. via refresh or
    // bookmark on /admin) but isn't logged in, silently redirect to home.
    if (pageId === 'admin-page' && !isLoggedIn()) {
        history.replaceState({ pageId: 'home-page', tabId: null }, '', '/');
        _activatePage('home-page');
        return;
    }

    // Always ensure '/' is the BOTTOM of the history stack so the user
    // always lands on home when they exhaust the back-stack.
    // We do this by inserting home first (replaceState), then re-pushing
    // the actual current page if it differs from home.
    if (pageId !== 'home-page') {
        history.replaceState({ pageId: 'home-page', tabId: null }, '', '/');
        history.pushState({ pageId, tabId }, '', path);
    } else {
        history.replaceState({ pageId: 'home-page', tabId: null }, '', '/');
    }

    _activatePage(pageId);
    if (pageId === 'admin-page') {
        _activateAdminTab(tabId);
    }

    // ── popstate — browser back / forward ──────────────────────────────────
    window.addEventListener('popstate', (event) => {
        const { pageId: targetPage = 'home-page', tabId: targetTab = 'dashboard' } = event.state || {};

        // Auth guard: block forward-nav into admin if not logged in
        if (targetPage === 'admin-page' && !isLoggedIn()) {
            // Push home so the user doesn't get stuck in a loop
            history.replaceState({ pageId: 'home-page', tabId: null }, '', '/');
            _activatePage('home-page');
            return;
        }

        _activatePage(targetPage);

        if (targetPage === 'admin-page') {
            _activateAdminTab(targetTab);
            // Only trigger side-effects for tabs, not the whole page navigation
            _triggerTabSideEffects(targetTab);
        }
    });
}
