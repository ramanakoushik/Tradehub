const express = require('express');
const router = express.Router();
const Listing = require('../models/Listing');
require('../models/User'); // Register User schema for populate
const auth = require('../middleware/auth');

// GET / — all active listings with filters
router.get('/', async (req, res) => {
  const { category, type, minPrice, maxPrice, condition, sort, search } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (type) filter.type = type;
  if (condition) filter.condition = condition;
  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.$gte = Number(minPrice);
    if (maxPrice) filter.price.$lte = Number(maxPrice);
  }
  if (search) {
    filter.$or = [
      { title: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  let sortObj = { createdAt: -1 };
  if (sort === 'price_asc') sortObj = { price: 1 };
  if (sort === 'price_desc') sortObj = { price: -1 };
  if (sort === 'popular') sortObj = { views: -1 };

  try {
    const listings = await Listing.find(filter).populate('seller', 'name avatar rating').sort(sortObj);
    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /:id — single listing, increment views
router.get('/:id', async (req, res) => {
  try {
    const listing = await Listing.findByIdAndUpdate(
      req.params.id,
      { $inc: { views: 1 } },
      { new: true }
    ).populate('seller', 'name email avatar rating college createdAt');
    if (!listing) return res.status(404).json({ msg: 'Listing not found' });
    res.json(listing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST / — create listing
router.post('/', auth, async (req, res) => {
  const { title, description, category, condition, type, price, rentPeriod, tradePreference, images } = req.body;
  try {
    const listing = new Listing({
      title, description, category, condition, type,
      price: price || 0,
      rentPeriod, tradePreference,
      images: images || [],
      seller: req.user.id
    });
    await listing.save();
    const populated = await Listing.findById(listing._id).populate('seller', 'name avatar rating');
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT /:id — edit listing (owner only)
router.put('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ msg: 'Listing not found' });
    if (listing.seller.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    const updates = req.body;
    Object.keys(updates).forEach(key => { listing[key] = updates[key]; });
    await listing.save();
    res.json(listing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// DELETE /:id
router.delete('/:id', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ msg: 'Listing not found' });
    if (listing.seller.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });
    await listing.deleteOne();
    res.json({ msg: 'Listing deleted' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST /:id/interest — buyer registers interest, notifies seller
router.post('/:id/interest', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id).populate('seller', 'name');
    if (!listing) return res.status(404).json({ msg: 'Listing not found' });
    if (listing.seller._id.toString() === req.user.id) return res.status(400).json({ msg: 'Cannot buy your own listing' });

    const User = require('../models/User');
    const buyer = await User.findById(req.user.id);
    const Notification = require('../models/Notification');

    const notif = new Notification({
      recipient: listing.seller._id,
      type: 'trade_proposal',
      message: `💰 ${buyer?.name || 'Someone'} wants to buy your "${listing.title}" for ₹${listing.price}`,
      link: `/listing/${listing._id}`
    });
    await notif.save();

    const io = req.app.get('io');
    io.to(listing.seller._id.toString()).emit('new_notification', notif);

    res.json({ msg: 'Interest registered, seller notified' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const listing = await Listing.findById(req.params.id);
    if (!listing) return res.status(404).json({ msg: 'Listing not found' });

    const isSeller = listing.seller.toString() === req.user.id;

    // Allow buyers (who have a conversation for this listing) to mark as 'sold'
    if (!isSeller) {
      if (req.body.status === 'sold') {
        const Conversation = require('../models/Conversation');
        const convo = await Conversation.findOne({
          listing: req.params.id,
          participants: req.user.id
        });
        if (!convo) return res.status(403).json({ msg: 'Not authorized' });
      } else {
        return res.status(403).json({ msg: 'Only the seller can change this status' });
      }
    }

    listing.status = req.body.status;
    await listing.save();

    // Broadcast status change to all connected clients
    const io = req.app.get('io');
    io.emit('listing_updated', { listingId: listing._id, status: listing.status });

    // If a buyer finalized the deal, notify the seller
    if (!isSeller && req.body.status === 'sold') {
      const Notification = require('../models/Notification');
      const User = require('../models/User');
      const buyer = await User.findById(req.user.id);
      const notif = new Notification({
        recipient: listing.seller,
        type: 'trade_accepted',
        message: `${buyer?.name || 'A buyer'} finalized the purchase of "${listing.title}"`,
        link: `/listing/${listing._id}`
      });
      await notif.save();
      io.to(listing.seller.toString()).emit('new_notification', notif);
    }

    res.json(listing);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
