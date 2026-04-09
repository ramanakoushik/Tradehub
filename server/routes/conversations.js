const express = require('express');
const router = express.Router();
const Conversation = require('../models/Conversation');
const Message = require('../models/Message');
require('../models/User'); // Register for populate
require('../models/Listing'); // Register for populate
const auth = require('../middleware/auth');

// GET / — all conversations for current user
router.get('/', auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ participants: req.user.id })
      .populate('participants', 'name avatar')
      .populate('listing', 'title images')
      .sort({ lastTimestamp: -1 });
    res.json(conversations);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /:id/messages — paginated messages
router.get('/:id/messages', auth, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo || !convo.participants.includes(req.user.id)) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 50;
    const skip = (page - 1) * limit;

    const messages = await Message.find({ conversation: req.params.id })
      .populate('sender', 'name avatar')
      .sort({ createdAt: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Message.countDocuments({ conversation: req.params.id });
    res.json({ messages, total, page, pages: Math.ceil(total / limit) });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST / — create or find existing conversation
router.post('/', auth, async (req, res) => {
  const { listingId, receiverId } = req.body;
  try {
    // Check for existing conversation between these users for this listing
    let conversation = await Conversation.findOne({
      listing: listingId,
      participants: { $all: [req.user.id, receiverId] }
    }).populate('participants', 'name avatar').populate('listing', 'title images');

    if (conversation) return res.json(conversation);

    conversation = new Conversation({
      listing: listingId,
      participants: [req.user.id, receiverId],
      unreadCount: new Map([[req.user.id, 0], [receiverId, 0]])
    });
    await conversation.save();

    const populated = await Conversation.findById(conversation._id)
      .populate('participants', 'name avatar')
      .populate('listing', 'title images');

    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /:id/read — mark all messages as read
router.patch('/:id/read', auth, async (req, res) => {
  try {
    const convo = await Conversation.findById(req.params.id);
    if (!convo || !convo.participants.map(p => p.toString()).includes(req.user.id)) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    await Message.updateMany(
      { conversation: req.params.id, sender: { $ne: req.user.id }, read: false },
      { read: true }
    );
    convo.unreadCount.set(req.user.id, 0);
    await convo.save();

    res.json({ msg: 'Messages marked as read' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
