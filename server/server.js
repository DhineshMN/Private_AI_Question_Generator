const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Define Question schema inline so it uses THIS mongoose instance (the connected one).
// This avoids the dual-mongoose-instance bug where the external model's mongoose
// is different from the connected one, causing insertMany() to buffer forever.
const QuestionSchema = new mongoose.Schema({
    id: { type: Number, required: true },
    category: { type: String, required: true },
    subtopic: { type: String, required: true },
    difficulty: { type: String, required: true },
    type: { type: String, enum: ['mcq', 'coding'], required: true },
    smeName: { type: String },
    // MCQ fields
    question: { type: String },
    options: [{ type: String }],
    correct: { type: Number },
    explanation: { type: String },
    // Coding fields
    title: { type: String },
    description: { type: String },
    starterCode: { type: mongoose.Schema.Types.Mixed },
    input: { type: String },
    output: { type: String },
    timeLimit: { type: String },
    constraints: [{ type: String }],
    createdAt: { type: Date, default: Date.now }
});
const Question = mongoose.model('Question', QuestionSchema);

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ Connected to MongoDB (Compass)'))
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// Routes
app.get('/api/questions', async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/questions/bulk', async (req, res) => {
    try {
        const { questions, type } = req.body;
        if (!Array.isArray(questions)) {
            return res.status(400).json({ error: 'Questions must be an array' });
        }

        const formattedQuestions = questions.map(q => ({
            ...q,
            type: type || (q.question ? 'mcq' : 'coding')
        }));

        console.log(`📥 API: Attempting to save ${formattedQuestions.length} ${type} questions...`);

        const savedQuestions = await Question.insertMany(formattedQuestions, { ordered: false });
        console.log(`✅ API: Successfully saved ${savedQuestions.length} questions.`);
        res.status(201).json({ message: `Successfully saved ${savedQuestions.length} questions`, data: savedQuestions });
    } catch (err) {
        console.error('❌ API Error (Bulk Save):', err.message);
        if (err.name === 'ValidationError') {
            console.error('Validation Details:', Object.keys(err.errors).map(key => `${key}: ${err.errors[key].message}`).join(', '));
        }
        res.status(500).json({ error: err.message });
    }
});

// Drop Database (Utility for testing)
app.delete('/api/questions/clear', async (req, res) => {
    try {
        await Question.deleteMany({});
        res.json({ message: 'Database cleared successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/questions/:id', async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
