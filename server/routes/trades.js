const express = require('express');
const router = express.Router();
const TradeProposal = require('../models/TradeProposal');
const Listing = require('../models/Listing');
const Notification = require('../models/Notification');
const auth = require('../middleware/auth');

// POST / — create trade proposal
router.post('/', auth, async (req, res) => {
  const { listingId, offeredListingId, receiverId, conversationId } = req.body;
  try {
    const proposal = new TradeProposal({
      listing: listingId,
      offeredListing: offeredListingId,
      proposer: req.user.id,
      receiver: receiverId,
      conversation: conversationId
    });
    await proposal.save();

    const populated = await TradeProposal.findById(proposal._id)
      .populate('listing', 'title images')
      .populate('offeredListing', 'title images')
      .populate('proposer', 'name avatar');

    // Notify receiver
    const notif = new Notification({
      recipient: receiverId,
      type: 'trade_proposal',
      message: `You received a trade proposal!`,
      link: `/messages`
    });
    await notif.save();

    const io = req.app.get('io');
    io.to(receiverId.toString()).emit('new_notification', notif);

    res.json(populated);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PATCH /:id — accept or decline
router.patch('/:id', auth, async (req, res) => {
  try {
    const proposal = await TradeProposal.findById(req.params.id);
    if (!proposal) return res.status(404).json({ msg: 'Proposal not found' });
    if (proposal.receiver.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

    proposal.status = req.body.status;
    await proposal.save();

    const io = req.app.get('io');

    if (req.body.status === 'accepted') {
      // Mark both listings as traded
      await Listing.findByIdAndUpdate(proposal.listing, { status: 'traded' });
      await Listing.findByIdAndUpdate(proposal.offeredListing, { status: 'traded' });
      io.emit('listing_updated', { listingId: proposal.listing, status: 'traded' });
      io.emit('listing_updated', { listingId: proposal.offeredListing, status: 'traded' });

      const notif = new Notification({
        recipient: proposal.proposer,
        type: 'trade_accepted',
        message: 'Your trade proposal was accepted!',
        link: '/dashboard'
      });
      await notif.save();
      io.to(proposal.proposer.toString()).emit('new_notification', notif);
    } else {
      const notif = new Notification({
        recipient: proposal.proposer,
        type: 'trade_declined',
        message: 'Your trade proposal was declined.',
        link: '/dashboard'
      });
      await notif.save();
      io.to(proposal.proposer.toString()).emit('new_notification', notif);
    }

    res.json(proposal);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
