const User = require('../models/User.model');
const Movie = require('../models/Movie.model');
const Rating = require('../models/Rating.model');
const History = require('../models/History.model');
const mongoose = require('mongoose');

const getMovieObjectId = async (id) => {
    if (mongoose.Types.ObjectId.isValid(id)) return id;
    const movie = await Movie.findOne({ imdbId: id });
    if (!movie) throw new Error('Movie not found');
    return movie._id;
};

const addFavorite = async (userId, movieId) => {
    const internalId = await getMovieObjectId(movieId);
    const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favorites: internalId } },
        { new: true }
    ).populate('favorites');
    return user.favorites;
};

const removeFavorite = async (userId, movieId) => {
    const internalId = await getMovieObjectId(movieId);
    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { favorites: internalId } },
        { new: true }
    ).populate('favorites');
    return user.favorites;
};

const getFavorites = async (userId) => {
    const user = await User.findById(userId).populate('favorites');
    return user ? user.favorites : [];
};

const rateMovie = async (userId, movieId, score) => {
    const internalId = await getMovieObjectId(movieId);
    const rating = await Rating.findOneAndUpdate(
        { user: userId, movie: internalId },
        { score, createdAt: new Date() },
        { upsert: true, new: true }
    );
    return rating;
};

const getRatings = async (userId) => {
    return Rating.find({ user: userId }).populate('movie');
};

const addHistory = async (userId, movieId) => {
    try {
        const internalId = await getMovieObjectId(movieId);
        await History.findOneAndUpdate(
            { user: userId, movie: internalId },
            { visitedAt: new Date() },
            { upsert: true }
        );
    } catch (err) {
        // Silently ignore history errors for unknown movies
    }
};

const getHistory = async (userId) => {
    return History.find({ user: userId })
        .sort({ visitedAt: -1 })
        .limit(50)
        .populate('movie');
};

const deleteRating = async (userId, movieId) => {
    const internalId = await getMovieObjectId(movieId);
    return Rating.findOneAndDelete({ user: userId, movie: internalId });
};

module.exports = { addFavorite, removeFavorite, getFavorites, rateMovie, getRatings, deleteRating, addHistory, getHistory };
