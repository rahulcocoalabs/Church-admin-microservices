const {check, validationResult} = require('express-validator');

exports.validator = (method) => {
    switch (method) {
        case 'updateFeedStatus': {
            return [
                check('feedStatus', 'feedStatus is required').notEmpty(),
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
        case 'login': {
            return [
                // check('phone', 'Phone is required').notEmpty(), 
                check('email', 'Email is required').notEmpty(),
                check('password', 'Password is required').notEmpty(),
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
        case 'sendOtp': {
            return [
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