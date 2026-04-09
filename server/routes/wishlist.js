const express = require('express');
const router = express.Router();
const WishlistRequest = require('../models/WishlistRequest');
require('../models/User');
require('../models/Listing');
const auth = require('../middleware/auth');

// GET / — all open requests (+ optional filters)
router.get('/', async (req, res) => {
  const { category, urgency, status } = req.query;
  const filter = {};
  if (category) filter.category = category;
  if (urgency) filter.urgency = urgency;
  filter.status = status || 'open';

  try {
    const requests = await WishlistRequest.find(filter)
      .populate('user', 'name avatar college')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /mine — current user's requests
router.get('/mine', auth, async (req, res) => {
  try {
    const requests = await WishlistRequest.find({ user: req.user.id })
      .populate('user', 'name avatar')
      .populate('offers.user', 'name avatar')
      .populate('fulfilledBy', 'name avatar')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST / — create request
router.post('/', auth, async (req, res) => {
  const { title, description, category, budget, urgency } = req.body;
  try {
    const request = new WishlistRequest({
      user: req.user.id,
      title, description,
      category: category || 'Other',
      budget: budget || 0,
      urgency: urgency || 'medium'
    });
    await request.save();
    const populated = await WishlistRequest.findById(request._id).populate('user', 'name avatar college');
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /:id/offer — offer to fulfill (creates conversation + sends message)
router.post('/:id/offer', auth, async (req, res) => {
  const { message } = req.body;
  try {
    const request = await WishlistRequest.findById(req.params.id).populate('user', 'name');
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.user._id.toString() === req.user.id) return res.status(400).json({ msg: 'Cannot fulfill your own request' });

    // Save offer to the wishlist request
    request.offers.push({
      user: req.user.id,
      message: message || 'I can help with this!'
    });
    await request.save();

    // Create or find a conversation between offerer and request owner
    const Conversation = require('../models/Conversation');
    const Message = require('../models/Message');
    const User = require('../models/User');

    const offerer = await User.findById(req.user.id);

    let convo = await Conversation.findOne({
      participants: { $all: [req.user.id, request.user._id] }
    });
    if (!convo) {
      convo = new Conversation({
        participants: [req.user.id, request.user._id],
        unreadCount: new Map([[req.user.id, 0], [request.user._id.toString(), 0]])
      });
      await convo.save();
    }

    // Send automated offer message
    const offerText = `📋 **Wishlist Offer**\n\nI'd like to fulfill your request: "${request.title}"\n${request.budget > 0 ? `Budget: ₹${request.budget}\n` : ''}${message ? `\nMy message: ${message}` : ''}\n\n🔗 [wishlist-offer:${request._id}]`;

    const msg = new Message({
      conversation: convo._id,
      sender: req.user.id,
      text: offerText
    });
    await msg.save();

    // Update conversation metadata
    convo.lastMessage = `Wishlist offer: ${request.title}`;
    convo.lastTimestamp = new Date();
    convo.unreadCount.set(request.user._id.toString(), (convo.unreadCount.get(request.user._id.toString()) || 0) + 1);
    await convo.save();

    // Emit via Socket.io
    const io = req.app.get('io');
    const populated = await Message.findById(msg._id).populate('sender', 'name avatar');
    io.to(convo._id.toString()).emit('new_message', populated);
    io.to(request.user._id.toString()).emit('unread_count_updated', {
      conversationId: convo._id, count: convo.unreadCount.get(request.user._id.toString()) || 0
    });

    // Send notification
    const Notification = require('../models/Notification');
    const notif = new Notification({
      recipient: request.user._id,
      type: 'trade_proposal',
      message: `${offerer?.name || 'Someone'} offered to fulfill your request: "${request.title}"`,
      link: `/messages?convo=${convo._id}`
    });
    await notif.save();
    io.to(request.user._id.toString()).emit('new_notification', notif);

    res.json({ conversationId: convo._id, requestId: request._id });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /:id/fulfill — mark as fulfilled (owner only)
router.patch('/:id/fulfill', auth, async (req, res) => {
  const { offerId } = req.body;
  try {
    const request = await WishlistRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const offer = request.offers.id(offerId);
    if (!offer) return res.status(404).json({ msg: 'Offer not found' });

    request.status = 'fulfilled';
    request.fulfilledBy = offer.user;
    request.fulfilledListing = offer.listingId || null;
    await request.save();

    // Notify the fulfiller
    const Notification = require('../models/Notification');
    const notif = new Notification({
      recipient: offer.user,
      type: 'trade_accepted',
      message: `Your offer for "${request.title}" was accepted!`,
      link: '/wishlist'
    });
    await notif.save();
    const io = req.app.get('io');
    io.to(offer.user.toString()).emit('new_notification', notif);

    const populated = await WishlistRequest.findById(request._id)
      .populate('user', 'name avatar')
      .populate('fulfilledBy', 'name avatar');
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /:id/status — get request status + the offer ID for the conversation partner
router.get('/:id/status', auth, async (req, res) => {
  try {
    const request = await WishlistRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });

    // Find the offer from the other participant in this conversation
    const isOwner = request.user.toString() === req.user.id;
    let offerId = null;

    if (isOwner && request.offers.length > 0) {
      // Get the latest offer (or the first one for simplicity)
      offerId = request.offers[request.offers.length - 1]._id;
    } else {
      // Find my offer
      const myOffer = request.offers.find(o => o.user.toString() === req.user.id);
      if (myOffer) offerId = myOffer._id;
    }

    res.json({ status: request.status, offerId, isOwner });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /:id/decline-offer — decline an offer (owner only)
router.patch('/:id/decline-offer', auth, async (req, res) => {
  try {
    const request = await WishlistRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.user.toString() !== req.user.id) return res.status(403).json({ msg: 'Not authorized' });

    // Remove the last offer or mark request status (keep open for more offers)
    const lastOffer = request.offers[request.offers.length - 1];
    if (lastOffer) {
      // Notify the offerer
      const Notification = require('../models/Notification');
      const notif = new Notification({
        recipient: lastOffer.user,
        type: 'trade_declined',
        message: `Your offer for "${request.title}" was declined`,
        link: '/wishlist'
      });
      await notif.save();
      const io = req.app.get('io');
      io.to(lastOffer.user.toString()).emit('new_notification', notif);

      // Remove the declined offer
      request.offers.pull(lastOffer._id);
      await request.save();
    }

    res.json({ msg: 'Offer declined', status: request.status });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /:id/close — close request (owner only)
router.patch('/:id/close', auth, async (req, res) => {
  try {
    const request = await WishlistRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    request.status = 'closed';
    await request.save();
    res.json(request);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /:id — delete request (owner only)
router.delete('/:id', auth, async (req, res) => {
  try {
    const request = await WishlistRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found' });
    if (request.user.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    await request.deleteOne();
    res.json({ msg: 'Request deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
