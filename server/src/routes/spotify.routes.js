const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotify.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/auth-url', authMiddleware, spotifyController.getAuthUrl);
router.get('/callback', spotifyController.callback);
router.get('/top-tracks', authMiddleware, spotifyController.getTopTracks);
router.get('/top-artists', authMiddleware, spotifyController.getTopArtists);
router.get('/artist/:artistId/discography', authMiddleware, spotifyController.getArtistDiscography);
router.get('/top-artists-locations', authMiddleware, spotifyController.getTopArtistsLocations);

module.exports = router;
