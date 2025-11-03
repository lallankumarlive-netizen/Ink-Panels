const router = require('express').Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user profile
router.get('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update user profile
router.put('/me', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const { username, email } = req.body;
        user.username = username || user.username;
        user.email = email || user.email;

        await user.save();
        res.json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Add manga to wishlist
router.post('/wishlist/:mangaId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (!user.wishlist.includes(req.params.mangaId)) {
            user.wishlist.push(req.params.mangaId);
            await user.save();
        }

        res.json(user.wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Remove manga from wishlist
router.delete('/wishlist/:mangaId', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.wishlist = user.wishlist.filter(
            id => id.toString() !== req.params.mangaId
        );
        await user.save();

        res.json(user.wishlist);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;