const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, groupController.createGroup);
router.get('/', authMiddleware, groupController.getGroups);
router.post('/invite', authMiddleware, groupController.inviteMember);
router.post('/respond', authMiddleware, groupController.respondToInvite);
router.post('/messages', authMiddleware, groupController.sendMessage);
router.get('/:groupId/messages', authMiddleware, groupController.getMessages);

module.exports = router;
