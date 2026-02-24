const jwt = require('jsonwebtoken');
const User = require('../models/User.model');

const generateToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });
};

const register = async ({ email, password }) => {
    const existing = await User.findOne({ email });
    if (existing) {
        const err = new Error('Cet email est déjà utilisé');
        err.statusCode = 409;
        throw err;
    }

    const user = await User.create({ email, password });
    const token = generateToken(user._id);

    return {
        token,
        user: { id: user._id, email: user.email, role: user.role },
    };
};

const login = async ({ email, password }) => {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
        const err = new Error('Email ou mot de passe incorrect');
        err.statusCode = 401;
        throw err;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        const err = new Error('Email ou mot de passe incorrect');
        err.statusCode = 401;
        throw err;
    }

    const token = generateToken(user._id);

    return {
        token,
        user: { id: user._id, email: user.email, role: user.role },
    };
};

module.exports = { register, login, generateToken };
