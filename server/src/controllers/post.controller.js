const db = require('../models/db');

exports.getPosts = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT p.*, pr.username, pr.avatar_url, s.title as song_title, s.cover_url as song_cover
       FROM posts p
       JOIN profiles pr ON p.user_id = pr.user_id
       LEFT JOIN songs s ON p.song_id = s.id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createPost = async (req, res) => {
  const { content, song_id, media_url } = req.body;
  const user_id = req.user.id;
  try {
    const result = await db.query(
      'INSERT INTO posts (user_id, content, song_id, media_url) VALUES ($1, $2, $3, $4) RETURNING *',
      [user_id, content, song_id, media_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
