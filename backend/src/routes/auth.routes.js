const express = require('express');
const router = express.Router();
const { register, login, me } = require('../controllers/auth.controller');
const { registerValidator, loginValidator, validate } = require('../validators/auth.validator');
const authMiddleware = require('../middleware/auth.middleware');

router.post('/register', ...registerValidator, validate, register);
router.post('/login', ...loginValidator, validate, login);
router.get('/me', authMiddleware, me);

module.exports = router;
