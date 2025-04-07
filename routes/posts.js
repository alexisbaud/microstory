const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');
const { authenticateToken } = require('../middleware/auth');

// Routes publiques
router.get('/', postsController.getPosts);
router.get('/:id', postsController.getPost);

// Routes protégées
router.post('/', authenticateToken, postsController.createPost);
router.post('/draft', authenticateToken, postsController.saveDraft);
router.get('/draft', authenticateToken, postsController.getDraft);
router.delete('/:id', authenticateToken, postsController.deletePost);

module.exports = router; 