const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Listing = require('../models/Listing');
const Rental = require('../models/Rental');
const TradeProposal = require('../models/TradeProposal');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// GET /:id — public profile
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'User not found' });

    const listings = await Listing.find({ seller: req.params.id, status: 'active' });
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatar')
      .sort({ createdAt: -1 }).limit(10);

    res.json({ user, listings, reviews });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT /me — update own profile
router.put('/me', auth, async (req, res) => {
  try {
    const { name, college, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, college, avatar },
      { new: true }
    ).select('-password');
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /me/listings
router.get('/me/listings', auth, async (req, res) => {
  try {
    const listings = await Listing.find({ seller: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /me/rentals
router.get('/me/rentals', auth, async (req, res) => {
  try {
    const asRenter = await Rental.find({ renter: req.user.id }).populate('listing', 'title images').populate('owner', 'name');
    const asOwner = await Rental.find({ owner: req.user.id }).populate('listing', 'title images').populate('renter', 'name');
    res.json({ asRenter, asOwner });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /me/trades
router.get('/me/trades', auth, async (req, res) => {
  try {
    const proposals = await TradeProposal.find({
      $or: [{ proposer: req.user.id }, { receiver: req.user.id }]
    })
    .populate('listing', 'title images')
    .populate('offeredListing', 'title images')
    .populate('proposer', 'name')
    .populate('receiver', 'name')
    .sort({ createdAt: -1 });
    res.json(proposals);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
