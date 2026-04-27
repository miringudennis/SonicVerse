const express = require('express');
const router = express.Router();
const youtubeController = require('../controllers/youtube.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/auth-url', authMiddleware, youtubeController.getAuthUrl);
router.get('/callback', youtubeController.callback);
router.get('/top-tracks', authMiddleware, youtubeController.getTopTracks);
router.get('/top-artists', authMiddleware, youtubeController.getTopArtists);
router.get('/neural-insights', authMiddleware, youtubeController.getNeuralInsights);

module.exports = router;
