/**
 * Configuration pour l'API OpenAI
 */

// Vérification de la présence de la clé API
if (!process.env.OPENAI_API_KEY) {
  console.warn('⚠️ La variable d\'environnement OPENAI_API_KEY n\'est pas définie.');
}

// Configuration
const config = {
  apiKey: process.env.OPENAI_API_KEY || '',
  model: 'gpt-4o' // Modèle LLM 4o
};

module.exports = config; 