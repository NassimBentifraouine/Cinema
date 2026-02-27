const userService = require('../services/user.service');
const movieService = require('../services/movie.service');

const addFavorite = async (req, res) => {
    try {
        const { movieId } = req.params;
        const favorites = await userService.addFavorite(req.user._id, movieId);
        res.json({ favorites });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const removeFavorite = async (req, res) => {
    try {
        const { movieId } = req.params;
        const favorites = await userService.removeFavorite(req.user._id, movieId);
        res.json({ favorites });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getFavorites = async (req, res) => {
    try {
        const favorites = await userService.getFavorites(req.user._id);
        res.json({ favorites });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const rateMovie = async (req, res) => {
    try {
        const { movieId } = req.params;
        const { score } = req.body;
        if (!score || score < 1 || score > 10) {
            return res.status(400).json({ message: 'La note doit être entre 1 et 10' });
        }
        const rating = await userService.rateMovie(req.user._id, movieId, score);
        res.json({ rating });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getRatings = async (req, res) => {
    try {
        const ratings = await userService.getRatings(req.user._id);
        res.json({ ratings });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getHistory = async (req, res) => {
    try {
        const history = await userService.getHistory(req.user._id);
        res.json({ history });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const recordHistory = async (req, res) => {
    try {
        const { movieId } = req.params;
        await userService.addHistory(req.user._id, movieId);
        res.json({ ok: true });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const deleteRating = async (req, res) => {
    try {
        const { movieId } = req.params;
        await userService.deleteRating(req.user._id, movieId);
        res.json({ message: 'Note supprimée' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const user = await userService.updateProfile(req.user._id, req.body);
        res.json({ message: 'Profil mis à jour', user });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = { addFavorite, removeFavorite, getFavorites, rateMovie, getRatings, getHistory, recordHistory, deleteRating, updateProfile };
