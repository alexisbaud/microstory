const db = require('../config/database');

/**
 * Recherche des posts par texte ou hashtag
 * @param {object} req - Requête Express
 * @param {object} res - Réponse Express
 */
async function searchPosts(req, res) {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ error: 'Le paramètre query est requis' });
    }

    // Recherche dans le contenu, le titre et les hashtags
    const searchStmt = db.prepare(`
      SELECT * FROM posts 
      WHERE 
        (content LIKE ? OR title LIKE ? OR hashtags LIKE ?) 
        AND visibility = 'public' 
        AND isDraft = 0 
      ORDER BY createdAt DESC
      LIMIT 50
    `);

    const searchParam = `%${query}%`;
    const posts = searchStmt.all(searchParam, searchParam, searchParam);

    // Formater les résultats
    const formattedPosts = posts.map(post => ({
      ...post,
      hashtags: post.hashtags ? JSON.parse(post.hashtags) : [],
      ttsGenerated: post.ttsGenerated === 1,
      isDraft: post.isDraft === 1
    }));

    res.json(formattedPosts);
  } catch (error) {
    console.error('Erreur lors de la recherche:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche' });
  }
}

module.exports = {
  searchPosts
}; 