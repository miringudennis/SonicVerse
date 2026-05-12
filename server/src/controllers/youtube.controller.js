const { google } = require('googleapis');

const client_id = process.env.YOUTUBE_CLIENT_ID;
const client_secret = process.env.YOUTUBE_CLIENT_SECRET;
const redirect_uri = process.env.YOUTUBE_REDIRECT_URI || 'http://localhost:5173/callback/youtube';

const oauth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uri
);

exports.getAuthUrl = (req, res) => {
  const scopes = [
    'https://www.googleapis.com/auth/youtube.readonly',
    'https://www.googleapis.com/auth/userinfo.profile'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    state: req.user.id,
    prompt: 'consent'
  });

  res.json({ url });
};

exports.callback = async (req, res) => {
  const { code } = req.query;

  try {
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    // Get user profile info
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client });
    const userInfo = await oauth2.userinfo.get();

    res.json({
      success: true,
      platform: 'youtube',
      username: userInfo.data.name || 'YouTube Explorer',
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_at: tokens.expiry_date
    });
  } catch (error) {
    console.error('YouTube Callback Error:', error.message);
    res.status(500).json({ message: 'Failed to authenticate with YouTube' });
  }
};

exports.getProfile = async (req, res) => {
  const accessToken = req.headers['x-youtube-token'];
  if (!accessToken) return res.status(401).json({ message: 'No YouTube token provided' });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const oauth2 = google.oauth2({ version: 'v2', auth });
    const userInfo = await oauth2.userinfo.get();

    // To get more YouTube specific info like subscriber count, we'd need channel info
    const youtube = google.youtube({ version: 'v3', auth });
    const channelRes = await youtube.channels.list({
      part: 'snippet,statistics',
      mine: true
    });

    const channel = channelRes.data.items?.[0];

    res.json({
      username: userInfo.data.name,
      display_name: userInfo.data.name,
      avatar_url: userInfo.data.picture,
      images: [{ url: userInfo.data.picture }],
      country: channel?.snippet?.country || 'Unknown',
      followers: { total: channel?.statistics?.subscriberCount || 0 }
    });
  } catch (error) {
    console.error('YouTube Profile Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube profile' });
  }
};

exports.getRecentlyPlayed = async (req, res) => {
  const accessToken = req.headers['x-youtube-token'];
  if (!accessToken) return res.status(401).json({ message: 'No YouTube token provided' });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth });

    // YouTube doesn't have a direct "recently played" for API (it's private)
    // We can fetch user's recent uploads or activities if public, but for music,
    // "liked" videos is usually the best proxy for music users.
    // However, if we want "recently played", we might need to use the activities list
    const response = await youtube.activities.list({
      part: 'snippet,contentDetails',
      mine: true,
      maxResults: 10
    });

    const tracks = response.data.items
      .filter(item => item.snippet.type === 'upload' || item.snippet.type === 'playlistItem')
      .map(item => ({
        id: item.contentDetails.upload?.videoId || item.id,
        videoId: item.contentDetails.upload?.videoId || item.id,
        title: item.snippet.title,
        artist_name: item.snippet.channelTitle,
        cover_url: item.snippet.thumbnails.high?.url,
        played_at: item.snippet.publishedAt,
        external_url: `https://music.youtube.com/watch?v=${item.contentDetails.upload?.videoId || item.id}`,
        source: 'YouTube Music'
      }));

    res.json(tracks);
  } catch (error) {
    console.error('YouTube Recent Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch recently played' });
  }
};

exports.getPlaylists = async (req, res) => {
  const accessToken = req.headers['x-youtube-token'];
  if (!accessToken) return res.status(401).json({ message: 'No YouTube token provided' });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth });

    const response = await youtube.playlists.list({
      part: 'snippet,contentDetails',
      mine: true,
      maxResults: 20
    });

    const playlists = response.data.items.map(p => ({
      id: p.id,
      name: p.snippet.title,
      description: p.snippet.description || 'YouTube Music Collection',
      cover_url: p.snippet.thumbnails.high?.url || p.snippet.thumbnails.default?.url,
      track_count: p.contentDetails.itemCount,
      owner: p.snippet.channelTitle
    }));

    res.json(playlists);
  } catch (error) {
    console.error('YouTube Playlists Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube playlists' });
  }
};

