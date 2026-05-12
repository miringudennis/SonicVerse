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
      .filter(video => video.snippet.categoryId === '10' || video.snippet.title.toLowerCase().includes('music'))
      .map(video => ({
        id: video.id,
        videoId: video.id,
        title: video.snippet.title,
        artist_name: video.snippet.channelTitle,
        cover_url: video.snippet.thumbnails.high?.url || video.snippet.thumbnails.default?.url,
        duration: video.contentDetails.duration,
        source: 'YouTube Music',
        isExternal: true
      }));

    res.json(tracks);
  } catch (error) {
    console.error('YouTube Top Tracks Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube tracks' });
  }
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
        source: 'YouTube Music'
    }));

    res.json(tracks);
  } catch (error) {
    console.error('YouTube Insights Error:', error.message);
    res.status(500).json({ message: 'Failed to fetch YouTube recommendations' });
  }
};
