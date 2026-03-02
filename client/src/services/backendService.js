// =============================================
// BACKEND SERVICE — All REST API calls to Express server
// =============================================

const BASE_URL = 'http://localhost:5000';

// --- Auth ---
export async function loginUser(email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Login failed');
    return data;
}

export async function signupUser(email, password) {
    const res = await fetch(`${BASE_URL}/api/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Signup failed');
    return data;
}

// --- Stats ---
export async function syncStats() {
    try {
        const response = await fetch(`${BASE_URL}/api/stats`);
        if (!response.ok) throw new Error();
        return await response.json();
    } catch (err) {
        console.warn('Dashboard sync failed:', err);
        return null;
    }
}

// --- Questions ---
export async function fetchSavedQuestions() {
    try {
        const response = await fetch(`${BASE_URL}/api/questions`);
        if (!response.ok) throw new Error();
        return await response.json();
    } catch (error) {
        console.error(error);
        return [];
    }
}

export async function bulkSaveQuestions(questions, type) {
    const response = await fetch(`${BASE_URL}/api/questions/bulk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ questions, type })
    });
    if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || 'Failed to save to database');
    }
    return await response.json();
}

export async function updateQuestion(mongoId, updatedData) {
    const resp = await fetch(`${BASE_URL}/api/questions/${mongoId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
    });
    if (!resp.ok) throw new Error('Failed to update question');
    return await resp.json();
}

export async function deleteQuestion(mongoId) {
    try {
        const response = await fetch(`${BASE_URL}/api/questions/${mongoId}`, { method: 'DELETE' });
        if (!response.ok) throw new Error();
        return true;
    } catch (err) {
        console.error(err);
        return false;
    }
}

export async function clearAllQuestions() {
    const response = await fetch(`${BASE_URL}/api/questions/clear`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to clear database');
    return await response.json();
}

// --- Sessions ---
export async function renameSession(sessionId, sessionName) {
    const response = await fetch(`${BASE_URL}/api/questions/session/${sessionId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionName })
    });
    if (!response.ok) throw new Error('Failed to rename session');
    return await response.json();
}

export async function deleteSession(sessionId) {
    const response = await fetch(`${BASE_URL}/api/questions/session/${sessionId}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete session');
    return await response.json();
}

// --- SME Profiles ---
export async function fetchSMEs() {
    const response = await fetch(`${BASE_URL}/api/smes`);
    if (!response.ok) throw new Error('Failed to fetch SMEs');
    return await response.json();
}

export async function addSME(name, apiKey, model) {
    const response = await fetch(`${BASE_URL}/api/smes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, apiKey, model })
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error || 'Failed to add SME');
    return data;
}

export async function updateSME(id, updates) {
    const res = await fetch(`${BASE_URL}/api/smes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
    });
    if (!res.ok) throw new Error('Failed to update SME');
    return await res.json();
}

export async function deleteSMEProfile(id) {
    const res = await fetch(`${BASE_URL}/api/smes/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('Failed to delete SME');
    return await res.json();
}
