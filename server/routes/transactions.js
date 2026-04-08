const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const Item = require('../models/Item');
const User = require('../models/User');
const auth = require('../middleware/auth');

// POST /create
router.post('/create', auth, async (req, res) => {
    const { itemID, type, startDate, endDate } = req.body;

    try {
        const item = await Item.findById(itemID);
        if (!item) return res.status(404).json({ msg: 'Item not found' });
        if (item.currentState !== 'Available') return res.status(400).json({ msg: 'Item is not available' });

        const transaction = new Transaction({
            itemID,
            requesterID: req.user.id,
            ownerID: item.ownerID,
            type,
            startDate,
            endDate
        });

        item.currentState = 'PendingTrade';
        await item.save();
        await transaction.save();

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /:id/accept
router.put('/:id/accept', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
        if (transaction.ownerID.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        transaction.status = 'Accepted';
        await transaction.save();

        const item = await Item.findById(transaction.itemID);
        item.currentState = (transaction.type === 'Rent') ? 'Rented' : 'Traded';
        await item.save();

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /:id/reject
router.put('/:id/reject', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
        if (transaction.ownerID.toString() !== req.user.id) return res.status(401).json({ msg: 'Not authorized' });

        transaction.status = 'Rejected';
        await transaction.save();

        const item = await Item.findById(transaction.itemID);
        item.currentState = 'Available';
        await item.save();

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /:id/complete
router.put('/:id/complete', auth, async (req, res) => {
    try {
        const transaction = await Transaction.findById(req.params.id);
        if (!transaction) return res.status(404).json({ msg: 'Transaction not found' });
        
        // Either party can mark as complete? Usually the owner.
        if (transaction.ownerID.toString() !== req.user.id && transaction.requesterID.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'Not authorized' });
        }

        transaction.status = 'Completed';
        await transaction.save();

        // Update item state - if trade, remains traded (unavailable), if rent, back to available
        const item = await Item.findById(transaction.itemID);
        if (transaction.type === 'Rent') {
            item.currentState = 'Available';
        } else {
            item.currentState = 'Traded'; // or Unavailable
        }
        await item.save();

        // Update reputation scores
        const owner = await User.findById(transaction.ownerID);
        const requester = await User.findById(transaction.requesterID);
        owner.reputationScore += 1;
        requester.reputationScore += 1;
        await owner.save();
        await requester.save();

        res.json(transaction);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /my
router.get('/my', auth, async (req, res) => {
    try {
        const transactions = await Transaction.find({
            $or: [{ requesterID: req.user.id }, { ownerID: req.user.id }]
        }).populate('itemID').populate('requesterID', 'username').populate('ownerID', 'username');
        res.json(transactions);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
