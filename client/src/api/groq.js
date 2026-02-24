import { state } from '../state/appState.js';

export async function generateAIQuestions(topic, type, difficulty, count, category, subtopic, smeName) {
    const isMcq = type === 'mcq';
    const difficultyContext = {
        easy: 'Objective: Foundational logic. Difficulty: Iterative (O(N) or O(1)). Scope: Basic syntax, loops, and conditional logic.',
        medium: 'Objective: Professional efficiency. Difficulty: O(N log N) or O(N). Scope: Advanced collections, trees, sorting.',
        hard: 'Objective: Competitive standard. Difficulty: O(log N) or O(N). Scope: DP (Dynamic Programming), Graph algorithms.'
    }[difficulty] || 'General technical knowledge';

    const isFramework = ['react', 'angular', 'vue', 'next', 'django', 'flask', 'spring', 'express', 'laravel', 'rails'].some(f => topic.toLowerCase().includes(f));

    const prompt = isMcq ?
        `You are a senior technical SME generating exam-quality MCQ questions.
Topic: "${topic}"
Subject Area: ${subtopic} (${category})
Difficulty: ${difficulty.toUpperCase()} — focus on ${difficultyContext}

Generate ${count} MCQ questions. REQUIREMENTS:
- Technically perfect, zero ambiguity
- Detailed "Smart Explanations"
- Return ONLY a JSON object: { "questions": [{ "question", "options", "correct", "explanation" }] }` :

        isFramework ?
            `You are a senior software architect. Topic: "${topic}". Difficulty: ${difficulty.toUpperCase()}.
Generate a professional coding challenge. 
MANDATORY: 
1. projectStructure: Provide an ASCII Tree View (e.g., ├── src ...).
2. starterCode: Object mapping filenames to full code content.
3. Every file in the tree MUST be in starterCode.
Return JSON: { "questions": [{ "title", "description", "projectStructure", "starterCode", "input", "output", "timeLimit", "constraints", "hints" }] }` :

            `You are a competitive programming coach. Topic: "${topic}". Complexity: ${difficultyContext}.
Generate ${count} coding problems. 
Return JSON: { "questions": [{ "title", "description", "starterCode", "input", "output", "testCases", "timeLimit", "constraints", "hints" }] }`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${state.groqKey}` },
        body: JSON.stringify({
            model: state.groqModel,
            messages: [
                { role: 'system', content: 'You are an expert technical SME. You output ONLY valid JSON.' },
                { role: 'user', content: prompt }
            ],
            temperature: 0.7,
            response_format: { type: 'json_object' }
        })
    });

    if (!response.ok) throw new Error('Groq API Error');
    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    return (parsed.questions || []).map((q, i) => ({
        ...q,
        id: Date.now() + i,
        category,
        subtopic,
        smeName,
        difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1)
    }));
}
