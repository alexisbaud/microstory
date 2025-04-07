const Interaction = require('../models/Interaction');

/**
 * Récupère les interactions d'un post
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getInteractions(req, res) {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ error: 'Le paramètre postId est requis' });
    }

    const interactions = Interaction.getInteractionsByPostId(postId);
    res.json(interactions);
  } catch (error) {
    console.error('Erreur lors de la récupération des interactions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des interactions' });
  }
}

/**
 * Récupère le nombre d'interactions par type pour un post
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getInteractionCounts(req, res) {
  try {
    const { postId } = req.query;

    if (!postId) {
      return res.status(400).json({ error: 'Le paramètre postId est requis' });
    }

    const interactionCounts = Interaction.getInteractionCountByPostId(postId);
    res.json(interactionCounts);
  } catch (error) {
    console.error('Erreur lors de la récupération des compteurs d\'interactions:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des compteurs d\'interactions' });
  }
}

/**
 * Crée une nouvelle interaction
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function createInteraction(req, res) {
  try {
    const { postId, type } = req.body;
    const userId = req.user.id;

    if (!postId || !type) {
      return res.status(400).json({ error: 'Les champs postId et type sont requis' });
    }

    // Seul le type 'share' est supporté pour l'instant
    if (type !== 'share') {
      return res.status(400).json({ error: 'Type d\'interaction non supporté' });
    }

    const interactionData = {
      postId,
      userId,
      type
    };

    const newInteraction = Interaction.createInteraction(interactionData);
    res.status(201).json(newInteraction);
  } catch (error) {
    console.error('Erreur lors de la création de l\'interaction:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'interaction' });
  }
}

module.exports = {
  getInteractions,
  getInteractionCounts,
  createInteraction
}; 