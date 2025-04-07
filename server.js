const express = require('express');
const cors = require('cors');
const db = require('./config/database');

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
app.use(cors());
app.use(express.json());

// Routes
app.get('/api/ping', (req, res) => {
  res.json({ pong: true });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Serveur démarré sur le port ${port}`);
});
