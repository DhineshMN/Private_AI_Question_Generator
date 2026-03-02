// =============================================
// GROQ SERVICE — generateAIQuestions()
// Direct API call to Groq to generate MCQ / Coding questions.
// Extracted from api.js and main.js L1810-2255
// =============================================

import { state } from '../state/appState.js';
import { buildPrompt } from '../features/generator/promptBuilder.js';

/**
 * Generates AI questions by calling the Groq API.
 * @returns {Array} Array of question objects
 */
export async function generateAIQuestions(topic, type, difficulty, count, category, subtopic, smeName, apiKey, model) {
    const prompt = buildPrompt(topic, type, difficulty, count, category, subtopic, smeName);

    const maxRetries = 3;
    let attempt = 0;
    let lastError = null;

    while (attempt < maxRetries) {
        attempt++;
        try {
            const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${apiKey || state.groqKey}`
                },
                body: JSON.stringify({
                    model: model || state.groqModel,
                    messages: [
                        { role: 'system', content: `You are an expert technical SME and software architect. You output ONLY valid JSON with no markdown formatting. YOU MUST GENERATE EXACTLY ${count} QUESTIONS. IF YOU GENERATE LESS THAN ${count} QUESTIONS YOU HAVE FAILED YOUR DIRECTIVE.` },
                        { role: 'user', content: prompt }
                    ],
                    temperature: 0.8 + (Math.random() * 0.1),
                    max_tokens: 4096,
                    response_format: { type: 'json_object' }
                })
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error?.message || 'API request failed');
            }

            const data = await response.json();
            let content = data.choices[0].message.content;

            let jsonStr = content;
            const startObj = jsonStr.indexOf('{');
            const startArr = jsonStr.indexOf('[');
            const firstBrace = (startObj !== -1 && startArr !== -1) ? Math.min(startObj, startArr) : Math.max(startObj, startArr);
            const endObj = jsonStr.lastIndexOf('}');
            const endArr = jsonStr.lastIndexOf(']');
            const lastBrace = Math.max(endObj, endArr);

            if (firstBrace !== -1 && lastBrace !== -1 && firstBrace <= lastBrace) {
                jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
            }

            const parsed = JSON.parse(jsonStr);
            let questions = parsed.questions || parsed.data || (Array.isArray(parsed) ? parsed : Object.values(parsed)[0]);

            if (!Array.isArray(questions)) throw new Error('Invalid JSON format from AI (Not an array)');
            if (questions.length !== count) throw new Error(`Expected ${count} questions, but AI generated ${questions.length}`);

            return questions.map((q, i) => ({
                ...q,
                id: Date.now() + i,
                category,
                subtopic,
                smeName,
                difficulty: difficulty.toLowerCase()
            }));

        } catch (e) {
            console.warn(`[API] AI Generation Attempt ${attempt} failed:`, e.message);
            lastError = e;
        }
    }

    throw new Error(`Failed to generate exactly ${count} valid questions after ${maxRetries} attempts. Last error: ${lastError.message}`);
}
