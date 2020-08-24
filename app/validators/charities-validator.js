const {check, validationResult} = require('express-validator');

exports.validator = (method) => {
    switch (method) {
        case 'create': {
            return [
                check('title', 'Title is required').notEmpty(),
                check('amount', 'Amount is required').notEmpty(),
                check('about', 'About is required').notEmpty(),
                check('organisation', 'Organisation is required').notEmpty(),
                check('phone', 'Phone is required').notEmpty(),
                (req, res, next) => {
                    const errors = validationResult(req);
                    if (!errors.isEmpty()) {
                        return res.status(422).json({
                            success: 0,
                            errors: errors.array()
                        })
                    }
                    next()
                }
            ]
        }
    }
}