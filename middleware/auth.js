const jwt = require('jsonwebtoken');

/**
 * Middleware pour authentifier les utilisateurs via un token JWT
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 * @param {function} next - Fonction pour passer au middleware suivant
 */
function authenticateToken(req, res, next) {
  // Récupération du header Authorization
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"
  
  // Si pas de token, renvoyer une erreur 401
  if (!token) {
    return res.status(401).json({ error: 'Authentification requise' });
  }

  // Vérification de la variable d'environnement JWT_SECRET
  if (!process.env.JWT_SECRET) {
    console.error("JWT_SECRET n'est pas défini");
    return res.status(500).json({ error: 'Erreur de configuration du serveur' });
  }

  // Vérification du token
  jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
    if (err) {
      // Token invalide ou expiré
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Session expirée, veuillez vous reconnecter' });
      }
      return res.status(401).json({ error: 'Token invalide' });
    }
    
    // Ajout des informations de l'utilisateur à l'objet req
    req.user = payload;
    next();
  });
}

module.exports = {
  authenticateToken
};
