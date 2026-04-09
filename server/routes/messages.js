const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
require('../models/User'); // Register for populate
const auth = require('../middleware/auth');

// POST / — send a message (REST fallback, Socket.io is primary)
router.post('/', auth, async (req, res) => {
  const { conversationId, text, imageUrl } = req.body;
  try {
    const convo = await Conversation.findById(conversationId);
    if (!convo || !convo.participants.map(p => p.toString()).includes(req.user.id)) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const message = new Message({
      conversation: conversationId,
      sender: req.user.id,
      text: text || '',
      imageUrl: imageUrl || ''
    });
    await message.save();

    // Update conversation metadata
    convo.lastMessage = text || '📷 Image';
    convo.lastTimestamp = new Date();
    convo.participants.forEach(p => {
      if (p.toString() !== req.user.id) {
        convo.unreadCount.set(p.toString(), (convo.unreadCount.get(p.toString()) || 0) + 1);
      }
    });
    await convo.save();

    const populated = await Message.findById(message._id).populate('sender', 'name avatar');

    // Emit via Socket.io
    const io = req.app.get('io');
    io.to(conversationId).emit('new_message', populated);
    convo.participants.forEach(p => {
      if (p.toString() !== req.user.id) {
        io.to(p.toString()).emit('unread_count_updated', {
          conversationId, count: convo.unreadCount.get(p.toString()) || 0
        });
      }
    });

    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
