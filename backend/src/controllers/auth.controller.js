const authService = require('../services/auth.service');

const register = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.register({ email, password });
        res.status(201).json(result);
    } catch (error) {
        // Pass to error handler
        next(error);
    }
};

const login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const result = await authService.login({ email, password });
        res.json(result);
    } catch (error) {
        // Pass to error handler
        next(error);
    }
};

const me = async (req, res) => {
    res.json({ user: { id: req.user._id, email: req.user.email, role: req.user.role } });
};

module.exports = { register, login, me };
