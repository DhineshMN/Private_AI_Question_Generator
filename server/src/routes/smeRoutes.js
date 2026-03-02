const express = require('express');
const router = express.Router();
const { getAllSMEs, addSME, deleteSME, updateSME } = require('../controllers/smeController');

router.get('/', getAllSMEs);
router.post('/', addSME);
router.delete('/:id', deleteSME);
router.put('/:id', updateSME);

module.exports = router;
