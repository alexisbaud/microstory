const express = require('express');
const router = express.Router();
const textController = require('../controllers/text');
const { authenticateToken } = require('../middleware/auth');

// Routes protégées
router.post('/hashtags-suggestions', authenticateToken, textController.suggestHashtagsHandler);
router.post('/tts-suggestions', authenticateToken, textController.suggestTTSInstructionsHandler);

module.exports = router; 