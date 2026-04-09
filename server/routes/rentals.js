const express = require('express');
const router = express.Router();
const Rental = require('../models/Rental');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// POST / — create rental
router.post('/', auth, async (req, res) => {
  const { listingId, startDate, endDate } = req.body;
  try {
    const listing = await Listing.findById(listingId);
    if (!listing) return res.status(404).json({ msg: 'Listing not found' });
    if (listing.status !== 'active') return res.status(400).json({ msg: 'Listing not available' });

    const days = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    let totalCost = listing.price * days;
    if (listing.rentPeriod === 'weekly') totalCost = listing.price * Math.ceil(days / 7);
    if (listing.rentPeriod === 'monthly') totalCost = listing.price * Math.ceil(days / 30);

    const rental = new Rental({
      listing: listingId,
      renter: req.user.id,
      owner: listing.seller,
      startDate, endDate, totalCost
    });
    await rental.save();

    listing.status = 'rented';
    await listing.save();

    // Notify owner
    const notif = new Notification({
      recipient: listing.seller,
      type: 'rental_confirmed',
      message: `Your listing "${listing.title}" has been rented!`,
      link: `/dashboard`
    });
    await notif.save();

    const io = req.app.get('io');
    io.to(listing.seller.toString()).emit('new_notification', notif);
    io.emit('listing_updated', { listingId: listing._id, status: 'rented' });

    res.json(rental);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /:id/status
router.patch('/:id/status', auth, async (req, res) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) return res.status(404).json({ msg: 'Rental not found' });
    if (rental.owner.toString() !== req.user.id && rental.renter.toString() !== req.user.id) {
      return res.status(401).json({ msg: 'Not authorized' });
    }

    rental.status = req.body.status;
    await rental.save();

    if (req.body.status === 'completed' || req.body.status === 'cancelled') {
      const listing = await Listing.findById(rental.listing);
      listing.status = 'active';
      await listing.save();
      const io = req.app.get('io');
      io.emit('listing_updated', { listingId: listing._id, status: 'active' });
    }

    res.json(rental);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
