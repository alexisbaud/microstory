const express = require('express');
const router = express.Router();
const commentsController = require('../controllers/comments');
const { authenticateToken } = require('../middleware/auth');

// Routes publiques
router.get('/', commentsController.getComments);

// Routes protégées
router.post('/', authenticateToken, commentsController.createComment);
router.delete('/:id', authenticateToken, commentsController.deleteComment);

module.exports = router; 