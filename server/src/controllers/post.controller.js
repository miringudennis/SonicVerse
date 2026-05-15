const db = require('../models/db');

exports.getPosts = async (req, res) => {
  const { userId } = req.query;
  try {
    let query = `
      SELECT p.*, pr.username, pr.display_name, pr.avatar_url, s.title as song_title, s.cover_url as song_cover
      FROM posts p
      JOIN profiles pr ON p.user_id = pr.user_id
      LEFT JOIN songs s ON p.song_id = s.id
    `;
    let params = [];
    
    if (userId) {
      query += ` WHERE p.user_id = $1`;
      params.push(userId);
    }
    
    query += ` ORDER BY p.created_at DESC`;
    
    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { content, song_id, media_url, media_type } = req.body;
  const user_id = req.user.id;
  try {
    const result = await db.query(
      'INSERT INTO posts (user_id, content, song_id, media_url, media_type) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [user_id, content, song_id, media_url, media_type || 'text']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
