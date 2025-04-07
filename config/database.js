const Database = require('better-sqlite3');
const path = require('path');

// Création de la connexion à la base de données
const db = new Database(path.join(__dirname, '../database.sqlite'), {
  verbose: console.log // Pour voir les requêtes SQL dans la console
});

// Création des tables si elles n'existent pas
db.exec(`
  PRAGMA foreign_keys = ON;
`);

module.exports = db;
