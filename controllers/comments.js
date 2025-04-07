const Comment = require('../models/Comment');

/**
 * Récupère les commentaires d'un post
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getComments(req, res) {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ error: 'Le paramètre postId est requis' });
    }

    const comments = Comment.getCommentsByPostId(postId);
    res.json(comments);
  } catch (error) {
    console.error('Erreur lors de la récupération des commentaires:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des commentaires' });
  }
}

/**
 * Crée un nouveau commentaire
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function createComment(req, res) {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id;

    if (!postId || !content) {
      return res.status(400).json({ error: 'Les champs postId et content sont requis' });
    }

    if (content.length > 250) {
      return res.status(400).json({ error: 'Le commentaire ne peut pas dépasser 250 caractères' });
    }

    const commentData = {
      postId,
      userId,
      content
    };

    const newComment = Comment.createComment(commentData);
    res.status(201).json(newComment);
  } catch (error) {
    console.error('Erreur lors de la création du commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la création du commentaire' });
  }
}

/**
 * Supprime un commentaire
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function deleteComment(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = Comment.deleteComment(id, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Commentaire non trouvé ou non autorisé' });
    }

    res.json({ message: 'Commentaire supprimé avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression du commentaire:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du commentaire' });
  }
}

module.exports = {
  getComments,
  createComment,
  deleteComment
}; 