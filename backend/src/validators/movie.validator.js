const { body, validationResult } = require('express-validator');

const movieValidator = [
    body('title').notEmpty().withMessage('Le titre est requis').trim(),
    body('imdbId').notEmpty().withMessage("L'ID IMDb est requis").trim(),
    body('year').optional().isString(),
    body('imdbRating').optional().isFloat({ min: 0, max: 10 }),
];

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    next();
};

module.exports = { movieValidator, validate };
