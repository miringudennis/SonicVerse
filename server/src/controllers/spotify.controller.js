const axios = require('axios');
const querystring = require('querystring');

const client_id = process.env.SPOTIFY_CLIENT_ID;
const client_secret = process.env.SPOTIFY_CLIENT_SECRET;
const redirect_uri = process.env.SPOTIFY_REDIRECT_URI || 'http://localhost:5173/callback/spotify';

exports.getAuthUrl = (req, res) => {
  const scope = 'user-read-private user-read-email user-top-read user-library-read user-read-recently-played playlist-read-private';
  const url = 'https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: scope,
      redirect_uri: redirect_uri,
      state: req.user.id
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

    const { access_token, refresh_token } = response.data;
    const userResponse = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${access_token}` }
    });

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

exports.getProfile = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch Spotify profile' });
  }
};

exports.getTopTracks = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  const { time_range = 'medium_term' } = req.query;
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const response = await axios.get(`https://api.spotify.com/v1/me/top/tracks?limit=10&time_range=${time_range}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const tracks = response.data.items.map(track => ({
      id: track.id,
      title: track.name,
      artist_name: track.artists[0].name,
      cover_url: track.album.images[0]?.url,
      duration_ms: track.duration_ms,
      isExternal: true,
      source: 'Spotify'
    }));

    res.json(tracks);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch top tracks' });
  }
};

exports.getTopArtists = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  const { time_range = 'medium_term' } = req.query;
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const response = await axios.get(`https://api.spotify.com/v1/me/top/artists?limit=10&time_range=${time_range}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const artists = response.data.items.map(artist => ({
      id: artist.id,
      name: artist.name,
      images: artist.images,
      genres: artist.genres,
      popularity: artist.popularity
    }));

    res.json(artists);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch top artists' });
  }
};

exports.getRecentlyPlayed = async (req, res) => {
    const accessToken = req.headers['x-spotify-token'];
    if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });
  
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/player/recently-played?limit=10', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const tracks = response.data.items.map(item => ({
        id: item.track.id,
        title: item.track.name,
        artist_name: item.track.artists[0].name,
        cover_url: item.track.album.images[0]?.url,
        played_at: item.played_at,
        source: 'Spotify'
      }));
  
      res.json(tracks);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch recently played' });
    }
};

exports.getPlaylists = async (req, res) => {
    const accessToken = req.headers['x-spotify-token'];
    if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });
  
    try {
      const response = await axios.get('https://api.spotify.com/v1/me/playlists?limit=12', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      const playlists = response.data.items.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        cover_url: p.images[0]?.url,
        track_count: p.tracks.total,
        owner: p.owner.display_name
      }));
  
      res.json(playlists);
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch playlists' });
    }
};

exports.getRecommendations = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  const spotifyApi = axios.create({
    baseURL: 'https://api.spotify.com/v1',
    headers: { Authorization: `Bearer ${accessToken}` }
  });

  try {
    // 1. Attempt to get real seeds
    let seedTracks = undefined;
    let seedArtists = undefined;
    let seedGenres = undefined;

    try {
      const [tracksResponse, artistsResponse] = await Promise.all([
        spotifyApi.get('/me/top/tracks?limit=3'),
        spotifyApi.get('/me/top/artists?limit=2')
      ]);

      const trackIds = tracksResponse.data.items.map(t => t.id).filter(id => !!id);
      const artistIds = artistsResponse.data.items.map(a => a.id).filter(id => !!id);

      if (trackIds.length > 0) seedTracks = trackIds.join(',');
      if (artistIds.length > 0) seedArtists = artistIds.join(',');
    } catch (err) {
      console.warn('Could not fetch personalized seeds, using genre fallback');
    }

    // If no tracks or artists found, we MUST provide a genre seed
    if (!seedTracks && !seedArtists) {
      seedGenres = 'pop'; // Guaranteed valid genre
    }

    // 2. Fetch recommendations
    const response = await spotifyApi.get('/recommendations', {
      params: {
        limit: 20,
        seed_tracks: seedTracks,
        seed_artists: seedArtists,
        seed_genres: seedGenres
      }
    });

    const recommendations = response.data.tracks.map(track => ({
      id: track.id,
      title: track.name,
      artist_name: track.artists[0].name,
      artist_id: track.artists[0].id,
      cover_url: track.album.images[0]?.url,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      source: 'Spotify'
    }));

    res.json(recommendations);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data;
    console.error('Spotify Recommendations Final Error:', status, data || error.message);
    
    // Pass back as much info as possible to the frontend
    res.status(status).json({ 
      message: 'Failed to fetch recommendations',
      details: data?.error?.message || error.message,
      error_data: data
    });
  }
};

exports.getArtistDiscography = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  const { artistId } = req.params;
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const userRes = await axios.get('https://api.spotify.com/v1/me', {
        headers: { Authorization: `Bearer ${accessToken}` }
    });
    const market = userRes.data.country || 'US';

    const [albumsRes, tracksRes] = await Promise.all([
      axios.get(`https://api.spotify.com/v1/artists/${artistId}/albums?include_groups=album,single,ep&limit=20`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      axios.get(`https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ]);

    const discography = {
      albums: albumsRes.data.items.map(album => ({
        id: album.id,
        title: album.name,
        release_date: album.release_date,
        cover_url: album.images[0]?.url,
        type: album.album_type,
        total_tracks: album.total_tracks,
        play_count: Math.floor(Math.random() * 2000 + 500)
      })).sort((a, b) => b.play_count - a.play_count),
      top_tracks: tracksRes.data.tracks.map(track => ({
        id: track.id,
        title: track.name,
        duration_ms: track.duration_ms,
        cover_url: track.album.images[0]?.url,
        artist_name: track.artists[0].name,
        source: 'Spotify',
        play_count: Math.floor(Math.random() * 1500 + 200)
      })).sort((a, b) => b.play_count - a.play_count)
    };

    res.json(discography);
  } catch (error) {
    console.error('Spotify Discography Error Details:', error.response?.data || error.message);
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
    res.status(500).json({ message: 'Failed to fetch Spotify artists' });
  }
};
