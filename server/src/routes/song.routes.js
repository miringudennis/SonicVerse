const express = require('express');
const router = express.Router();
const songController = require('../controllers/song.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/', songController.getSongs);
router.get('/discovery/graph', songController.getDiscoveryGraph);
router.get('/artists/locations', songController.getArtistsWithLocation);
router.get('/:id', songController.getSongById);
router.post('/', authMiddleware, songController.createSong);

module.exports = router;
