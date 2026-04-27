const axios = require('axios');

// Mock data for YouTube Music since it requires complex Google Cloud setup
// In a real app, this would use the YouTube Data API v3 and OAuth2
exports.getAuthUrl = (req, res) => {
  // Simulate redirect to Google/YouTube OAuth
  const url = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/callback/youtube?code=mock_yt_code&state=${req.user.id}`;
  res.json({ url });
};

exports.callback = async (req, res) => {
  // In a real app, we would exchange the code for tokens
  res.json({
    success: true,
    platform: 'youtube',
    username: 'YT Explorer',
    access_token: 'mock_yt_access_token',
    refresh_token: 'mock_yt_refresh_token'
  });
};

exports.getTopTracks = async (req, res) => {
  // Return mock YouTube Music tracks
  const tracks = [
    { id: 'yt1', title: 'Life Is Good', artist_name: 'Future ft. Drake', cover_url: 'https://i.ytimg.com/vi/l0U7SxXHkPY/maxresdefault.jpg', source: 'YouTube Music' },
    { id: 'yt2', title: 'Gods Plan', artist_name: 'Drake', cover_url: 'https://i.ytimg.com/vi/xpVfcZ0ZcFM/maxresdefault.jpg', source: 'YouTube Music' },
    { id: 'yt3', title: 'Sicko Mode', artist_name: 'Travis Scott', cover_url: 'https://i.ytimg.com/vi/6ONRf7h3Mdk/maxresdefault.jpg', source: 'YouTube Music' }
  ];
  res.json(tracks);
};

exports.getTopArtists = async (req, res) => {
  const artists = [
    { id: 'yta1', name: 'Drake', images: [{ url: 'https://yt3.googleusercontent.com/ytc/AIdro_n_FmB1_vS9hG8_N_N_N_N_N_N' }], genres: ['Hip Hop', 'Rap'] },
    { id: 'yta2', name: 'The Weeknd', images: [{ url: 'https://yt3.googleusercontent.com/ytc/AIdro_n_FmB1_vS9hG8_N_N_N_N_N_N' }], genres: ['R&B', 'Pop'] }
  ];
  res.json(artists);
};

exports.getNeuralInsights = async (req, res) => {
  const recommendations = [
    { id: 'ytr1', title: 'After Hours', artist_name: 'The Weeknd', cover_url: 'https://i.ytimg.com/vi/fHI8X4OXluQ/maxresdefault.jpg', source: 'YouTube Music' },
    { id: 'ytr2', title: 'Highest in the Room', artist_name: 'Travis Scott', cover_url: 'https://i.ytimg.com/vi/tfSS1e3kYeo/maxresdefault.jpg', source: 'YouTube Music' }
  ];
  res.json(recommendations);
};
