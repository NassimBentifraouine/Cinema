const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites, rateMovie, getRatings, getHistory, recordHistory, deleteRating } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

// All user routes require authentication
router.use(authMiddleware);

router.post('/favorites/:movieId', addFavorite);
router.delete('/favorites/:movieId', removeFavorite);
router.get('/favorites', getFavorites);

router.post('/ratings/:movieId', rateMovie);
router.get('/ratings', getRatings);
router.delete('/ratings/:movieId', deleteRating);

router.post('/history/:movieId', recordHistory);
router.get('/history', getHistory);

module.exports = router;
