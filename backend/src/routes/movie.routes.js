const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { getMovies, getMovie, createMovie, updateMovie, deleteMovie, getComments, addComment, deleteComment } = require('../controllers/movie.controller');
const authMiddleware = require('../middleware/auth.middleware');
const requireRole = require('../middleware/role.middleware');
const { movieValidator, validate } = require('../validators/movie.validator');

// Multer config for image upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    },
});

const fileFilter = (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ext = allowed.test(path.extname(file.originalname).toLowerCase());
    const mime = allowed.test(file.mimetype);
    if (ext && mime) cb(null, true);
    else cb(new Error('Seules les images sont autorisées'));
};

const upload = multer({ storage, fileFilter, limits: { fileSize: 5 * 1024 * 1024 } });

// Public routes
router.get('/', getMovies);
router.get('/:id', getMovie);
router.get('/:id/comments', getComments);

// Authenticated routes
router.post('/:id/comments', authMiddleware, addComment);
router.delete('/comments/:commentId', authMiddleware, deleteComment);

// Admin routes
router.post('/', authMiddleware, requireRole('ADMIN'), upload.single('poster'), createMovie);
router.put('/:id', authMiddleware, requireRole('ADMIN'), upload.single('poster'), updateMovie);
router.delete('/:id', authMiddleware, requireRole('ADMIN'), deleteMovie);

module.exports = router;
