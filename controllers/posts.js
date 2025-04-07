const Post = require('../models/Post');
const { validatePost } = require('../utils/validators');

/**
 * Récupère tous les posts publics
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getPosts(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const posts = Post.getPosts(limit, offset);
    res.json(posts);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des posts' });
  }
}

/**
 * Récupère un post spécifique
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getPost(req, res) {
  try {
    const { id } = req.params;
    const post = Post.getPostById(id);

    if (!post) {
      return res.status(404).json({ error: 'Post non trouvé' });
    }

    res.json(post);
  } catch (error) {
    console.error('Erreur lors de la récupération du post:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du post' });
  }
}

/**
 * Crée un nouveau post
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function createPost(req, res) {
  try {
    const { content, visibility, title, hashtags, type, ttsInstructions } = req.body;
    const authorId = req.user.id;
    
    // Validate required fields
    if (!content || !type) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: 'Content and type are required' 
      });
    }
    
    // Create post object
    const postData = {
      authorId,
      content,
      type,
      title,
      hashtags,
      ttsInstructions,
      visibility: visibility || 'public',
      ttsGenerated: false,
      isDraft: false
    };
    
    // Create post in database
    const newPost = Post.createPost(postData);
    
    // Return created post
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Failed to create post' });
  }
}

/**
 * Sauvegarde un brouillon
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function saveDraft(req, res) {
  try {
    const userId = req.user.id;
    const draftData = {
      ...req.body,
      authorId: userId,
      isDraft: true
    };

    // Création du brouillon
    const draft = Post.createPost(draftData);
    res.status(201).json(draft);
  } catch (error) {
    console.error('Erreur lors de la sauvegarde du brouillon:', error);
    res.status(500).json({ error: 'Erreur lors de la sauvegarde du brouillon' });
  }
}

/**
 * Récupère le dernier brouillon d'un utilisateur
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getDraft(req, res) {
  try {
    const userId = req.user.id;
    const draft = Post.getDraft(userId);

    if (!draft) {
      return res.status(404).json({ error: 'Aucun brouillon trouvé' });
    }

    res.json(draft);
  } catch (error) {
    console.error('Erreur lors de la récupération du brouillon:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du brouillon' });
  }
}

/**
 * Supprime un post
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function deletePost(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = Post.deletePost(id, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Post non trouvé ou non autorisé' });
    }

    res.json({ message: 'Post supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du post:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du post' });
  }
}

/**
 * Récupère les posts d'un utilisateur
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getUserPosts(req, res) {
  try {
    const userId = req.user.id;
    const posts = Post.getPostsByUser(userId);
    res.json(posts);
  } catch (error) {
    console.error('Error fetching user posts:', error);
    res.status(500).json({ error: 'Failed to fetch user posts' });
  }
}

/**
 * Get feed - paginated public posts
 * @param {object} req - Express request
 * @param {object} res - Express response
 */
async function getFeed(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    
    // Get posts using the getAllPosts method
    const posts = Post.getAllPosts({ page, limit });
    
    res.json({
      posts,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit // Simple way to check if there might be more posts
      }
    });
  } catch (error) {
    console.error('Error fetching feed:', error);
    res.status(500).json({ error: 'Failed to fetch feed' });
  }
}

module.exports = {
  getPosts,
  getPost,
  createPost,
  saveDraft,
  getDraft,
  deletePost,
  getUserPosts,
  getFeed
}; 