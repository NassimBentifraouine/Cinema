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

const updateProfile = async (userId, data) => {
    const { email, currentPassword, newPassword } = data;
    const user = await User.findById(userId).select('+password');
    if (!user) throw new Error('User not found');

    if (currentPassword) {
        const isMatch = await user.comparePassword(currentPassword);
        if (!isMatch) {
            const err = new Error('Mot de passe actuel incorrect');
            err.statusCode = 400;
            throw err;
        }
    } else if (newPassword || (email && email !== user.email)) {
        const err = new Error('Mot de passe actuel requis pour modifier ces informations');
        err.statusCode = 400;
        throw err;
    }

    if (email && email !== user.email) {
        const existing = await User.findOne({ email });
        if (existing) {
            const err = new Error('Cet email est déjà utilisé');
            err.statusCode = 400;
            throw err;
        }
        user.email = email;
    }

    if (newPassword) {
        if (newPassword.length < 8) {
            const err = new Error('Le nouveau mot de passe doit faire au moins 8 caractères');
            err.statusCode = 400;
            throw err;
        }
        user.password = newPassword;
    }

    await user.save();
    return User.findById(userId);
};

module.exports = { addFavorite, removeFavorite, getFavorites, rateMovie, getRatings, deleteRating, addHistory, getHistory, updateProfile };
