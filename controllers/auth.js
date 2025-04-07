const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Nombre de rounds pour le hash bcrypt
const SALT_ROUNDS = 10;

// Vérification de la variable d'environnement JWT_SECRET
if (!process.env.JWT_SECRET) {
  console.warn('⚠️ La variable d\'environnement JWT_SECRET n\'est pas définie. Utilisation d\'une clé par défaut non sécurisée.');
}

const JWT_SECRET = process.env.JWT_SECRET || 'default_insecure_jwt_secret';

/**
 * Génère un token JWT pour un utilisateur
 * @param {object} user - L'utilisateur pour lequel générer le token
 * @returns {string} Token JWT
 */
function generateToken(user) {
  return jwt.sign(
    { 
      id: user.id,
      email: user.email 
    }, 
    JWT_SECRET, 
    { expiresIn: '24h' }
  );
}

/**
 * Supprime les informations sensibles d'un utilisateur
 * @param {object} user - L'utilisateur à nettoyer
 * @returns {object} Utilisateur sans les données sensibles
 */
function sanitizeUser(user) {
  const { passwordHash, ...sanitizedUser } = user;
  return sanitizedUser;
}

/**
 * Inscription d'un nouvel utilisateur
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function register(req, res) {
  try {
    const { email, password, pseudo } = req.body;

    // Validation des données
    if (!email || !password || !pseudo) {
      return res.status(400).json({ error: 'Email, mot de passe et pseudo sont requis' });
    }

    // Vérifier si l'email existe déjà
    const existingUser = User.getUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'Cet email est déjà utilisé' });
    }

    // Hasher le mot de passe
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    // Créer l'utilisateur
    const newUser = User.createUser(email, passwordHash, pseudo);

    // Générer le token
    const token = generateToken(newUser);

    // Retourner l'utilisateur sans le mot de passe et le token
    res.status(201).json({
      user: sanitizeUser(newUser),
      token
    });
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
}

/**
 * Connexion d'un utilisateur
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function login(req, res) {
  try {
    const { email, password } = req.body;

    // Validation des données
    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe sont requis' });
    }

    // Récupérer l'utilisateur
    const user = User.getUserByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    // Générer le token
    const token = generateToken(user);

    // Retourner l'utilisateur sans le mot de passe et le token
    res.json({
      user: sanitizeUser(user),
      token
    });
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
}

module.exports = {
  register,
  login
};
