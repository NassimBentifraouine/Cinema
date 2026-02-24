const User = require('../models/User.model');
const Movie = require('../models/Movie.model');
const Rating = require('../models/Rating.model');
const History = require('../models/History.model');

const addFavorite = async (userId, movieId) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $addToSet: { favorites: movieId } },
        { new: true }
    ).populate('favorites');
    return user.favorites;
};

const removeFavorite = async (userId, movieId) => {
    const user = await User.findByIdAndUpdate(
        userId,
        { $pull: { favorites: movieId } },
        { new: true }
    ).populate('favorites');
    return user.favorites;
};

const getFavorites = async (userId) => {
    const user = await User.findById(userId).populate('favorites');
    return user ? user.favorites : [];
};

const rateMovie = async (userId, movieId, score) => {
    const rating = await Rating.findOneAndUpdate(
        { user: userId, movie: movieId },
        { score, createdAt: new Date() },
        { upsert: true, new: true }
    );
    return rating;
};

const getRatings = async (userId) => {
    return Rating.find({ user: userId }).populate('movie');
};

const addHistory = async (userId, movieId) => {
    await History.findOneAndUpdate(
        { user: userId, movie: movieId },
        { visitedAt: new Date() },
        { upsert: true }
    );
};

const getHistory = async (userId) => {
    return History.find({ user: userId })
        .sort({ visitedAt: -1 })
        .limit(50)
        .populate('movie');
};

const deleteRating = async (userId, movieId) => {
    return Rating.findOneAndDelete({ user: userId, movie: movieId });
};

module.exports = { addFavorite, removeFavorite, getFavorites, rateMovie, getRatings, deleteRating, addHistory, getHistory };
