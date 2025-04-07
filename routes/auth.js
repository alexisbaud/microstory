const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

// Route d'inscription
router.post('/register', authController.register);

// Route de connexion
router.post('/login', authController.login);

module.exports = router;
