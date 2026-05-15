const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../models/db');

exports.register = async (req, res) => {
  const { email, password, username } = req.body;
  console.log('Registration attempt:', { email, username });
  
  try {
    const userCheck = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Email address already registered' });
    }

    const usernameCheck = await db.query('SELECT * FROM profiles WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(400).json({ message: 'Username already taken' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Use a transaction to ensure both user and profile are created
    const client = await db.getClient();
    
    try {
      await client.query('BEGIN');
      const newUser = await client.query(
        'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, role',
        [email, passwordHash]
      );

      const userId = newUser.rows[0].id;
      await client.query(
        'INSERT INTO profiles (user_id, username, display_name) VALUES ($1, $2, $3)',
        [userId, username, username]
      );

      await client.query('COMMIT');
      
      const token = jwt.sign(
        { id: userId, role: newUser.rows[0].role }, 
        process.env.JWT_SECRET || 'fallback_secret', 
        { expiresIn: '1d' }
      );
      
      console.log('Registration successful:', userId);
      res.status(201).json({ token, user: newUser.rows[0] });
    } catch (insertErr) {
      await client.query('ROLLBACK');
      throw insertErr;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error('Registration error detail:', err);
    res.status(500).json({ message: 'Internal server error during registration', detail: err.message });
  }
};

exports.login = async (req, res) => {
    const { emailOrUsername, email, username, password } = req.body;
    let loginCredential = emailOrUsername || email || username;
    let user;

    if (!loginCredential) {
        return res.status(400).json({ message: 'Login credential (email or username) is required.' });
    }

    try {
        if (loginCredential.includes('@')) {
          // It looks like an email address
          const result = await db.query('SELECT u.*, p.username, p.avatar_url FROM users u JOIN profiles p ON u.id = p.user_id WHERE u.email = $1', [loginCredential]);
          user = result.rows[0];
        } else {
          // Assume it's a username
          const result = await db.query('SELECT u.*, p.username, p.avatar_url FROM users u JOIN profiles p ON u.id = p.user_id WHERE p.username = $1', [loginCredential]);
          user = result.rows[0];
        }

        if (!user) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        const validPassword = await bcrypt.compare(password, user.password_hash);
        if (!validPassword) {
          return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
          { id: user.id, email: user.email, role: user.role, username: user.username }, 
          process.env.JWT_SECRET || 'fallback_secret', 
          { expiresIn: '1d' }
        );

        // Return essential user info, including username and avatar_url
        res.json({ token, user: { id: user.id, email: user.email, role: user.role, username: user.username, avatar_url: user.avatar_url } });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: err.message });
    }
};

exports.updateProfile = async (req, res) => {
  const { username, display_name, bio, avatar_url, location } = req.body;
  const userId = req.user.id;

  try {
    if (username) {
      const usernameCheck = await db.query('SELECT * FROM profiles WHERE username = $1 AND user_id != $2', [username, userId]);
      if (usernameCheck.rows.length > 0) {
        return res.status(400).json({ message: 'Username already taken' });
      }
    }

    const result = await db.query(
      `UPDATE profiles 
       SET username = COALESCE($1, username),
           display_name = COALESCE($2, display_name),
           bio = COALESCE($3, bio),
           avatar_url = COALESCE($4, avatar_url),
           location = COALESCE($5, location)
       WHERE user_id = $6
       RETURNING *`,
      [username, display_name, bio, avatar_url, location, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Profile not found' });
    }

    res.json({ success: true, profile: result.rows[0] });
  } catch (err) {
    console.error('Update profile error:', err);
    res.status(500).json({ message: err.message });
  }
};
