const mongoose = require('mongoose');

const mangaSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    author: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    originalPrice: {
        type: Number,
        min: 0
    },
    image: {
        type: String,
        required: true
    },
    volumes: {
        type: Number,
        required: true,
        min: 1
    },
    genre: [{
        type: String,
        required: true
    }],
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5
    },
    reviewCount: {
        type: Number,
        default: 0
    },
    stock: {
        type: Number,
        required: true,
        min: 0
    },
    badges: [{
        type: String
    }],
    isNewRelease: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Manga', mangaSchema);