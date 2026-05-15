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
      `SELECT g.*, gm.role, gm.status, gm.joined_at
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
      res.json({ success: true, member: result.rows[0] });
    } else {
      await db.query(
        'DELETE FROM group_members WHERE group_id = $1 AND user_id = $2 AND status = $3',
        [groupId, userId, 'invited']
      );
      res.json({ success: true, message: 'Invite declined' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.sendMessage = async (req, res) => {
  const { groupId, content } = req.body;
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
      'INSERT INTO group_messages (group_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *',
      [groupId, userId, content]
    );

    // Optional: Notify other members (complex for simple REST, usually handled by sockets)
    
    res.status(201).json(result.rows[0]);
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
