const db = require('../config/database');

// Création de la table posts si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS posts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    authorId INTEGER NOT NULL,
    type TEXT NOT NULL,
    title TEXT,
    content TEXT NOT NULL,
    hashtags TEXT,
    ttsInstructions TEXT,
    ttsAudioUrl TEXT,
    ttsGenerated INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    visibility TEXT NOT NULL,
    isDraft INTEGER DEFAULT 0,
    FOREIGN KEY (authorId) REFERENCES users(id)
  )
`);

// Préparation des requêtes
const createPostStmt = db.prepare(`
  INSERT INTO posts (authorId, type, title, content, hashtags, ttsInstructions, ttsAudioUrl, ttsGenerated, createdAt, updatedAt, visibility, isDraft)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getPostByIdStmt = db.prepare(`
  SELECT * FROM posts WHERE id = ?
`);

const getPostsStmt = db.prepare(`
  SELECT * FROM posts WHERE visibility = 'public' AND isDraft = 0 ORDER BY createdAt DESC LIMIT ? OFFSET ?
`);

const getUserPostsStmt = db.prepare(`
  SELECT * FROM posts WHERE authorId = ? ORDER BY createdAt DESC
`);

const getDraftStmt = db.prepare(`
  SELECT * FROM posts WHERE authorId = ? AND isDraft = 1 ORDER BY createdAt DESC LIMIT 1
`);

const deletePostStmt = db.prepare(`
  DELETE FROM posts WHERE id = ? AND authorId = ?
`);

const updatePostStmt = db.prepare(`
  UPDATE posts SET title = ?, content = ?, hashtags = ?, ttsInstructions = ?, updatedAt = ?, visibility = ? WHERE id = ? AND authorId = ?
`);

const updateTTSStmt = db.prepare(`
  UPDATE posts SET ttsAudioUrl = ?, ttsGenerated = 1 WHERE id = ?
`);

/**
 * Crée un nouveau post
 * @param {object} postData - Données du post
 * @returns {object} Post créé avec son id
 */
function createPost(postData) {
  const {
    authorId,
    type,
    title,
    content,
    hashtags,
    ttsInstructions,
    ttsAudioUrl,
    visibility,
    isDraft
  } = postData;

  const now = new Date().toISOString();
  const hashtagsStr = Array.isArray(hashtags) ? JSON.stringify(hashtags) : hashtags;

  try {
    const info = createPostStmt.run(
      authorId,
      type,
      title || null,
      content,
      hashtagsStr || null,
      ttsInstructions || null,
      ttsAudioUrl || null,
      ttsAudioUrl ? 1 : 0,
      now,
      now,
      visibility || 'public',
      isDraft ? 1 : 0
    );

    if (info.changes === 0) {
      throw new Error('Échec de la création du post');
    }

    return {
      id: info.lastInsertRowid,
      authorId,
      type,
      title,
      content,
      hashtags: hashtagsStr ? JSON.parse(hashtagsStr) : [],
      ttsInstructions,
      ttsAudioUrl,
      ttsGenerated: ttsAudioUrl ? 1 : 0,
      createdAt: now,
      updatedAt: now,
      visibility: visibility || 'public',
      isDraft: isDraft ? 1 : 0
    };
  } catch (error) {
    throw error;
  }
}

/**
 * Récupère un post par son id
 * @param {number} id - Id du post
 * @returns {object|null} Post ou null si non trouvé
 */
function getPostById(id) {
  const post = getPostByIdStmt.get(id);
  if (!post) return null;

  return {
    ...post,
    hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
    ttsGenerated: post.ttsGenerated === 1,
    isDraft: post.isDraft === 1
  };
}

/**
 * Récupère une liste de posts publics (non brouillons)
 * @param {number} limit - Nombre de posts à récupérer
 * @param {number} offset - Offset pour la pagination
 * @returns {Array} Liste de posts
 */
function getPosts(limit = 10, offset = 0) {
  const posts = getPostsStmt.all(limit, offset);
  return posts.map(post => ({
    ...post,
    hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
    ttsGenerated: post.ttsGenerated === 1,
    isDraft: post.isDraft === 1
  }));
}

/**
 * Récupère les posts d'un utilisateur
 * @param {number} userId - Id de l'utilisateur
 * @returns {Array} Liste de posts
 */
function getUserPosts(userId) {
  const posts = getUserPostsStmt.all(userId);
  return posts.map(post => ({
    ...post,
    hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
    ttsGenerated: post.ttsGenerated === 1,
    isDraft: post.isDraft === 1
  }));
}

/**
 * Récupère le dernier brouillon d'un utilisateur
 * @param {number} userId - Id de l'utilisateur
 * @returns {object|null} Brouillon ou null si non trouvé
 */
function getDraft(userId) {
  const draft = getDraftStmt.get(userId);
  if (!draft) return null;

  return {
    ...draft,
    hashtags: draft.hashtags ? JSON.parse(draft.hashtags) : [],
    ttsGenerated: draft.ttsGenerated === 1,
    isDraft: draft.isDraft === 1
  };
}

/**
 * Supprime un post
 * @param {number} id - Id du post
 * @param {number} authorId - Id de l'auteur
 * @returns {boolean} true si le post a été supprimé
 */
function deletePost(id, authorId) {
  const info = deletePostStmt.run(id, authorId);
  return info.changes > 0;
}

/**
 * Met à jour un post
 * @param {number} id - Id du post
 * @param {number} authorId - Id de l'auteur
 * @param {object} postData - Données à mettre à jour
 * @returns {boolean} true si le post a été mis à jour
 */
function updatePost(id, authorId, postData) {
  const {
    title,
    content,
    hashtags,
    ttsInstructions,
    visibility
  } = postData;

  const now = new Date().toISOString();
  const hashtagsStr = Array.isArray(hashtags) ? JSON.stringify(hashtags) : hashtags;

  const info = updatePostStmt.run(
    title || null,
    content,
    hashtagsStr || null,
    ttsInstructions || null,
    now,
    visibility || 'public',
    id,
    authorId
  );

  return info.changes > 0;
}

/**
 * Met à jour l'URL audio d'un post
 * @param {number} id - Id du post
 * @param {string} ttsAudioUrl - URL de l'audio
 * @returns {boolean} true si le post a été mis à jour
 */
function updateTTSAudio(id, ttsAudioUrl) {
  const info = updateTTSStmt.run(ttsAudioUrl, id);
  return info.changes > 0;
}

module.exports = {
  createPost,
  getPostById,
  getPosts,
  getUserPosts,
  getDraft,
  deletePost,
  updatePost,
  updateTTSAudio
}; 