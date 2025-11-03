const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const { uploadToCloudinary, deleteFromCloudinary } = require('../utils/cloudinary');
const Manga = require('../models/Manga');
const { check, validationResult } = require('express-validator');

// Get all manga
router.get('/', async (req, res) => {
    try {
        const manga = await Manga.find()
            .sort({ createdAt: -1 });
        res.json(manga);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get manga by id
router.get('/:id', async (req, res) => {
    try {
        const manga = await Manga.findById(req.params.id);
        if (!manga) {
            return res.status(404).json({ message: 'Manga not found' });
        }
        res.json(manga);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Manga not found' });
        }
        res.status(500).send('Server Error');
    }
});

// Create new manga (Admin only)
router.post('/', [
    auth,
    upload.single('image'),
    [
        check('title', 'Title is required').not().isEmpty(),
        check('author', 'Author is required').not().isEmpty(),
        check('price', 'Price is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty()
    ]
], async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            title,
            author,
            description,
            price,
            originalPrice,
            image,
            volumes,
            genre,
            stock,
            badges,
            isNewRelease
        } = req.body;

        let imageUrl = '';
        if (req.file) {
            // Convert buffer to base64
            const base64Image = req.file.buffer.toString('base64');
            const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;
            
            // Upload to Cloudinary
            const uploadResult = await uploadToCloudinary(dataURI, 'manga');
            imageUrl = uploadResult.url;
        }

        const manga = new Manga({
            title,
            author,
            description,
            price,
            originalPrice,
            image: imageUrl || image, // Use uploaded image URL or provided URL
            volumes,
            genre,
            stock,
            badges,
            isNewRelease
        });

        await manga.save();
        res.json(manga);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Update manga (Admin only)
router.put('/:id', auth, async (req, res) => {
    try {
        const manga = await Manga.findById(req.params.id);
        if (!manga) {
            return res.status(404).json({ message: 'Manga not found' });
        }

        const updatedManga = await Manga.findByIdAndUpdate(
            req.params.id,
            { $set: req.body },
            { new: true }
        );

        res.json(updatedManga);
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Manga not found' });
        }
        res.status(500).send('Server Error');
    }
});

// Delete manga (Admin only)
router.delete('/:id', auth, async (req, res) => {
    try {
        const manga = await Manga.findById(req.params.id);
        if (!manga) {
            return res.status(404).json({ message: 'Manga not found' });
        }

        await manga.remove();
        res.json({ message: 'Manga removed' });
    } catch (err) {
        console.error(err.message);
        if (err.kind === 'ObjectId') {
            return res.status(404).json({ message: 'Manga not found' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;