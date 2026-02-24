// =============================================
// GLOBAL APPLICATION STATE
// =============================================

export const state = {
    testType: 'mcq',
    difficulty: 'medium',
    currentQuestion: 0,
    answers: [],
    questions: [],
    problem: null,
    timerInterval: null,
    timeLeft: 0,
    totalTime: 0,
    testStarted: false,
    language: 'python',
    category: 'subjects',
    subtopic: 'Data Structures',
    groqKey: localStorage.getItem('groq_key') || import.meta.env.VITE_GROQ_API_KEY || '',
    groqModel: localStorage.getItem('groq_model') || import.meta.env.VITE_GROQ_MODEL || 'llama-3.3-70b-versatile',
    codingResults: [], // Track pass/fail for each problem
    codingHints: [], // Store AI hints
    selectedTestCaseIndex: 0,
    savedQuestions: [], // Cache for admin view
    lastStatsFetch: 0, // Performance: Cache stats
    lastQuestionsFetch: 0, // Performance: Cache question table
    lastGenerated: [],
    lastGeneratedType: 'mcq',
};
