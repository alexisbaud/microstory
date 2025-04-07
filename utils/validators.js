/**
 * Utilitaires pour la validation des données
 */

/**
 * Valide un email
 * @param {string} email - L'email à valider
 * @returns {boolean} - true si l'email est valide
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Valide un mot de passe
 * @param {string} password - Le mot de passe à valider
 * @returns {boolean} - true si le mot de passe est valide
 */
function validatePassword(password) {
  // Au moins 8 caractères
  return password && password.length >= 8;
}

/**
 * Valide un pseudo
 * @param {string} pseudo - Le pseudo à valider
 * @returns {boolean} - true si le pseudo est valide
 */
function validatePseudo(pseudo) {
  // Entre 3 et 30 caractères
  return pseudo && pseudo.length >= 3 && pseudo.length <= 30;
}

/**
 * Valide les données d'inscription
 * @param {object} data - Les données d'inscription
 * @returns {object} - Résultat de la validation {isValid, errors}
 */
function validateRegistration(data) {
  const errors = {};
  
  if (!data.email) {
    errors.email = "L'email est requis";
  } else if (!validateEmail(data.email)) {
    errors.email = "L'email n'est pas valide";
  }
  
  if (!data.password) {
    errors.password = "Le mot de passe est requis";
  } else if (!validatePassword(data.password)) {
    errors.password = "Le mot de passe doit contenir au moins 8 caractères";
  }
  
  if (!data.pseudo) {
    errors.pseudo = "Le pseudo est requis";
  } else if (!validatePseudo(data.pseudo)) {
    errors.pseudo = "Le pseudo doit contenir entre 3 et 30 caractères";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valide les données de connexion
 * @param {object} data - Les données de connexion
 * @returns {object} - Résultat de la validation {isValid, errors}
 */
function validateLogin(data) {
  const errors = {};
  
  if (!data.email) {
    errors.email = "L'email est requis";
  }
  
  if (!data.password) {
    errors.password = "Le mot de passe est requis";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

/**
 * Valide les données d'un post
 * @param {object} data - Les données du post
 * @returns {object} - Résultat de la validation {isValid, errors}
 */
function validatePost(data) {
  const errors = {};
  
  if (!data.content) {
    errors.content = "Le contenu est requis";
  }
  
  if (data.type === "Post B" && !data.title) {
    errors.title = "Le titre est requis pour un Post B";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

module.exports = {
  validateEmail,
  validatePassword,
  validatePseudo,
  validateRegistration,
  validateLogin,
  validatePost
}; 