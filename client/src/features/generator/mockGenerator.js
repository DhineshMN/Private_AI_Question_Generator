// =============================================
// MOCK GENERATOR — generateMockQuestions()
// Fallback question generator when AI is not available.
// Extracted from main.js L2259-2318
// =============================================

/**
 * Generates mock/fallback questions without any AI call.
 */
export function generateMockQuestions(topic, type, difficulty, count, category, subtopic, smeName) {
    const questions = [];

    const pythonPool = {
        mcq: [
            { q: "What is the output of `type(None)` in Python?", opts: ["<class 'NoneType'>", "<class 'None'>", "<class 'null'>", "<class 'void'>"], correct: 0, exp: "None in Python is an object of NoneType." },
            { q: "How do you create a variable that is available throughout the program?", opts: ["Declare it outside all functions", "Use the 'global' keyword inside a function", "Pass it as an argument", "Use a protected name"], correct: 0, exp: "A variable declared outside all functions is globally scoped." },
            { q: "Which method is used to add an element at the end of a list?", opts: ["append()", "add()", "insert()", "push()"], correct: 0, exp: "The append() method adds an item to the end of a Python list." },
            { q: "What keyword defines the start of a function in Python?", opts: ["def", "func", "function", "define"], correct: 0, exp: "The 'def' keyword is used to define functions in Python." }
        ],
        coding: [
            { title: "Longest Substring Search", desc: "Write a Python function to find the length of the longest substring without repeating characters.", starter: "def longest_substring(s):\n    # Write your code here\n    pass", input: "abcabcbb", output: "3" },
            { title: "LRU Cache Mechanism", desc: "Implement a basic version of a Least Recently Used (LRU) Cache in Python using an OrderedDict.", starter: "from collections import OrderedDict\n\nclass LRUCache:\n    def __init__(self, capacity):\n        pass", input: "capacity=2, put(1,1), put(2,2), get(1)", output: "1" },
            { title: "Word Frequency Counter", desc: "Write a script that takes a string and returns a dictionary with the frequency of each word.", starter: "def word_frequency(s):\n    pass", input: "'Hello world hello'", output: "{'hello': 2, 'world': 1}" }
        ]
    };

    const isPython = topic.toLowerCase().includes('python');

    for (let i = 0; i < count; i++) {
        const id = Date.now() + i + Math.floor(Math.random() * 1000);

        if (type === 'mcq') {
            let qData = (isPython && pythonPool.mcq[i % pythonPool.mcq.length]) || {
                q: `Which concept of ${topic} is primary in ${difficulty} operations?`,
                opts: ["A", "B", "C", "D"], correct: 0, exp: "Explanation here."
            };
            questions.push({ id, category, subtopic, smeName, question: qData.q, options: qData.opts, correct: qData.correct, explanation: qData.exp, difficulty });
        } else {
            let qData = (isPython && pythonPool.coding[i % pythonPool.coding.length]) || {
                title: `${topic} Module ${i + 1}`,
                desc: `Implement ${topic} core logic for ${difficulty} level.`,
                starter: `def solve(): \n    pass`,
                input: "test_input",
                output: "test_output"
            };
            questions.push({ id, category, subtopic, smeName, title: qData.title, difficulty: difficulty.charAt(0).toUpperCase() + difficulty.slice(1), description: qData.desc, starterCode: qData.starter, input: qData.input, output: qData.output, timeLimit: "30", constraints: ["Time: O(n)", "Memory < 128MB"] });
        }
    }
    return questions;
}
