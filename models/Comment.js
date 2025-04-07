const db = require('../config/database');

// Création de la table comments si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS comments (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    postId INTEGER NOT NULL,
    userId INTEGER NOT NULL,
    content TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (postId) REFERENCES posts(id) ON DELETE CASCADE,
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE
  )
`);

// Préparation des requêtes
const createCommentStmt = db.prepare(`
  INSERT INTO comments (postId, userId, content, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?)
`);

const getCommentsByPostIdStmt = db.prepare(`
  SELECT comments.*, users.pseudo as authorPseudo
  FROM comments
  JOIN users ON comments.userId = users.id
  WHERE comments.postId = ?
  ORDER BY comments.createdAt ASC
`);

const deleteCommentStmt = db.prepare(`
  DELETE FROM comments WHERE id = ? AND userId = ?
`);

/**
 * Crée un nouveau commentaire
 * @param {object} commentData - Données du commentaire
 * @returns {object} Commentaire créé avec son id
 */
function createComment(commentData) {
  const { postId, userId, content } = commentData;
  const now = new Date().toISOString();

  try {
    const info = createCommentStmt.run(postId, userId, content, now, now);

    if (info.changes === 0) {
      throw new Error('Échec de la création du commentaire');
    }

    return {
      id: info.lastInsertRowid,
      postId,
      userId,
      content,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Récupère les commentaires d'un post
 * @param {number} postId - Id du post
 * @returns {Array} Liste de commentaires
 */
function getCommentsByPostId(postId) {
  return getCommentsByPostIdStmt.all(postId);
}

/**
 * Supprime un commentaire
 * @param {number} id - Id du commentaire
 * @param {number} userId - Id de l'utilisateur
 * @returns {boolean} true si le commentaire a été supprimé
 */
function deleteComment(id, userId) {
  const info = deleteCommentStmt.run(id, userId);
  return info.changes > 0;
}

module.exports = {
  createComment,
  getCommentsByPostId,
  deleteComment
}; 