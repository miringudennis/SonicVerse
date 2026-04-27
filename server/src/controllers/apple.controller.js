const axios = require('axios');

// Mock data for Apple Music
exports.getAuthUrl = (req, res) => {
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/callback/apple?code=mock_apple_code&state=${req.user.id}`;
  res.json({ url });
};

exports.callback = async (req, res) => {
  res.json({
    success: true,
    platform: 'apple',
    username: 'Apple Auditor',
    access_token: 'mock_apple_access_token',
    refresh_token: 'mock_apple_refresh_token'
  });
};

exports.getTopTracks = async (req, res) => {
  const tracks = [
    { id: 'ap1', title: 'Levitating', artist_name: 'Dua Lipa', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7b/09/8a/7b098a5d-1681-7096-2615-582736142756/602508781331.jpg/600x600bf.png', source: 'Apple Music' },
    { id: 'ap2', title: 'Peaches', artist_name: 'Justin Bieber', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7b/09/8a/7b098a5d-1681-7096-2615-582736142756/602508781331.jpg/600x600bf.png', source: 'Apple Music' }
  ];
  res.json(tracks);
};

exports.getNeuralInsights = async (req, res) => {
  const recommendations = [
    { id: 'apr1', title: 'Save Your Tears', artist_name: 'The Weeknd', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7b/09/8a/7b098a5d-1681-7096-2615-582736142756/602508781331.jpg/600x600bf.png', source: 'Apple Music' },
    { id: 'apr2', title: 'Kiss Me More', artist_name: 'Doja Cat', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7b/09/8a/7b098a5d-1681-7096-2615-582736142756/602508781331.jpg/600x600bf.png', source: 'Apple Music' },
    { id: 'apr3', title: 'Montero', artist_name: 'Lil Nas X', cover_url: 'https://is1-ssl.mzstatic.com/image/thumb/Music114/v4/7b/09/8a/7b098a5d-1681-7096-2615-582736142756/602508781331.jpg/600x600bf.png', source: 'Apple Music' }
  ];
  res.json(recommendations);
};
