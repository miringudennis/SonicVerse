const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtube.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/auth-url', authMiddleware, youtubeController.getAuthUrl);
router.get('/callback', youtubeController.callback);
router.get('/profile', authMiddleware, youtubeController.getProfile);
router.get('/top-tracks', authMiddleware, youtubeController.getTopTracks);
router.get('/top-artists', authMiddleware, youtubeController.getTopArtists);
router.get('/recently-played', authMiddleware, youtubeController.getRecentlyPlayed);
router.get('/playlists', authMiddleware, youtubeController.getPlaylists);
router.get('/playlist/:playlistId/tracks', authMiddleware, youtubeController.getPlaylistTracks);
router.get('/albums', authMiddleware, youtubeController.getAlbums);
router.get('/album/:albumId/tracks', authMiddleware, youtubeController.getAlbumTracks);
router.get('/artist/:artistId/discography', authMiddleware, youtubeController.getArtistDiscography);
router.get('/neural-insights', authMiddleware, youtubeController.getNeuralInsights);

module.exports = router;
