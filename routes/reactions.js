const express = require('express');
const router = express.Router();
const reactionsController = require('../controllers/reactions');
const { authenticateToken } = require('../middleware/auth');

// Routes publiques
router.get('/', reactionsController.getReactions);
router.get('/counts', reactionsController.getReactionCounts);

// Routes protégées
router.post('/', authenticateToken, reactionsController.createReaction);
router.delete('/:id', authenticateToken, reactionsController.deleteReaction);
router.delete('/', authenticateToken, reactionsController.deleteUserReaction);

module.exports = router; 