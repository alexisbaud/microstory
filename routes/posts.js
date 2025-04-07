const express = require('express');
const router = express.Router();
const postsController = require('../controllers/posts');
const { authenticateToken } = require('../middleware/auth');

// Public routes
router.get('/', postsController.getFeed);

// Protected routes
router.post('/', authenticateToken, postsController.createPost);
router.get('/user/posts', authenticateToken, postsController.getUserPosts);

// Route avec paramètre - toujours à la fin pour éviter de capturer d'autres routes
router.get('/:id', postsController.getPost);

module.exports = router; 