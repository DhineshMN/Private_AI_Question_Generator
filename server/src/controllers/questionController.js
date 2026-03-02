const Question = require('../../database/models/Question');

// GET /api/questions
const getQuestions = async (req, res) => {
    try {
        const questions = await Question.find();
        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// POST /api/questions/bulk
const bulkSave = async (req, res) => {
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
};

// DELETE /api/questions/clear
const clearDB = async (req, res) => {
    try {
        await Question.deleteMany({});
        res.json({ message: 'Database cleared successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/questions/session/:sessionId  (Rename Session)
const renameSession = async (req, res) => {
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
};

// DELETE /api/questions/session/:sessionId
const deleteSession = async (req, res) => {
    try {
        const result = await Question.deleteMany({ sessionId: req.params.sessionId });
        res.json({ message: `Session deleted`, deletedCount: result.deletedCount });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// PUT /api/questions/:id
const updateQuestion = async (req, res) => {
    try {
        const updated = await Question.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ message: 'Question updated successfully', data: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// DELETE /api/questions/:id
const deleteQuestion = async (req, res) => {
    try {
        await Question.findByIdAndDelete(req.params.id);
        res.json({ message: 'Question deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

module.exports = { getQuestions, bulkSave, clearDB, renameSession, deleteSession, updateQuestion, deleteQuestion };
