const db = require('../models/db');

exports.searchUsers = async (req, res) => {
  const { query } = req.query;
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT p.user_id, p.username, p.display_name, p.avatar_url,
       EXISTS(SELECT 1 FROM follows WHERE follower_id = $1 AND following_id = p.user_id) as is_following
       FROM profiles p
       WHERE p.username ILIKE $2 AND p.user_id != $1
       LIMIT 20`,
      [userId, `%${query}%`]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.followUser = async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;

  try {
    await db.query(
      'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
      [followerId, followingId]
    );

    // Create notification
    const followerProfile = await db.query('SELECT username FROM profiles WHERE user_id = $1', [followerId]);
    await db.query(
      'INSERT INTO notifications (user_id, type, data) VALUES ($1, $2, $3)',
      [followingId, 'follow', JSON.stringify({ follower_id: followerId, username: followerProfile.rows[0].username })]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.unfollowUser = async (req, res) => {
  const followerId = req.user.id;
  const { followingId } = req.body;

  try {
    await db.query(
      'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2',
      [followerId, followingId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getFollowing = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT p.user_id, p.username, p.display_name, p.avatar_url
       FROM profiles p
       JOIN follows f ON p.user_id = f.following_id
       WHERE f.follower_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getNotifications = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50',
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markNotificationsRead = async (req, res) => {
  const userId = req.user.id;

  try {
    await db.query('UPDATE notifications SET is_read = true WHERE user_id = $1', [userId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
