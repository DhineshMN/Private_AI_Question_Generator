const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const Question = require('./database/models/Question');
const SME = require('./database/models/SME');

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

app.get('/api/stats', async (req, res) => {
    try {
        const mcqCount = await Question.countDocuments({ type: 'mcq' });
        const codingCount = await Question.countDocuments({ type: 'coding' });

        // Difficulty breakdown
        const easyCount = await Question.countDocuments({ difficulty: 'easy' });
        const mediumCount = await Question.countDocuments({ difficulty: 'medium' });
        const hardCount = await Question.countDocuments({ difficulty: 'hard' });

        // Topic distribution (Top 5)
        const topicStats = await Question.aggregate([
            { $group: { _id: "$subtopic", count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // Recent activity (Last 5 questions)
        const recentQuestions = await Question.find()
            .sort({ _id: -1 })
            .limit(5)
            .select('subtopic type difficulty createdAt');

        // SME Contributions
        const smeStats = await Question.aggregate([
            { $group: { _id: "$smeName", count: { $sum: 1 } } },
            { $sort: { count: -1 } }
        ]);

        res.json({
            mcqCount,
            codingCount,
            difficulty: { easy: easyCount, medium: mediumCount, hard: hardCount },
            topTopics: topicStats,
            recentActivity: recentQuestions,
            smeStats: smeStats
        });
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

// Settings - Save API Key to Server .env
app.post('/api/settings/save-key', async (req, res) => {
    try {
        const { apiKey, model } = req.body;
        if (!apiKey) return res.status(400).json({ error: 'API Key is required' });

        const fs = require('fs');
        // TARGET THE CLIENT FOLDER, NOT SERVER FOLDER
        const clientEnvPath = path.join(__dirname, '../client/.env');

        // Read existing file or create empty
        let envContent = '';
        if (fs.existsSync(clientEnvPath)) {
            envContent = fs.readFileSync(clientEnvPath, 'utf8');
        }

        // Helper to update specific key
        const updateEnv = (content, key, val) => {
            const regex = new RegExp(`^${key}=.*`, 'm');
            if (regex.test(content)) {
                return content.replace(regex, `${key}=${val}`);
            } else {
                return content + `\n${key}=${val}`;
            }
        };

        // Update environment variables
        envContent = updateEnv(envContent, 'VITE_GROQ_API_KEY', apiKey); // Use VITE_ prefix for frontend
        if (model) envContent = updateEnv(envContent, 'VITE_GROQ_MODEL', model);

        fs.writeFileSync(clientEnvPath, envContent.trim() + '\n');

        console.log(`✅ API: Updated client/.env with new Groq Key at ${clientEnvPath}`);
        res.json({ message: 'Settings saved to client configuration successfully' });
    } catch (error) {
        console.error('❌ Failed to save .env:', error);
        res.status(500).json({ error: 'Failed to save settings to server storage' });
    }
});

app.put('/api/questions/:id', async (req, res) => {
    try {
        const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Question updated successfully', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// SME Management Routes
app.get('/api/smes', async (req, res) => {
    try {
        const smes = await SME.find().sort({ createdAt: -1 });
        res.json(smes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/smes', async (req, res) => {
    try {
        const { name, apiKey, model } = req.body;
        if (!name || !apiKey) return res.status(400).json({ error: 'Name and API Key are required' });

        const newSme = new SME({ name, apiKey, model });
        await newSme.save();
        res.status(201).json({ message: 'SME profile saved successfully', data: newSme });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/smes/:id', async (req, res) => {
    try {
        await SME.findByIdAndDelete(req.params.id);
        res.json({ message: 'SME profile deleted' });
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
