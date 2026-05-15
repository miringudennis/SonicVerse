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
      audio_url: track.preview_url, // Map preview_url to audio_url
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
        audio_url: item.track.preview_url,
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
      const response = await axios.get('https://api.spotify.com/v1/me/playlists?limit=20', {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      if (!response.data || !response.data.items) {
        return res.json([]);
      }

      const playlists = response.data.items.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description || 'Curated Sonic Collection',
        cover_url: p.images?.[0]?.url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=300&h=300&fit=crop',
        track_count: p.tracks?.total || 0,
        owner: p.owner?.display_name || 'User'
      }));
  
      res.json(playlists);
    } catch (error) {
      console.error('Spotify Playlists Error:', error.response?.data || error.message);
      res.status(500).json({ message: 'Failed to fetch playlists' });
    }
};

exports.getPlaylistTracks = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  const { playlistId } = req.params;
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const response = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}/tracks?limit=20`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const playlistResponse = await axios.get(`https://api.spotify.com/v1/playlists/${playlistId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const tracks = response.data.items.map(item => {
      const track = item.track;
      return {
        id: track.id,
        title: track.name,
        artist_name: track.artists[0].name,
        duration_ms: track.duration_ms,
        cover_url: track.album?.images[0]?.url || playlistResponse.data.images?.[0]?.url,
        audio_url: track.preview_url,
        isExternal: true,
        source: 'Spotify'
      };
    });

    res.json({
      playlist_name: playlistResponse.data.name,
      cover_url: playlistResponse.data.images?.[0]?.url,
      tracks: tracks
    });
  } catch (error) {
    console.error('Spotify Playlist Tracks Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch playlist tracks' });
  }
};

exports.getSavedAlbums = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const response = await axios.get('https://api.spotify.com/v1/me/albums?limit=12', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    const albums = response.data.items.map(item => ({
      id: item.album.id,
      title: item.album.name,
      artist_name: item.album.artists[0].name,
      cover_url: item.album.images[0]?.url,
      release_date: item.album.release_date,
      total_tracks: item.album.total_tracks,
      source: 'Spotify'
    }));

    res.json(albums);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch saved albums' });
  }
};

exports.getAlbumTracks = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  const { albumId } = req.params;
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const response = await axios.get(`https://api.spotify.com/v1/albums/${albumId}/tracks`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    // To get the cover image, we might need to fetch the album details too, 
    // but usually the frontend already has it. For safety, let's just return tracks.
    // However, if we want each track to have cover_url, we need it.
    
    const albumResponse = await axios.get(`https://api.spotify.com/v1/albums/${albumId}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const tracks = response.data.items.map(track => ({
      id: track.id,
      title: track.name,
      artist_name: track.artists[0].name,
      duration_ms: track.duration_ms,
      cover_url: albumResponse.data.images[0]?.url,
      isExternal: true,
      source: 'Spotify'
    }));

    res.json({
      album_title: albumResponse.data.name,
      artist_name: albumResponse.data.artists[0].name,
      cover_url: albumResponse.data.images[0]?.url,
      tracks: tracks
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch album tracks' });
  }
};

exports.getRecommendations = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    // 1. Fetch top tracks to use as seeds
    const topTracksRes = await axios.get('https://api.spotify.com/v1/me/top/tracks?limit=5', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    let seeds = '';
    if (topTracksRes.data.items && topTracksRes.data.items.length > 0) {
      seeds = `seed_tracks=${topTracksRes.data.items.map(t => t.id).join(',')}`;
    } else {
      seeds = 'seed_genres=pop,electronic'; // Fallback
    }

    const response = await axios.get(`https://api.spotify.com/v1/recommendations?limit=10&${seeds}`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const recommendations = response.data.tracks.map(track => ({
      id: track.id,
      title: track.name,
      artist_name: track.artists[0].name,
      artist_id: track.artists[0].id,
      cover_url: track.album.images[0]?.url,
      audio_url: track.preview_url,
      preview_url: track.preview_url,
      external_url: track.external_urls.spotify,
      source: 'Spotify'
    }));

    res.json(recommendations);
  } catch (error) {
    const status = error.response?.status || 500;
    const data = error.response?.data;
    console.error('CRITICAL: Neural Insight Failure:', status, data || error.message);
    res.status(status).json({ 
      message: 'Neural Engine Fault',
      details: data?.error?.message || error.message,
      code: 'SPOTIFY_RECS_FAILURE'
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
        audio_url: track.preview_url,
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

exports.getAnalytics = async (req, res) => {
  const accessToken = req.headers['x-spotify-token'];
  if (!accessToken) return res.status(401).json({ message: 'No Spotify token provided' });

  try {
    const [topTracksLong, topArtistsLong, playlists, albums] = await Promise.all([
      axios.get('https://api.spotify.com/v1/me/top/tracks?limit=50&time_range=long_term', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      axios.get('https://api.spotify.com/v1/me/top/artists?limit=50&time_range=long_term', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      axios.get('https://api.spotify.com/v1/me/playlists?limit=1', {
        headers: { Authorization: `Bearer ${accessToken}` }
      }),
      axios.get('https://api.spotify.com/v1/me/albums?limit=1', {
        headers: { Authorization: `Bearer ${accessToken}` }
      })
    ]);

    // Synthetic estimation for "minutes listened" as Spotify API doesn't provide all-time total directly
    // We'll base it on top tracks and a multiplier for a "neural estimate"
    const topTracks = topTracksLong.data.items;
    const avgTrackDurationMs = topTracks.length > 0 
      ? topTracks.reduce((acc, t) => acc + t.duration_ms, 0) / topTracks.length 
      : 210000;
    
    // Estimate based on popularity and track counts
    const estimatedTotalTracks = 1200 + (topTracks.length * 25); 
    const estimatedMinutes = Math.floor((estimatedTotalTracks * (avgTrackDurationMs / 60000)) * 1.5);

    res.json({
      total_minutes: estimatedMinutes,
      total_tracks: estimatedTotalTracks,
      total_artists: 450 + (topArtistsLong.data.items.length * 10),
      total_playlists: playlists.data.total,
      total_albums: albums.data.total,
      top_3_artists: topArtistsLong.data.items.slice(0, 3).map(a => ({
        name: a.name,
        image: a.images[0]?.url
      })),
      top_3_tracks: topTracksLong.data.items.slice(0, 3).map(t => ({
        title: t.name,
        artist: t.artists[0].name,
        image: t.album.images[0]?.url
      }))
    });
  } catch (error) {
    console.error('Spotify Analytics Error:', error.response?.data || error.message);
    res.status(500).json({ message: 'Failed to fetch neural analytics' });
  }
};
