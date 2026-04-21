const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth.routes');
const songRoutes = require('./routes/song.routes');
const postRoutes = require('./routes/post.routes');
const spotifyRoutes = require('./routes/spotify.routes');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', async (req, res) => {
  try {
    const dbTest = await require('./models/db').query('SELECT NOW()');
    res.json({ status: 'ok', server: 'online', db: 'connected', time: dbTest.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', db: 'disconnected', message: err.message });
  }
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/songs', songRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/spotify', spotifyRoutes);

// Socket.io basic setup
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`SonicVerse Server running on port ${PORT}`);
});
