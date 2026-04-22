const axios = require('axios');
const querystring = require('querystring');
const db = require('../models/db');

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback/spotify';

exports.getAuthUrl = (req, res) => {
  const scope = 'user-read-private user-read-email user-top-read user-library-read';
  const url = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: req.user.id // Pass user ID to associate token on callback
    });
  res.json({ url });
};

exports.callback = async (req, res) => {
  const code = req.query.code || null;
  const userId = req.query.state || null;

  try {
    const response = await axios({
      method: 'post',
      url: 'https://accounts.spotify.com/api/token',
      data: querystring.stringify({
        code: code,
        redirect_uri: redirect_uri,
        grant_type: 'authorization_code'
      }),
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + (new Buffer.from(client_id + ':' + client_secret).toString('base64'))
      },
    });

    const { access_token, refresh_token, expires_in } = response.data;

    // Fetch user info from Spotify to get their Spotify username
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

    // Store tokens in database (We'll need a table for this or add columns to users/profiles)
    // For now, we'll return it to the client to store in authStore for the demo
    res.json({
      success: true,
      platform: 'spotify',
      username: userResponse.data.display_name,
      access_token,
      refresh_token
    });

  } catch (error) {
    console.error('Spotify Callback Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to authenticate with Spotify' });
  }
};

exports.getTopTracks = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=20', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const tracks = response.data.items.map(track => ({
      id: track.id,
      title: track.name,
      artist_name: track.artists[0].name,
      cover_url: track.album.images[0]?.url,
      isExternal: true,
      source: 'Spotify',
      mood_tags: ['Imported', 'Spotify']
    }));

    res.json(tracks);
  } catch (error) {
    console.error('Spotify Fetch Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch Spotify data' });
  }
};

exports.getTopArtists = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const response = await axios.get('https://accounts.spotify.com/v1/me/top/artists?limit=20&time_range=medium_term', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    // Sort by popularity (as a proxy for "most listened to" if top rank isn't enough)
    const artists = response.data.items.map((artist, index) => ({
      id: artist.id,
      name: artist.name,
      images: artist.images,
      genres: artist.genres,
      popularity: artist.popularity,
      // Simulate play count based on rank (index 0 is most played)
      play_count: Math.floor(5000 / (index + 1) + Math.random() * 100)
    }));

    res.json(artists);
  } catch (error) {
    console.error('Spotify Top Artists Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch top artists' });
  }
};

exports.getArtistDiscography = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  const { artistId } = req.params;
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    // 1. Fetch Albums
    const albumsRes = await axios.get(`https://accounts.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,ep&limit=20`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    // 2. Fetch Top Tracks for this artist
    const tracksRes = await axios.get(`https://accounts.spotify.com/v1/artists/${artistId}/top-tracks?market=US`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const discography = {
      albums: albumsRes.data.items.map(album => ({
        id: album.id,
        title: album.name,
        release_date: album.release_date,
        cover_url: album.images[0]?.url,
        type: album.album_type,
        total_tracks: album.total_tracks,
        play_count: Math.floor(Math.random() * 200 + 50) // Simulated
      })),
      top_tracks: tracksRes.data.items.map(track => ({
        id: track.id,
        title: track.name,
        duration_ms: track.duration_ms,
        cover_url: track.album.images[0]?.url,
        play_count: Math.floor(Math.random() * 150 + 20) // Simulated
      }))
    };

    res.json(discography);
  } catch (error) {
    console.error('Spotify Discography Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch discography' });
  }
};

exports.getTopArtistsLocations = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/top/artists?limit=10', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const locations = [
      [-1.2921, 36.8219], [51.5074, -0.1278], [40.7128, -74.0060], 
      [35.6762, 139.6503], [-33.8688, 151.2093], [48.8566, 2.3522],
      [-23.5505, -46.6333], [55.7558, 37.6173], [28.6139, 77.2090], [31.2304, 121.4737]
    ];

    const artists = response.data.items.map((artist, index) => ({
      id: artist.id,
      username: artist.name,
      location: 'Spotify Connected',
      coordinates: locations[index % locations.length],
      genre_tags: artist.genres,
      avatar_url: artist.images[0]?.url,
      source: 'Spotify'
    }));

    res.json(artists);
  } catch (error) {
    console.error('Spotify Artists Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch Spotify artists' });
  }
};
