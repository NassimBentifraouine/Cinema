const express = require('express');
const router = express.Router();
const { addFavorite, removeFavorite, getFavorites, rateMovie, getRatings, getHistory, recordHistory, deleteRating, updateProfile } = require('../controllers/user.controller');
const authMiddleware = require('../middleware/auth.middleware');

router.use(authMiddleware);

router.post('/favorites/:movieId', addFavorite);
router.delete('/favorites/:movieId', removeFavorite);
router.get('/favorites', getFavorites);

router.post('/ratings/:movieId', rateMovie);
router.get('/ratings', getRatings);
router.delete('/ratings/:movieId', deleteRating);

router.post('/history/:movieId', recordHistory);
router.get('/history', getHistory);

router.put('/profile', updateProfile);

module.exports = router;
