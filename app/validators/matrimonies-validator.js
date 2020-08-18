const {check, validationResult} = require('express-validator');

exports.validator = (method) => {
    switch (method) {
        case 'create': {
            return [
                check('name', 'Name is required').notEmpty(),
                check('gender', 'Gender is required').notEmpty(),
                check('age', 'Age is required').notEmpty(),
                check('height', 'Height is required').notEmpty(),
                check('weight', 'Weight is required').notEmpty(),
                check('education', 'Education is required').notEmpty(),
                check('profession', 'Profession is required').notEmpty(),
                check('address', 'Address is required').notEmpty(),
                check('nativePlace', 'Native place is required').notEmpty(),
                check('workPlace', 'Work place is required').notEmpty(),
                check('preferredgroomOrBrideAge', 'PreferredgroomOrBrideAge is required').notEmpty(),
                check('preferredgroomOrBrideHeight', 'PreferredgroomOrBrideAge is required').notEmpty(),
                
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
        case 'getMatches': {
            return [
                check('matrimonyId', 'MatrimonyId is required').notEmpty(),
                check('age', 'Age is required').notEmpty(),
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
        case 'accept': {
            return [
                check('userMatrimonyId', 'MatrimonyId of user is required').notEmpty(),
                check('senderMatrimonyId', 'MatrimonyId of sender is required').notEmpty(),
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
        case 'reject': {
            return [
                check('userMatrimonyId', 'MatrimonyId of user is required').notEmpty(),
                check('senderMatrimonyId', 'MatrimonyId of sender is required').notEmpty(),
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
        case 'sendRequest': {
            return [
                check('userMatrimonyId', 'MatrimonyId of user is required').notEmpty(),
                check('senderMatrimonyId', 'MatrimonyId of sender is required').notEmpty(),
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