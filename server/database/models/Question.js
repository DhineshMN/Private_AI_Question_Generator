const mongoose = require('mongoose');

const QuestionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    category: { type: String, required: true },
    subtopic: { type: String, required: true },
    difficulty: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'coding'], required: true },
    smeName: { type: String },
    watermark: { type: String },

    // MCQ specific fields
    question: { type: String },
    options: [{ type: String }],
    correct: { type: Number },
    explanation: { type: String },

    // Coding specific fields
    title: { type: String },
    description: { type: String },
    starterCode: { type: mongoose.Schema.Types.Mixed }, // Can be string or object
    input: { type: String },
    output: { type: String },
    timeLimit: { type: String },
    constraints: [{ type: String }],
    hints: [{ type: String }],
    examples: [{
        input: String,
        output: String,
        explanation: String
    }],
    testCases: [{
        input: String,
        output: String,
        hidden: { type: Boolean, default: false }
    }],

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Question', QuestionSchema);
