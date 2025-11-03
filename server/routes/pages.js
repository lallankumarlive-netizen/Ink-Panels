const express = require('express');
const path = require('path');
const router = express.Router();

// Serve main page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Serve auth page
router.get('/auth', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/auth.html'));
});

// Handle 404
router.use((req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../public/404.html'));
});

module.exports = router;