const express = require('express');
const router = express.Router();
const searchController = require('../controllers/search');

// Routes publiques
router.get('/', searchController.searchPosts);

module.exports = router; 