const movieService = require('../services/movie.service');
const path = require('path');

const getMovies = async (req, res) => {
    try {
        const { search, genre, minRating, sort, page, limit } = req.query;
        const result = await movieService.getMovies({ search, genre, minRating, sort, page, limit });
        res.json(result);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getMovie = async (req, res) => {
    try {
        const movie = await movieService.getMovieDetail(req.params.id);
        res.json(movie);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const createMovie = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.customPoster = `/uploads/${req.file.filename}`;
        }
        if (data.genre && typeof data.genre === 'string') {
            data.genre = data.genre.split(',').map((g) => g.trim());
        }
        if (data.categories && typeof data.categories === 'string') {
            data.categories = data.categories.split(',').map((c) => c.trim());
        }
        const movie = await movieService.createMovie(data);
        res.status(201).json(movie);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const updateMovie = async (req, res) => {
    try {
        const data = { ...req.body };
        if (req.file) {
            data.customPoster = `/uploads/${req.file.filename}`;
        }
        if (data.genre && typeof data.genre === 'string') {
            data.genre = data.genre.split(',').map((g) => g.trim());
        }
        const movie = await movieService.updateMovie(req.params.id, data);
        res.json(movie);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const deleteMovie = async (req, res) => {
    try {
        await movieService.deleteMovie(req.params.id);
        res.json({ message: 'Film supprimé avec succès' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const getComments = async (req, res) => {
    try {
        const comments = await movieService.getComments(req.params.id);
        res.json(comments);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const addComment = async (req, res) => {
    try {
        const { text } = req.body;
        if (!text || text.trim() === '') {
            return res.status(400).json({ message: 'Le commentaire ne peut pas être vide' });
        }
        const comment = await movieService.addComment(req.user._id, req.params.id, text);
        res.status(201).json(comment);
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

const deleteComment = async (req, res) => {
    try {
        await movieService.deleteComment(req.params.commentId, req.user._id, req.user.role);
        res.json({ message: 'Commentaire supprimé' });
    } catch (error) {
        res.status(error.statusCode || 500).json({ message: error.message });
    }
};

module.exports = { getMovies, getMovie, createMovie, updateMovie, deleteMovie, getComments, addComment, deleteComment };
