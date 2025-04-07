// Chargement des variables d'environnement
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./config/database');
const authRoutes = require('./routes/auth');
const postsRoutes = require('./routes/posts');
const commentsRoutes = require('./routes/comments');
const reactionsRoutes = require('./routes/reactions');
const interactionsRoutes = require('./routes/interactions');
const ttsRoutes = require('./routes/tts');
const usersRoutes = require('./routes/users');
const textRoutes = require('./routes/text');
const searchRoutes = require('./routes/search');
const ttsController = require('./controllers/tts');

const app = express();
const port = process.env.PORT || 3001;

// Vérification de la connexion à la base de données
try {
  // Exécuter une requête simple pour tester la connexion
  db.prepare('SELECT 1').get();
  console.log('✅ Connexion à la base de données SQLite établie avec succès');
} catch (error) {
  console.error('❌ Erreur de connexion à la base de données:', error.message);
  process.exit(1);
}

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Routes
app.get('/api/ping', (req, res) => {
  res.json({ pong: true });
});

// Routes API
app.use('/api/auth', authRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/comments', commentsRoutes);
app.use('/api/reactions', reactionsRoutes);
app.use('/api/interactions', interactionsRoutes);
app.use('/api/tts', ttsRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/text', textRoutes);
app.use('/api/search', searchRoutes);

// Route pour servir les fichiers audio
app.get('/api/audio/:audioId', ttsController.streamAudio);

// Servir les fichiers statiques de la PWA en production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../build')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../build', 'index.html'));
  });
}

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Une erreur est survenue' });
});

// Démarrage du serveur
app.listen(port, '0.0.0.0', () => {
  console.log(`Serveur prêt sur 0.0.0.0:${port}`);
});
