const {check, validationResult} = require('express-validator');

exports.validator = (method) => {
    switch (method) {
        case 'signUp': {
            return [
                check('name', 'Name is required').notEmpty(),
                check('email', 'Email is required').isEmail().notEmpty(),
                check('phone', 'Phone is required').notEmpty(),
                check('address', 'Address is required').notEmpty(),
                check('church', 'Church is required').notEmpty(),
                check('parish', 'Parish is required').notEmpty(),
                check('parishWard', 'Parish ward is required').notEmpty(),
                check('bloodGroup', 'Blood group is required').notEmpty(),
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
        case 'verifyOtp': {
            return [
                check('phone', 'Phone is required').notEmpty(), 
                check('otp', 'OTP is required').notEmpty(),
                check('apiToken', 'Api token is required').notEmpty(),
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