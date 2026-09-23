const { validationResult } = require('express-validator');

// Reusable validation handler
exports.validateRequest = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        const extractedErrors = [];
        errors.array().map(err => extractedErrors.push({ [err.path]: err.msg }));

        return res.status(422).json({
            success: false,
            message: "Validation Failed",
            errors: extractedErrors
        });
    }

    next();
};
