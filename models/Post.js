const db = require('../config/database');

// Create posts table if it doesn't exist
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
    visibility TEXT NOT NULL,
    isDraft INTEGER DEFAULT 0,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    FOREIGN KEY (authorId) REFERENCES users(id)
  )
`);

// Prepare statements
const createPostStmt = db.prepare(`
  INSERT INTO posts (
    authorId, type, title, content, hashtags, ttsInstructions, 
    ttsAudioUrl, ttsGenerated, visibility, isDraft, createdAt, updatedAt
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const getPostByIdStmt = db.prepare(`
  SELECT * FROM posts WHERE id = ?
`);

const getAllPostsStmt = db.prepare(`
  SELECT * FROM posts 
  WHERE visibility = 'public' AND isDraft = 0
  ORDER BY createdAt DESC
  LIMIT ? OFFSET ?
`);

const getPostsByUserStmt = db.prepare(`
  SELECT * FROM posts WHERE authorId = ? ORDER BY createdAt DESC
`);

const getDraftStmt = db.prepare(`
  SELECT * FROM posts 
  WHERE authorId = ? AND isDraft = 1
  ORDER BY updatedAt DESC
  LIMIT 1
`);

/**
 * Creates a new post
 * @param {Object} postData - Post data
 * @returns {Object} Created post
 */
function createPost(postData) {
  const now = new Date().toISOString();
  
  const {
    authorId,
    type,
    title = null,
    content,
    hashtags = null,
    ttsInstructions = null,
    ttsAudioUrl = null,
    ttsGenerated = 0,
    visibility = 'public',
    isDraft = 0
  } = postData;
  
  // Format hashtags if provided as an array
  let hashtagsStr = hashtags;
  if (Array.isArray(hashtags)) {
    hashtagsStr = hashtags.join(',');
  }
  
  try {
    const info = createPostStmt.run(
      authorId,
      type,
      title,
      content,
      hashtagsStr,
      ttsInstructions,
      ttsAudioUrl,
      ttsGenerated ? 1 : 0,
      visibility,
      isDraft ? 1 : 0,
      now,
      now
    );
    
    return {
      id: info.lastInsertRowid,
      authorId,
      type,
      title,
      content,
      hashtags: hashtagsStr ? hashtagsStr.split(',') : [],
      ttsInstructions,
      ttsAudioUrl,
      ttsGenerated: !!ttsGenerated,
      visibility,
      isDraft: !!isDraft,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    console.error('Error creating post:', error);
    throw error;
  }
}

/**
 * Gets a post by ID
 * @param {number} id - Post ID
 * @returns {Object|null} Post or null if not found
 */
function getPostById(id) {
  try {
    const post = getPostByIdStmt.get(id);
    
    if (!post) return null;
    
    // Convert boolean fields and parse hashtags
    return {
      ...post,
      hashtags: post.hashtags ? post.hashtags.split(',') : [],
      ttsGenerated: !!post.ttsGenerated,
      isDraft: !!post.isDraft
    };
  } catch (error) {
    console.error(`Error getting post with id ${id}:`, error);
    throw error;
  }
}

/**
 * Gets the latest draft for a user
 * @param {number} userId - User ID
 * @returns {Object|null} Draft post or null if not found
 */
function getDraft(userId) {
  try {
    const draft = getDraftStmt.get(userId);
    
    if (!draft) return null;
    
    // Convert boolean fields and parse hashtags
    return {
      ...draft,
      hashtags: draft.hashtags ? draft.hashtags.split(',') : [],
      ttsGenerated: !!draft.ttsGenerated,
      isDraft: !!draft.isDraft
    };
  } catch (error) {
    console.error(`Error getting draft for user ${userId}:`, error);
    throw error;
  }
}

/**
 * Gets all public, non-draft posts with pagination
 * @param {Object} options - Pagination options
 * @param {number} options.page - Page number (starts at 1)
 * @param {number} options.limit - Number of posts per page
 * @returns {Object[]} Array of posts
 */
function getAllPosts({ page = 1, limit = 10 } = {}) {
  try {
    const offset = (page - 1) * limit;
    
    const posts = getAllPostsStmt.all(limit, offset);
    
    // Convert boolean fields and parse hashtags for all posts
    return posts.map(post => ({
      ...post,
      hashtags: post.hashtags ? post.hashtags.split(',') : [],
      ttsGenerated: !!post.ttsGenerated,
      isDraft: !!post.isDraft
    }));
  } catch (error) {
    console.error('Error getting all posts:', error);
    throw error;
  }
}

/**
 * Gets all posts by a specific user
 * @param {number} userId - User ID
 * @returns {Object[]} Array of posts
 */
function getPostsByUser(userId) {
  try {
    const posts = getPostsByUserStmt.all(userId);
    
    // Convert boolean fields and parse hashtags for all posts
    return posts.map(post => ({
      ...post,
      hashtags: post.hashtags ? post.hashtags.split(',') : [],
      ttsGenerated: !!post.ttsGenerated,
      isDraft: !!post.isDraft
    }));
  } catch (error) {
    console.error(`Error getting posts for user ${userId}:`, error);
    throw error;
  }
}

module.exports = {
  createPost,
  getPostById,
  getAllPosts,
  getPostsByUser,
  getDraft
}; 