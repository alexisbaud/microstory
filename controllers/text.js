const { suggestHashtags, suggestTTSInstructions } = require('../utils/textAnalysis');

/**
 * Suggère des hashtags basés sur le contenu d'un texte
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function suggestHashtagsHandler(req, res) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Le texte est requis' });
    }

    const hashtags = await suggestHashtags(text);
    res.json({ suggestedHashtags: hashtags });
  } catch (error) {
    console.error('Erreur lors de la suggestion de hashtags:', error);
    res.status(500).json({ error: 'Erreur lors de la suggestion de hashtags' });
  }
}

/**
 * Suggère des instructions TTS basées sur le contenu d'un texte
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function suggestTTSInstructionsHandler(req, res) {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Le texte est requis' });
    }

    const instructions = await suggestTTSInstructions(text);
    res.json({ ttsInstructions: instructions });
  } catch (error) {
    console.error('Erreur lors de la suggestion d\'instructions TTS:', error);
    res.status(500).json({ error: 'Erreur lors de la suggestion d\'instructions TTS' });
  }
}

module.exports = {
  suggestHashtagsHandler,
  suggestTTSInstructionsHandler
}; 