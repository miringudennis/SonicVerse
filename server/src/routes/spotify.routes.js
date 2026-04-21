const express = require('express');
const router = express.Router();
const spotifyController = require('../controllers/spotify.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/auth-url', authMiddleware, spotifyController.getAuthUrl);
router.get('/callback', spotifyController.callback);
router.get('/top-tracks', authMiddleware, spotifyController.getTopTracks);

module.exports = router;
