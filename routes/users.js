const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const { authenticateToken } = require('../middleware/auth');

// Routes protégées
router.get('/me', authenticateToken, usersController.getCurrentUser);
router.put('/me', authenticateToken, usersController.updateCurrentUser);
router.get('/me/posts', authenticateToken, usersController.getUserPosts);

module.exports = router; 