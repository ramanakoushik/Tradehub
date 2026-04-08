const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Item = require('../models/Item');
const auth = require('../middleware/auth');

// GET /profile/:id
router.get('/profile/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');
        if (!user) return res.status(404).json({ msg: 'User not found' });

        const items = await Item.find({ ownerID: req.params.id });
        res.json({ user, items });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// PUT /profile
router.put('/profile', auth, async (req, res) => {
    const { username, location } = req.body;
    try {
        let user = await User.findById(req.user.id);
        if (username) user.username = username;
        if (location) user.location = location;
        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// GET /reputation/:id
router.get('/reputation/:id', async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('reputationScore');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
