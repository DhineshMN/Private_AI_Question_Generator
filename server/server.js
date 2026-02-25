const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.join(__dirname, '.env') });

// Import models
const Question = require('./database/models/Question');
const SME = require('./database/models/SME');
const User = require('./database/models/User');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// MongoDB Connection
mongoose.connection.on('error', err => console.error('❌ Mongoose Connection Error Event:', err));
mongoose.connection.on('disconnected', () => console.log('⚠️ Mongoose disconnected!'));

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(async () => {
        console.log('✅ Connected to MongoDB (Compass)');
        // Seed Master Admin
        try {
            const existing = await User.findOne({ email: 'admin@admin.com' });
            if (!existing) {
                await new User({ email: 'admin@admin.com', password: 'admin123', role: 'admin' }).save();
                console.log('🔑 Master Admin seeded: admin@admin.com / admin123');
            }
        } catch (e) { console.error('Seed error:', e.message); }
    })
    .catch((err) => console.error('❌ MongoDB Connection Error:', err));

// =============================================
// AUTH ROUTES
// =============================================

// Signup
app.post('/api/auth/signup', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters' });
        }
        const existing = await User.findOne({ email: email.toLowerCase().trim() });
        if (existing) {
            return res.status(409).json({ error: 'An account with this email already exists' });
        }
        const user = new User({ email, password, role: 'user' });
        await user.save();
        console.log(`✅ New user registered: ${email}`);
        res.status(201).json({ success: true, user: { email: user.email, role: user.role } });
    } catch (err) {
        console.error('❌ Signup Error:', err.message);
        res.status(500).json({ error: 'Registration failed. Please try again.' });
    }
});

// Login
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }
        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        const isMatch = user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ error: 'Invalid email or password' });
        }
        console.log(`✅ User logged in: ${email} (${user.role})`);
        res.json({ success: true, user: { email: user.email, role: user.role } });
    } catch (err) {
        console.error('❌ Login Error:', err.message);
        res.status(500).json({ error: 'Login failed. Please try again.' });
    }
});

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
        // Efficient Single-Pass Aggregation for all stats
        const stats = await Question.aggregate([
            {
                $facet: {
                    "counts": [
                        { $group: { _id: "$type", count: { $sum: 1 } } }
                    ],
                    "difficulty": [
                        { $group: { _id: "$difficulty", count: { $sum: 1 } } }
                    ],
                    "topTopics": [
                        { $group: { _id: "$subtopic", count: { $sum: 1 } } },
                        { $sort: { count: -1 } },
                        { $limit: 5 }
                    ],
                    "smeStats": [
                        { $group: { _id: "$smeName", count: { $sum: 1 } } },
                        { $sort: { count: -1 } }
                    ]
                }
            }
        ]);

        const result = stats[0];

        // Parse counts
        const mcqCount = result.counts.find(c => c._id === 'mcq')?.count || 0;
        const codingCount = result.counts.find(c => c._id === 'coding')?.count || 0;

        // Parse difficulty
        const diffMap = {};
        result.difficulty.forEach(d => { diffMap[d._id] = d.count; });

        // Separate fetch for recent activity (needs full documents)
        const recentQuestions = await Question.find()
            .sort({ _id: -1 })
            .limit(5)
            .select('subtopic type difficulty createdAt');

        // Total SME Count - Efficiently extracted
        const smeCount = result.smeStats.length;

        res.json({
            mcqCount,
            codingCount,
            totalCount: mcqCount + codingCount,
            difficulty: {
                easy: diffMap.easy || 0,
                medium: diffMap.medium || 0,
                hard: diffMap.hard || 0
            },
            topTopics: result.topTopics,
            recentActivity: recentQuestions,
            smeStats: result.smeStats,
            smeCount
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

// Rename a Session
app.put('/api/questions/session/:sessionId', async (req, res) => {
    try {
        const { sessionName } = req.body;
        if (!sessionName) {
            return res.status(400).json({ error: 'Session Name is required' });
        }
        const result = await Question.updateMany(
            { sessionId: req.params.sessionId },
            { $set: { sessionName } }
        );
        res.json({ message: `Session renamed`, modifiedCount: result.modifiedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a Session
app.delete('/api/questions/session/:sessionId', async (req, res) => {
    try {
        const result = await Question.deleteMany({ sessionId: req.params.sessionId });
        res.json({ message: `Session deleted`, deletedCount: result.deletedCount });
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
        envContent = updateEnv(envContent, 'VITE_GROQ_API_KEY', apiKey);
        if (model) envContent = updateEnv(envContent, 'VITE_GROQ_MODEL', model);

        fs.writeFileSync(clientEnvPath, envContent.trim() + '\n');

        console.log(`✅ API: Updated client/.env with new Groq Key at ${clientEnvPath}`);
        res.json({ message: 'Settings saved to client configuration successfully' });
    } catch (error) {
        console.error('❌ Failed to save .env:', error);
        res.status(500).json({ error: 'Failed to save settings to server storage' });
    }
});

// =============================================
// SME PROFILE ROUTES
// =============================================

// Get all SMEs
app.get('/api/smes', async (req, res) => {
    try {
        const smes = await SME.find().sort({ createdAt: -1 });
        res.json(smes);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Add a new SME
app.post('/api/smes', async (req, res) => {
    try {
        const { name, apiKey, model } = req.body;

        if (!name || !apiKey) {
            return res.status(400).json({ error: 'Name and API Key are required' });
        }

        const newSme = new SME({
            name,
            apiKey,
            model: model || 'llama-3.3-70b-versatile'
        });

        await newSme.save();
        res.status(201).json({ message: 'SME Profile added successfully', sme: newSme });
    } catch (err) {
        console.error('❌ Error adding SME:', err.message);
        res.status(500).json({ error: err.message });
    }
});

// Delete an SME
app.delete('/api/smes/:id', async (req, res) => {
    try {
        const deleted = await SME.findByIdAndDelete(req.params.id);
        if (!deleted) {
            return res.status(404).json({ error: 'SME not found' });
        }
        res.json({ message: 'SME Profile deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update an SME
app.put('/api/smes/:id', async (req, res) => {
    try {
        const updates = {};
        if (req.body.model) updates.model = req.body.model;
        if (req.body.apiKey) updates.apiKey = req.body.apiKey;
        if (req.body.name) updates.name = req.body.name;

        const updatedSme = await SME.findByIdAndUpdate(
            req.params.id,
            { $set: updates },
            { new: true }
        );
        if (!updatedSme) {
            return res.status(404).json({ error: 'SME not found' });
        }
        res.json({ message: 'SME Profile updated successfully', sme: updatedSme });
    } catch (err) {
        res.status(500).json({ error: err.message });
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
