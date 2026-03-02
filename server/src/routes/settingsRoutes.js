const express = require('express');
const router = express.Router();
const { saveKey } = require('../controllers/settingsController');

router.post('/save-key', saveKey);

module.exports = router;
