const db = require('../models/db');

exports.createGroup = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.id;

  try {
    await db.query('BEGIN');
    
    const groupResult = await db.query(
      'INSERT INTO groups (name, created_by) VALUES ($1, $2) RETURNING *',
      [name, userId]
    );
    const groupId = groupResult.rows[0].id;

    await db.query(
      'INSERT INTO group_members (group_id, user_id, role, status) VALUES ($1, $2, $3, $4)',
      [groupId, userId, 'admin', 'accepted']
    );

    await db.query('COMMIT');
    res.status(201).json(groupResult.rows[0]);
  } catch (err) {
    await db.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  }
};

exports.getGroups = async (req, res) => {
  const userId = req.user.id;

  try {
    const result = await db.query(
      `SELECT g.*, gm.role, gm.status, gm.joined_at, gm.last_read_at,
       (SELECT COUNT(*) FROM group_messages WHERE group_id = g.id AND created_at > gm.last_read_at AND sender_id != $1) as unread_count
       FROM groups g
       JOIN group_members gm ON g.id = gm.group_id
       WHERE gm.user_id = $1`,
      [userId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.markRead = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    await db.query(
      'UPDATE group_members SET last_read_at = CURRENT_TIMESTAMP WHERE group_id = $1 AND user_id = $2',
      [groupId, userId]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.inviteMember = async (req, res) => {
  const { groupId, username } = req.body;
  const adminId = req.user.id;

  try {
    // Check if user is admin
    const adminCheck = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3',
      [groupId, adminId, 'admin']
    );
    if (adminCheck.rows.length === 0) {
      return res.status(403).json({ message: 'Only admins can invite members' });
    }

    // Get user id from username
    const userResult = await db.query('SELECT user_id FROM profiles WHERE username = $1', [username]);
    if (userResult.rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }
    const targetUserId = userResult.rows[0].user_id;

    // Check if already a member
    const memberCheck = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2',
      [groupId, targetUserId]
    );
    if (memberCheck.rows.length > 0) {
      return res.status(400).json({ message: 'User is already a member or invited' });
    }

    await db.query(
      'INSERT INTO group_members (group_id, user_id, status) VALUES ($1, $2, $3)',
      [groupId, targetUserId, 'invited']
    );

    // Create notification
    const groupResult = await db.query('SELECT name FROM groups WHERE id = $1', [groupId]);
    await db.query(
      'INSERT INTO notifications (user_id, type, data) VALUES ($1, $2, $3)',
      [targetUserId, 'group_invite', JSON.stringify({ 
        group_id: groupId, 
        group_name: groupResult.rows[0].name,
        inviter_id: adminId 
      })]
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.respondToInvite = async (req, res) => {
  const { groupId, accept } = req.body;
  const userId = req.user.id;

  try {
    if (accept) {
      const result = await db.query(
        'UPDATE group_members SET status = $1, joined_at = CURRENT_TIMESTAMP WHERE group_id = $2 AND user_id = $3 RETURNING *',
        ['accepted', groupId, userId]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ message: 'Invite not found' });
      }

      // Update notification to show it was accepted
      await db.query(
        "UPDATE notifications SET data = data || '{\"status\": \"accepted\"}'::jsonb WHERE user_id = $1 AND type = 'group_invite' AND (data->>'group_id')::uuid = $2",
        [userId, groupId]
      );

      res.json({ success: true, member: result.rows[0] });
    } else {
      await db.query(
        'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = $3',
        [groupId, userId, 'invited']
      );

      // Update notification to show it was declined
      await db.query(
        "UPDATE notifications SET data = data || '{\"status\": \"declined\"}'::jsonb WHERE user_id = $1 AND type = 'group_invite' AND (data->>'group_id')::uuid = $2",
        [userId, groupId]
      );

      res.json({ success: true, message: 'Invite declined' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { groupId, content, mediaUrl, mediaType, replyToId } = req.body;
  const userId = req.user.id;

  try {
    const memberCheck = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = $3',
      [groupId, userId, 'accepted']
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const result = await db.query(
      'INSERT INTO group_messages (group_id, sender_id, content, media_url, media_type, reply_to_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [groupId, userId, content, mediaUrl, mediaType || 'text', replyToId]
    );

    // Create notifications for other members
    const groupResult = await db.query('SELECT name FROM groups WHERE id = $1', [groupId]);
    const membersResult = await db.query('SELECT user_id FROM group_members WHERE group_id = $1 AND user_id != $2', [groupId, userId]);
    
    const notifications = membersResult.rows.map(member => 
      db.query(
        'INSERT INTO notifications (user_id, type, data) VALUES ($1, $2, $3)',
        [member.user_id, 'group_message', JSON.stringify({ 
          group_id: groupId, 
          group_name: groupResult.rows[0].name,
          message_id: result.rows[0].id
        })]
      )
    );
    await Promise.all(notifications);

    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteMessage = async (req, res) => {
  const { messageId } = req.params;
  const userId = req.user.id;

  try {
    const result = await db.query(
      'DELETE FROM group_messages WHERE id = $1 AND sender_id = $2 RETURNING *',
      [messageId, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Message not found or you are not the sender' });
    }

    res.json({ success: true, message: 'Message deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateGroup = async (req, res) => {
  const { groupId, name, imageUrl, wallpaperUrl } = req.body;
  const userId = req.user.id;

  try {
    const adminCheck = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3',
      [groupId, userId, 'admin']
    );
    if (adminCheck.rows.length === 0) return res.status(403).json({ message: 'Admin access required' });

    const result = await db.query(
      'UPDATE groups SET name = COALESCE($1, name), image_url = COALESCE($2, image_url), wallpaper_url = COALESCE($3, wallpaper_url) WHERE id = $4 RETURNING *',
      [name, imageUrl, wallpaperUrl, groupId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.renameGroup = async (req, res) => {
  const { groupId, name } = req.body;
  const userId = req.user.id;
  try {
    const adminCheck = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3',
      [groupId, userId, 'admin']
    );
    if (adminCheck.rows.length === 0) return res.status(403).json({ message: 'Admin access required' });

    const result = await db.query('UPDATE groups SET name = $1 WHERE id = $2 RETURNING *', [name, groupId]);
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.removeMember = async (req, res) => {
  const { groupId, targetUserId } = req.body;
  const userId = req.user.id;
  try {
    const adminCheck = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND role = $3',
      [groupId, userId, 'admin']
    );
    if (adminCheck.rows.length === 0) return res.status(403).json({ message: 'Admin access required' });

    await db.query('DELETE FROM group_members WHERE group_id = $1 AND user_id = $2', [groupId, targetUserId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;
  try {
    const adminCheck = await db.query(
      'SELECT * FROM groups WHERE id = $1 AND created_by = $2',
      [groupId, userId]
    );
    if (adminCheck.rows.length === 0) return res.status(403).json({ message: 'Only group owner can delete' });

    await db.query('DELETE FROM groups WHERE id = $1', [groupId]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getGroupMembers = async (req, res) => {
  const { groupId } = req.params;
  try {
    const result = await db.query(
      `SELECT gm.role, gm.status, p.username, p.display_name, p.avatar_url, p.user_id
       FROM group_members gm
       JOIN profiles p ON gm.user_id = p.user_id
       WHERE gm.group_id = $1`,
      [groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getMessages = async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user.id;

  try {
    // Check membership
    const memberCheck = await db.query(
      'SELECT * FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = $3',
      [groupId, userId, 'accepted']
    );
    if (memberCheck.rows.length === 0) {
      return res.status(403).json({ message: 'You are not a member of this group' });
    }

    const result = await db.query(
      `SELECT m.*, p.username, p.avatar_url
       FROM group_messages m
       JOIN profiles p ON m.sender_id = p.user_id
       WHERE m.group_id = $1
       ORDER BY m.created_at ASC`,
      [groupId]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
