const express = require('express');
const router = express.Router();
const groupController = require('../controllers/group.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/', authMiddleware, groupController.createGroup);
router.get('/', authMiddleware, groupController.getGroups);
router.post('/invite', authMiddleware, groupController.inviteMember);
router.post('/respond', authMiddleware, groupController.respondToInvite);
router.put('/rename', authMiddleware, groupController.renameGroup);
router.post('/remove-member', authMiddleware, groupController.removeMember);
router.delete('/:groupId', authMiddleware, groupController.deleteGroup);
router.get('/:groupId/members', authMiddleware, groupController.getGroupMembers);
router.post('/messages', authMiddleware, groupController.sendMessage);
router.get('/:groupId/messages', authMiddleware, groupController.getMessages);
router.post('/:groupId/read', authMiddleware, groupController.markRead);

router.put('/update', authMiddleware, groupController.updateGroup);
router.delete('/messages/:messageId', authMiddleware, groupController.deleteMessage);

module.exports = router;
