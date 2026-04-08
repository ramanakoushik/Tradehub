const express = require('express');
const router = express.Router();
const Item = require('../models/Item');
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// POST /create
router.post('/create', auth, async (req, res) => {
  const { name, category, condition, type, pricePerDay, geoPosition, images } = req.body;

  try {
    const newItem = new Item({
      ownerID: req.user.id,
      name,
      category,
      condition,
      type,
      pricePerDay,
      geoPosition,
      images
    });

    const item = await newItem.save();
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /search
router.get('/search', async (req, res) => {
  const { category, condition, lat, lng, radius, type } = req.query;
  const filter = {};

  if (category) filter.category = category;
  if (condition) filter.condition = condition;
  if (type) filter.type = type;
  filter.currentState = 'Available';

  if (lat && lng && radius) {
    filter.geoPosition = {
      $near: {
        $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
        $maxDistance: parseInt(radius) // Distance in meters
      }
    };
  }

  try {
    const items = await Item.find(filter).populate('ownerID', 'username reputationScore');
    res.json(items);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET /:id
router.get('/:id', async (req, res) => {
  try {
    const item = await Item.findById(req.params.id).populate('ownerID', 'username reputationScore');
    if (!item) return res.status(404).json({ msg: 'Item not found' });
    res.json(item);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// PUT /:id/state
router.put('/:id/state', auth, async (req, res) => {
    const { newState } = req.body;
    const validTransitions = {
        'Available': ['PendingTrade', 'Unavailable'],
        'PendingTrade': ['Available', 'Rented', 'Traded'],
        'Rented': ['Available'],
        'Traded': ['Unavailable'],
        'Unavailable': ['Available']
    };

    try {
        const item = await Item.findById(req.params.id);
        if (!item) return res.status(404).json({ msg: 'Item not found' });
        
        if (item.ownerID.toString() !== req.user.id) {
            return res.status(401).json({ msg: 'User not authorized' });
        }

        if (!validTransitions[item.currentState].includes(newState)) {
            return res.status(400).json({ msg: `Invalid state transition from ${item.currentState} to ${newState}` });
        }

        item.currentState = newState;
        await item.save();
        res.json(item);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /recommendations/:userId
router.get('/recommendations/:userId', async (req, res) => {
    try {
        // Fetch last 5 completed transactions for the user
        const lastTransactions = await Transaction.find({ requesterID: req.params.userId, status: 'Completed' })
            .sort({ createdAt: -1 })
            .limit(5)
            .populate('itemID');

        const categories = [...new Set(lastTransactions.map(t => t.itemID.category))];

        // Find available items in those categories
        const recommendations = await Item.find({
            category: { $in: categories },
            currentState: 'Available',
            ownerID: { $ne: req.params.userId }
        }).limit(10).populate('ownerID', 'username reputationScore');

        res.json(recommendations);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
