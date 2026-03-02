const express = require('express');
const router = express.Router();
const {
    getQuestions,
    bulkSave,
    clearDB,
    renameSession,
    deleteSession,
    updateQuestion,
    deleteQuestion
} = require('../controllers/questionController');

router.get('/', getQuestions);
router.post('/bulk', bulkSave);
router.delete('/clear', clearDB);
router.put('/session/:sessionId', renameSession);
router.delete('/session/:sessionId', deleteSession);
router.put('/:id', updateQuestion);
router.delete('/:id', deleteQuestion);

module.exports = router;
