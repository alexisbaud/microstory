const db = require('../config/database');

// Création de la table interactions si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS interactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    type TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Préparation des requêtes
const createInteractionStmt = db.prepare(`
  INSERT INTO interactions (postId, userId, type, createdAt)
  VALUES (?, ?, ?, ?)
`);

const getInteractionsByPostIdStmt = db.prepare(`
  SELECT interactions.*, users.pseudo as authorPseudo
  FROM interactions
  JOIN users ON interactions.userId = users.id
  WHERE interactions.postId = ?
`);

const getInteractionCountByPostIdStmt = db.prepare(`
  SELECT type, COUNT(*) as count
  FROM interactions
  WHERE postId = ?
  GROUP BY type
`);

/**
 * Crée une nouvelle interaction
 * @param {object} interactionData - Données de l'interaction
 * @returns {object} Interaction créée avec son id
 */
function createInteraction(interactionData) {
  const { postId, userId, type } = interactionData;
  const now = new Date().toISOString();

  try {
    const info = createInteractionStmt.run(postId, userId, type, now);

    if (info.changes === 0) {
      throw new Error('Échec de la création de l\'interaction');
    }

    return {
      id: info.lastInsertRowid,
      postId,
      userId,
      type,
      createdAt: now
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Récupère les interactions d'un post
 * @param {number} postId - Id du post
 * @returns {Array} Liste d'interactions
 */
function getInteractionsByPostId(postId) {
  return getInteractionsByPostIdStmt.all(postId);
}

/**
 * Récupère le nombre d'interactions par type pour un post
 * @param {number} postId - Id du post
 * @returns {Array} Liste de compteurs par type
 */
function getInteractionCountByPostId(postId) {
  return getInteractionCountByPostIdStmt.all(postId);
}

module.exports = {
  createInteraction,
  getInteractionsByPostId,
  getInteractionCountByPostId
}; 