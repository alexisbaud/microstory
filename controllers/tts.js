const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const Post = require('../models/Post');
const { processTTSInstructions } = require('../utils/textAnalysis');
const openaiConfig = require('../config/openai');
const elevenlabsConfig = require('../config/elevenlabs');

// Création du dossier audio s'il n'existe pas
const audioDir = path.join(__dirname, '../audio');
if (!fs.existsSync(audioDir)) {
  fs.mkdirSync(audioDir, { recursive: true });
}

/**
 * Génère un fichier audio à partir d'un texte et d'instructions
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function generateAudio(req, res) {
  try {
    const { text, instructions, postId } = req.body;

    if (!text) {
      return res.status(400).json({ error: 'Le texte est requis' });
    }

    // Générer un ID unique pour le fichier audio
    const audioId = crypto.createHash('md5').update(`${text}${instructions || ''}`).digest('hex');
    const audioPath = path.join(audioDir, `${audioId}.mp3`);
    const audioUrl = `/api/audio/${audioId}`;

    // Vérifier si le fichier existe déjà
    if (fs.existsSync(audioPath)) {
      // Si postId est fourni, mettre à jour l'URL dans la base de données
      if (postId) {
        Post.updateTTSAudio(postId, audioUrl);
      }
      
      return res.json({
        audioUrl,
        success: true
      });
    }

    // Traiter les instructions via OpenAI
    const { enrichedText, params } = await processTTSInstructions(text, instructions || '');

    // À ce stade, une implémentation réelle appellerait l'API d'ElevenLabs
    // Pour ce PoC, on simule simplement la génération
    
    // Simuler un délai de génération
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Créer un fichier audio de test (un fichier vide pour le PoC)
    fs.writeFileSync(audioPath, '');

    // Si postId est fourni, mettre à jour l'URL dans la base de données
    if (postId) {
      Post.updateTTSAudio(postId, audioUrl);
    }

    res.json({
      audioUrl,
      success: true
    });
  } catch (error) {
    console.error('Erreur lors de la génération audio:', error);
    res.status(500).json({ 
      error: 'Erreur lors de la génération audio',
      success: false
    });
  }
}

/**
 * Diffuse un fichier audio
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function streamAudio(req, res) {
  try {
    const { audioId } = req.params;
    const audioPath = path.join(audioDir, `${audioId}.mp3`);

    // Vérifier si le fichier existe
    if (!fs.existsSync(audioPath)) {
      return res.status(404).json({ error: 'Fichier audio non trouvé' });
    }

    // Définir les headers pour le streaming
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Disposition', `attachment; filename="${audioId}.mp3"`);

    // Créer un stream de lecture et le pipe vers la réponse
    const fileStream = fs.createReadStream(audioPath);
    fileStream.pipe(res);
  } catch (error) {
    console.error('Erreur lors du streaming audio:', error);
    res.status(500).json({ error: 'Erreur lors du streaming audio' });
  }
}

module.exports = {
  generateAudio,
  streamAudio
}; 