exports.getPlaylistTracks = async (req, res) => {
  const accessToken = req.headers['x-youtube-token'];
  const { playlistId } = req.params;
  if (!accessToken) return res.status(401).json({ message: 'No YouTube token provided' });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth });

    const [playlistRes, itemsRes] = await Promise.all([
      youtube.playlists.list({ part: 'snippet', id: playlistId }),
      youtube.playlistItems.list({
        part: 'snippet,contentDetails',
        playlistId: playlistId,
        maxResults: 50
      })
    ]);

    const tracks = itemsRes.data.items.map(item => ({
      id: item.contentDetails.videoId,
      videoId: item.contentDetails.videoId,
      title: item.snippet.title,
      artist_name: item.snippet.videoOwnerChannelTitle || item.snippet.channelTitle,
      cover_url: item.snippet.thumbnails.high?.url,
      external_url: `https://music.youtube.com/watch?v=${item.contentDetails.videoId}`,
      source: 'YouTube Music',
      isExternal: true
    }));

    res.json({
      playlist_name: playlistRes.data.items[0]?.snippet.title,
      cover_url: playlistRes.data.items[0]?.snippet.thumbnails.high?.url,
      tracks: tracks
    });
  } catch (error) {
    console.error('YouTube Playlist Tracks Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch playlist tracks' });
  }
};

exports.getTopTracks = async (req, res) => {
  const accessToken = req.headers['x-youtube-token'];
  if (!accessToken) return res.status(401).json({ message: 'No YouTube token provided' });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth });

    // Fetch user's liked videos in the Music category (ID: 10)
    const response = await youtube.videos.list({
      part: 'snippet,contentDetails,statistics',
      myRating: 'like',
      maxResults: 20
    });

    const tracks = response.data.items
      .filter(video => video.snippet.categoryId === '10') // Strictly Music Category
      .map(video => ({
        id: video.id,
        videoId: video.id,
        title: video.snippet.title,
        artist_name: video.snippet.channelTitle,
        cover_url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
        duration: video.contentDetails.duration,
        source: 'YouTube Music',
        external_url: `https://music.youtube.com/watch?v=${video.id}`,
        isExternal: true
      }));

    res.json(tracks);
  } catch (error) {
    console.error('YouTube Top Tracks Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube tracks' });
  }
};

exports.getAlbums = async (req, res) => {
  const accessToken = req.headers['x-youtube-token'];
  if (!accessToken) return res.status(401).json({ message: 'No YouTube token provided' });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth });

    // In YouTube, "Albums" in the library are often just playlists.
    // We fetch the user's playlists to represent their saved collections.
    const response = await youtube.playlists.list({
      part: 'snippet,contentDetails',
      mine: true,
      maxResults: 20
    });

    const albums = response.data.items.map(p => ({
      id: p.id,
      title: p.snippet.title,
      artist_name: p.snippet.channelTitle,
      cover_url: p.snippet.thumbnails.high?.url || p.snippet.thumbnails.default?.url,
      release_date: p.snippet.publishedAt,
      total_tracks: p.contentDetails.itemCount,
      type: 'Album',
      source: 'YouTube Music'
    }));

    res.json(albums);
  } catch (error) {
    console.error('YouTube Albums Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube albums' });
  }
};

exports.getAlbumTracks = async (req, res) => {
  // Alias to playlist tracks since albums are playlists in YT API
  return exports.getPlaylistTracks(req, res);
};

