const { body, validationResult } = require('express-validator');

const registerValidator = [
    body('email')
        .isEmail()
        .withMessage('Email invalide')
        .normalizeEmail(),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Le mot de passe doit contenir au moins 8 caractères')
        .matches(/[A-Z]/)
        .withMessage('Le mot de passe doit contenir au moins une majuscule')
        .matches(/[a-z]/)
        .withMessage('Le mot de passe doit contenir au moins une minuscule')
        .matches(/[0-9]/)
        .withMessage('Le mot de passe doit contenir au moins un chiffre')
        .matches(/[!@#$%^&*()\-_=+\[\]{};:'",.<>/?\\|]/)
        .withMessage('Le mot de passe doit contenir au moins un caractère spécial'),
    body('confirmPassword')
        .custom((value, { req }) => {
            if (value !== req.body.password) {
                throw new Error('Les mots de passe ne correspondent pas');
            }
            return true;
        }),
];

const loginValidator = [
    body('email').isEmail().withMessage('Email invalide').normalizeEmail(),
    body('password').notEmpty().withMessage('Mot de passe requis'),
];

const validate = (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        return next();
    } catch (err) {
        console.error('[validate] error:', err.stack);
        return next(err);
    }
};

module.exports = { registerValidator, loginValidator, validate };
