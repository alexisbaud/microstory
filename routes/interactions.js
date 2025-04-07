const express = require('express');
const router = express.Router();
const interactionsController = require('../controllers/interactions');
const { authenticateToken } = require('../middleware/auth');

// Routes publiques
router.get('/', interactionsController.getInteractions);
router.get('/counts', interactionsController.getInteractionCounts);

// Routes protégées
router.post('/', authenticateToken, interactionsController.createInteraction);

module.exports = router; 