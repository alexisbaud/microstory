const User = require('../models/User');
const Post = require('../models/Post');

/**
 * Récupère les informations de l'utilisateur courant
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getCurrentUser(req, res) {
  try {
    const userId = req.user.id;
    const user = User.getUserById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Ne pas renvoyer le mot de passe
    const { passwordHash, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la récupération de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération de l\'utilisateur' });
  }
}

/**
 * Met à jour les informations de l'utilisateur courant
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function updateCurrentUser(req, res) {
  try {
    const userId = req.user.id;
    const { pseudo, email } = req.body;

    // Pour le PoC, on permet uniquement de modifier le pseudo
    if (!pseudo) {
      return res.status(400).json({ error: 'Le pseudo est requis' });
    }

    // Mise à jour de l'utilisateur
    const updated = User.updateUser(userId, { pseudo });

    if (!updated) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    // Récupérer l'utilisateur mis à jour
    const user = User.getUserById(userId);
    const { passwordHash, ...userWithoutPassword } = user;

    res.json(userWithoutPassword);
  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
}

/**
 * Récupère les posts de l'utilisateur courant
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function getUserPosts(req, res) {
  try {
    const userId = req.user.id;
    const posts = Post.getUserPosts(userId);
    res.json(posts);
  } catch (error) {
    console.error('Erreur lors de la récupération des posts utilisateur:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des posts utilisateur' });
  }
}

module.exports = {
  getCurrentUser,
  updateCurrentUser,
  getUserPosts
}; 