const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.get('/search', authMiddleware, socialController.searchUsers);
router.post('/follow', authMiddleware, socialController.followUser);
router.post('/unfollow', authMiddleware, socialController.unfollowUser);
router.get('/following', authMiddleware, socialController.getFollowing);
router.get('/notifications', authMiddleware, socialController.getNotifications);
router.post('/notifications/read', authMiddleware, socialController.markNotificationsRead);

module.exports = router;
