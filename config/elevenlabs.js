/**
 * Configuration pour l'API ElevenLabs
 */

// Vérification de la présence de la clé API
if (!process.env.ELEVENLABS_API_KEY) {
  console.warn('⚠️ La variable d\'environnement ELEVENLABS_API_KEY n\'est pas définie.');
}

// Configuration
const config = {
  apiKey: process.env.ELEVENLABS_API_KEY || '',
  apiUrl: 'https://api.elevenlabs.io/v1'
};

module.exports = config; 