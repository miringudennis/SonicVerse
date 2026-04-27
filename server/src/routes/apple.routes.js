const express = require('express');
const router = express.Router();
const appleController = require('../controllers/apple.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/auth-url', authMiddleware, appleController.getAuthUrl);
router.get('/callback', appleController.callback);
router.get('/top-tracks', authMiddleware, appleController.getTopTracks);
router.get('/neural-insights', authMiddleware, appleController.getNeuralInsights);

module.exports = router;
