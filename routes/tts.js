const express = require('express');
const router = express.Router();
const ttsController = require('../controllers/tts');
const { authenticateToken } = require('../middleware/auth');

// Routes protégées
router.post('/generate', authenticateToken, ttsController.generateAudio);

module.exports = router; 