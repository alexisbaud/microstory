const db = require('../config/database');

// Création de la table reactions si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS reactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    emoji TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(postId, userId, emoji)
  )
`);

// Préparation des requêtes
const createReactionStmt = db.prepare(`
  INSERT OR IGNORE INTO reactions (postId, userId, emoji, createdAt)
  VALUES (?, ?, ?, ?)
`);

const getReactionsByPostIdStmt = db.prepare(`
  SELECT reactions.*, users.pseudo as authorPseudo
  FROM reactions
  JOIN users ON reactions.userId = users.id
  WHERE reactions.postId = ?
`);

const getReactionCountByPostIdStmt = db.prepare(`
  SELECT emoji, COUNT(*) as count
  FROM reactions
  WHERE postId = ?
  GROUP BY emoji
`);

const deleteReactionStmt = db.prepare(`
  DELETE FROM reactions WHERE id = ? AND userId = ?
`);

const deleteUserReactionStmt = db.prepare(`
  DELETE FROM reactions WHERE postId = ? AND userId = ? AND emoji = ?
`);

/**
 * Crée une nouvelle réaction
 * @param {object} reactionData - Données de la réaction
 * @returns {object} Réaction créée avec son id ou null si elle existe déjà
 */
function createReaction(reactionData) {
  const { postId, userId, emoji } = reactionData;
  const now = new Date().toISOString();

  try {
    const info = createReactionStmt.run(postId, userId, emoji, now);

    if (info.changes === 0) {
      // La réaction existe déjà (contrainte UNIQUE)
      return null;
    }

    return {
      id: info.lastInsertRowid,
      postId,
      userId,
      emoji,
      createdAt: now
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Récupère les réactions d'un post
 * @param {number} postId - Id du post
 * @returns {Array} Liste de réactions
 */
function getReactionsByPostId(postId) {
  return getReactionsByPostIdStmt.all(postId);
}

/**
 * Récupère le nombre de réactions par emoji pour un post
 * @param {number} postId - Id du post
 * @returns {Array} Liste de compteurs par emoji
 */
function getReactionCountByPostId(postId) {
  return getReactionCountByPostIdStmt.all(postId);
}

/**
 * Supprime une réaction
 * @param {number} id - Id de la réaction
 * @param {number} userId - Id de l'utilisateur
 * @returns {boolean} true si la réaction a été supprimée
 */
function deleteReaction(id, userId) {
  const info = deleteReactionStmt.run(id, userId);
  return info.changes > 0;
}

/**
 * Supprime une réaction spécifique d'un utilisateur
 * @param {number} postId - Id du post
 * @param {number} userId - Id de l'utilisateur
 * @param {string} emoji - Emoji à supprimer
 * @returns {boolean} true si la réaction a été supprimée
 */
function deleteUserReaction(postId, userId, emoji) {
  const info = deleteUserReactionStmt.run(postId, userId, emoji);
  return info.changes > 0;
}

module.exports = {
  createReaction,
  getReactionsByPostId,
  getReactionCountByPostId,
  deleteReaction,
  deleteUserReaction
}; 