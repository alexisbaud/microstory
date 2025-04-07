const db = require('../config/database');

// Création de la table users si elle n'existe pas
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL,
    pseudo TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
  )
`);

// Préparation des requêtes
const createUserStmt = db.prepare(`
  INSERT INTO users (email, passwordHash, pseudo, createdAt, updatedAt)
  VALUES (?, ?, ?, ?, ?)
`);

const getUserByEmailStmt = db.prepare(`
  SELECT * FROM users WHERE email = ?
`);

const getUserByIdStmt = db.prepare(`
  SELECT * FROM users WHERE id = ?
`);

const updateUserStmt = db.prepare(`
  UPDATE users SET pseudo = ?, updatedAt = ? WHERE id = ?
`);

/**
 * Crée un nouvel utilisateur
 * @param {string} email - Email de l'utilisateur
 * @param {string} passwordHash - Hash du mot de passe
 * @param {string} pseudo - Pseudo de l'utilisateur
 * @returns {object} Utilisateur créé avec son id
 */
function createUser(email, passwordHash, pseudo) {
  const now = new Date().toISOString();
  
  try {
    const info = createUserStmt.run(email.toLowerCase(), passwordHash, pseudo, now, now);
    
    if (info.changes === 0) {
      throw new Error('Échec de la création de l\'utilisateur');
    }
    
    return {
      id: info.lastInsertRowid,
      email: email.toLowerCase(),
      pseudo,
      createdAt: now,
      updatedAt: now
    };
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed: users.email')) {
      throw new Error('Cet email est déjà utilisé');
    }
    throw error;
  }
}

/**
 * Récupère un utilisateur par son email
 * @param {string} email - Email de l'utilisateur
 * @returns {object|null} Utilisateur ou null si non trouvé
 */
function getUserByEmail(email) {
  return getUserByEmailStmt.get(email.toLowerCase()) || null;
}

/**
 * Récupère un utilisateur par son id
 * @param {number} id - Id de l'utilisateur
 * @returns {object|null} Utilisateur ou null si non trouvé
 */
function getUserById(id) {
  return getUserByIdStmt.get(id) || null;
}

/**
 * Met à jour un utilisateur
 * @param {number} id - Id de l'utilisateur
 * @param {object} userData - Données à mettre à jour
 * @returns {boolean} true si l'utilisateur a été mis à jour
 */
function updateUser(id, userData) {
  const { pseudo } = userData;
  const now = new Date().toISOString();
  
  try {
    const info = updateUserStmt.run(pseudo, now, id);
    return info.changes > 0;
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createUser,
  getUserByEmail,
  getUserById,
  updateUser
};
