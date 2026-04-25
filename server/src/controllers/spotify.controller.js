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

  try {
    // 1. Get seeds from top tracks and artists
    let tracksRes, artistsRes;
    try {
        [tracksRes, artistsRes] = await Promise.all([
            axios.get('https://api.spotify.com/v1/me/top/tracks?limit=3', {
                headers: { Authorization: `Bearer ${accessToken}` }
            }),
            axios.get('https://api.spotify.com/v1/me/top/artists?limit=2', {
                headers: { Authorization: `Bearer ${accessToken}` }
            })
        ]);
    } catch (seedError) {
        console.error('Error fetching seeds for recommendations:', seedError.response?.data || seedError.message);
        // If we can't get seeds, we'll just use fallbacks later
        tracksRes = { data: { items: [] } };
        artistsRes = { data: { items: [] } };
    }

    const seedTracks = tracksRes.data?.items?.map(t => t.id).join(',') || '';
    const seedArtists = artistsRes.data?.items?.map(a => a.id).join(',') || '';

    console.log('Seeds found - Tracks:', seedTracks || 'None', 'Artists:', seedArtists || 'None');

    // If no history, use some default popular seeds to avoid 400 error
    let finalSeedTracks = seedTracks;
    let finalSeedArtists = seedArtists;
    let finalSeedGenres = '';
    
    if (!seedTracks && !seedArtists) {
      console.log('No history found, using default seeds');
      // Default seeds: Pop and Electronic genres if no tracks/artists
      finalSeedGenres = 'pop,dance,electronic';
    }

    // 2. Fetch recommendations
    // Construct URL carefully: at least one seed is required
    const params = new URLSearchParams();
    params.append('limit', '20');
    if (finalSeedTracks) params.append('seed_tracks', finalSeedTracks);
    if (finalSeedArtists) params.append('seed_artists', finalSeedArtists);
    if (finalSeedGenres) params.append('seed_genres', finalSeedGenres);

    const url = `https://api.spotify.com/v1/recommendations?${params.toString()}`;
    console.log('Fetching Spotify Recommendations from:', url);

    const response = await axios.get(url, {
      headers: { Authorization: `Bearer ${accessToken}` }
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
    console.error('Spotify Recommendations Final Error:', error.response?.data || error.message);
    res.status(error.response?.status || 500).json({ 
      message: 'Failed to fetch recommendations',
      details: error.response?.data?.error?.message || error.message
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
