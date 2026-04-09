const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST / — submit review
router.post('/', auth, async (req, res) => {
  const { revieweeId, listingId, rating, comment } = req.body;
  try {
    const review = new Review({
      reviewer: req.user.id,
      reviewee: revieweeId,
      listing: listingId,
      rating,
      comment: comment || ''
    });
    await review.save();

    // Update reviewee's average rating
    const reviews = await Review.find({ reviewee: revieweeId });
    const avg = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await User.findByIdAndUpdate(revieweeId, { rating: Math.round(avg * 10) / 10, totalRatings: reviews.length });

    const populated = await Review.findById(review._id).populate('reviewer', 'name avatar');
    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /user/:id — reviews for a user
router.get('/user/:id', async (req, res) => {
  try {
    const reviews = await Review.find({ reviewee: req.params.id })
      .populate('reviewer', 'name avatar')
      .populate('listing', 'title')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
