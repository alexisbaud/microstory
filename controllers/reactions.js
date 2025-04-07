const Reaction = require('../models/Reaction');

/**
 * Récupère les réactions d'un post
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getReactions(req, res) {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ error: 'Le paramètre postId est requis' });
    }

    const reactions = Reaction.getReactionsByPostId(postId);
    res.json(reactions);
  } catch (error) {
    console.error('Erreur lors de la récupération des réactions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des réactions' });
  }
}

/**
 * Récupère le nombre de réactions par emoji pour un post
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getReactionCounts(req, res) {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ error: 'Le paramètre postId est requis' });
    }

    const reactionCounts = Reaction.getReactionCountByPostId(postId);
    res.json(reactionCounts);
  } catch (error) {
    console.error('Erreur lors de la récupération des compteurs de réactions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des compteurs de réactions' });
  }
}

/**
 * Crée une nouvelle réaction
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function createReaction(req, res) {
  try {
    const { postId, emoji } = req.body;
    const userId = req.user.id;

    if (!postId || !emoji) {
      return res.status(400).json({ error: 'Les champs postId et emoji sont requis' });
    }

    // Liste des emojis autorisés
    const allowedEmojis = ['❤️', '👍', '😂', '😮', '😢'];
    if (!allowedEmojis.includes(emoji)) {
      return res.status(400).json({ error: 'Emoji non autorisé' });
    }

    const reactionData = {
      postId,
      userId,
      emoji
    };

    const newReaction = Reaction.createReaction(reactionData);
    
    if (!newReaction) {
      return res.status(409).json({ error: 'Vous avez déjà réagi avec cet emoji' });
    }
    
    res.status(201).json(newReaction);
  } catch (error) {
    console.error('Erreur lors de la création de la réaction:', error);
    res.status(500).json({ error: 'Erreur lors de la création de la réaction' });
  }
}

/**
 * Supprime une réaction
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function deleteReaction(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const deleted = Reaction.deleteReaction(id, userId);

    if (!deleted) {
      return res.status(404).json({ error: 'Réaction non trouvée ou non autorisée' });
    }

    res.json({ message: 'Réaction supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réaction:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la réaction' });
  }
}

/**
 * Supprime une réaction spécifique
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function deleteUserReaction(req, res) {
  try {
    const { postId, emoji } = req.query;
    const userId = req.user.id;

    if (!postId || !emoji) {
      return res.status(400).json({ error: 'Les paramètres postId et emoji sont requis' });
    }

    const deleted = Reaction.deleteUserReaction(postId, userId, emoji);

    if (!deleted) {
      return res.status(404).json({ error: 'Réaction non trouvée' });
    }

    res.json({ message: 'Réaction supprimée avec succès' });
  } catch (error) {
    console.error('Erreur lors de la suppression de la réaction:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de la réaction' });
  }
}

module.exports = {
  getReactions,
  getReactionCounts,
  createReaction,
  deleteReaction,
  deleteUserReaction
}; 