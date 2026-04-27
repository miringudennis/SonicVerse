const db = require('../models/db');

exports.getSongs = async (req, res) => {
  try {
    const { mood, genre } = req.query;
    let query = `
      SELECT s.*, p.username as artist_name 
      FROM songs s 
      JOIN artists a ON s.artist_id = a.id 
      JOIN profiles p ON a.profile_id = p.id
    `;
    const params = [];

    if (mood) {
      query += ` WHERE $1 = ANY(s.mood_tags)`;
      params.push(mood);
    }

    const result = await db.query(query, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getDiscoveryGraph = async (req, res) => {
  try {
    const mood = req.query.mood;
    
    // In a real app, this would be a more complex recursive or graph-based query.
    // For our MVP, we'll fetch songs (and their associated artist/genres) 
    // to build a 2-tier graph.
    let songQuery = `
      SELECT s.id, s.title, s.mood_tags, p.username as artist_name, a.id as artist_id, a.genre_tags
      FROM songs s 
      JOIN artists a ON s.artist_id = a.id 
      JOIN profiles p ON a.profile_id = p.id
    `;
    const params = [];
    if (mood) {
      songQuery += ` WHERE $1 = ANY(s.mood_tags)`;
      params.push(mood);
    }
    songQuery += ` LIMIT 15`;

    const result = await db.query(songQuery, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getArtistsWithLocation = async (req, res) => {
  try {
    // Fetch artists and their profile locations
    const query = `
      SELECT a.id, p.username, p.display_name, p.avatar_url, p.location, a.genre_tags
      FROM artists a
      JOIN profiles p ON a.profile_id = p.id
      WHERE p.location IS NOT NULL
    `;
    const result = await db.query(query);
    
    // We'll mock some coordinates for the locations since the schema doesn't store lat/lng yet.
    // In a production app, we'd geocode these or store coords.
    const mockCoords = {
      'Nairobi': [-1.2921, 36.8219],
      'Mombasa': [-4.0435, 39.6682],
      'Kisumu': [-0.0917, 34.7680],
      'Nakuru': [-0.3031, 36.0800],
      'Eldoret': [0.5143, 35.2698],
      'London': [51.5074, -0.1278],
      'Berlin': [52.5200, 13.4050],
      'New York': [40.7128, -74.0060],
      'Lagos': [6.5244, 3.3792]
    };

    const artists = result.rows.map(row => ({
      ...row,
      coordinates: mockCoords[row.location] || [-1.2921, 36.8219] // Default to Nairobi
    }));

    res.json(artists);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNeuralInsights = async (req, res) => {
  try {
    const { genres } = req.query;
    let query = `
      SELECT s.*, p.username as artist_name 
      FROM songs s 
      JOIN artists a ON s.artist_id = a.id 
      JOIN profiles p ON a.profile_id = p.id
    `;
    const params = [];

    if (genres) {
      const genreList = genres.split(',');
      query += ` WHERE EXISTS (
        SELECT 1 FROM unnest(a.genre_tags) g 
        WHERE g = ANY($1::text[])
      )`;
      params.push(genreList);
    }

    query += ` ORDER BY RANDOM() LIMIT 10`;

    const result = await db.query(query, params);
    
    const recommendations = result.rows.map(row => ({
      ...row,
      source: 'SonicVerse',
      isExternal: false
    }));

    res.json(recommendations);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getSongById = async (req, res) => {
  try {
    const result = await db.query(
      `SELECT s.*, p.username as artist_name 
       FROM songs s 
       JOIN artists a ON s.artist_id = a.id 
       JOIN profiles p ON a.profile_id = p.id
       WHERE s.id = $1`,
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: 'Song not found' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.createSong = async (req, res) => {
  const { title, audio_url, cover_url, mood_tags, lyrics, artist_id } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO songs (title, audio_url, cover_url, mood_tags, lyrics, artist_id) 
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [title, audio_url, cover_url, mood_tags, JSON.stringify(lyrics), artist_id]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
