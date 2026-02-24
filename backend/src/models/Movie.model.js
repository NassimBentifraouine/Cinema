const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
    imdbId: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    title: {
        type: String,
        required: true,
        trim: true,
    },
    year: {
        type: String,
        default: '',
    },
    genre: {
        type: [String],
        default: [],
    },
    plot: {
        type: String,
        default: '',
    },
    poster: {
        type: String,
        default: '',
    },
    director: {
        type: String,
        default: '',
    },
    actors: {
        type: String,
        default: '',
    },
    runtime: {
        type: String,
        default: '',
    },
    language: {
        type: String,
        default: '',
    },
    imdbRating: {
        type: Number,
        default: 0,
    },
    imdbVotes: {
        type: String,
        default: '',
    },
    categories: {
        type: [String],
        default: [],
    },
    // Custom poster uploaded by admin
    customPoster: {
        type: String,
        default: '',
    },
    cachedAt: {
        type: Date,
        default: Date.now,
    },
});

// Text index for search
movieSchema.index({ title: 'text', plot: 'text' });

module.exports = mongoose.model('Movie', movieSchema);
