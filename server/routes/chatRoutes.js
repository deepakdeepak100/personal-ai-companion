const express = require('express');
const router = express.Router();
const { sendMessage, getChatHistory, clearChatHistory } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.post('/:mode', protect, sendMessage);
router.get('/:mode', protect, getChatHistory);
router.delete('/:mode', protect, clearChatHistory);

module.exports = router;