exports.getTopArtists = async (req, res) => {
  const accessToken = req.headers['x-youtube-token'];
  if (!accessToken) return res.status(401).json({ message: 'No YouTube token provided' });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth });

    // YouTube doesn't have a direct "top artists" endpoint for users.
    // We can approximate by looking at the channels of their liked music videos.
    const response = await youtube.videos.list({
      part: 'snippet',
      myRating: 'like',
      maxResults: 50
    });

    const channelCounts = {};
    response.data.items.forEach(video => {
        if (video.snippet.categoryId === '10') {
            const channelId = video.snippet.channelId;
            const channelTitle = video.snippet.channelTitle;
            if (!channelCounts[channelId]) {
                channelCounts[channelId] = { id: channelId, name: channelTitle, count: 0 };
            }
            channelCounts[channelId].count++;
        }
    });

    const artists = Object.values(channelCounts)
        .sort((a, b) => b.count - a.count)
        .slice(0, 10)
        .map(artist => ({
            id: artist.id,
            name: artist.name,
            images: [{ url: `https://yt3.googleusercontent.com/ytc/` }], // Placeholder, fetching channel icons requires more API calls
            genres: ['YouTube Artist']
        }));

    res.json(artists);
  } catch (error) {
    console.error('YouTube Top Artists Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube artists' });
  }
};

exports.getArtistDiscography = async (req, res) => {
  const accessToken = req.headers['x-youtube-token'];
  const { artistId } = req.params;
  if (!accessToken) return res.status(401).json({ message: 'No YouTube token provided' });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth });

    // Fetch top tracks (most popular videos) for the artist (channel)
    const tracksRes = await youtube.search.list({
      part: 'snippet',
      channelId: artistId,
      order: 'viewCount',
      type: 'video',
      videoCategoryId: '10',
      maxResults: 10
    });

    // Fetch "albums" (playlists) created by this channel
    const albumsRes = await youtube.playlists.list({
      part: 'snippet,contentDetails',
      channelId: artistId,
      maxResults: 10
    });

    const discography = {
      albums: albumsRes.data.items.map(album => ({
        id: album.id,
        title: album.snippet.title,
        release_date: album.snippet.publishedAt,
        cover_url: album.snippet.thumbnails.high?.url,
        type: 'Album',
        total_tracks: album.contentDetails.itemCount,
        play_count: Math.floor(Math.random() * 2000 + 500)
      })),
      top_tracks: tracksRes.data.items.map(track => ({
        id: track.id.videoId,
        videoId: track.id.videoId,
        title: track.snippet.title,
        duration_ms: 0, // YouTube search doesn't return duration
        cover_url: track.snippet.thumbnails.high?.url,
        artist_name: track.snippet.channelTitle,
        external_url: `https://music.youtube.com/watch?v=${track.id.videoId}`,
        source: 'YouTube Music',
        play_count: Math.floor(Math.random() * 1500 + 200)
      }))
    };

    res.json(discography);
  } catch (error) {
    console.error('YouTube Discography Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube discography' });
  }
};

exports.getNeuralInsights = async (req, res) => {
  const accessToken = req.headers['x-youtube-token'];
  if (!accessToken) return res.status(401).json({ message: 'No YouTube token provided' });

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: accessToken });
    const youtube = google.youtube({ version: 'v3', auth });

    // Fetch related music videos based on the most recent liked video
    const likedVideos = await youtube.videos.list({
      part: 'snippet',
      myRating: 'like',
      maxResults: 1
    });

    if (!likedVideos.data.items.length) {
        return res.json([]);
    }

    const videoId = likedVideos.data.items[0].id;
    const recommendations = await youtube.search.list({
        part: 'snippet',
        relatedToVideoId: videoId,
        type: 'video',
        videoCategoryId: '10',
        maxResults: 10
    });

    const tracks = recommendations.data.items.map(item => ({
        id: item.id.videoId,
        videoId: item.id.videoId,
        title: item.snippet.title,
        artist_name: item.snippet.channelTitle,
        cover_url: item.snippet.thumbnails.high?.url,
        external_url: `https://music.youtube.com/watch?v=${item.id.videoId}`,
        source: 'YouTube Music'
    }));

    res.json(tracks);
  } catch (error) {
    console.error('YouTube Insights Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube recommendations' });
  }
};
