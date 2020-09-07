const {check, validationResult} = require('express-validator');

exports.validator = (method) => {
    switch (method) {
        case 'create': {
            return [
                check('caption', 'Caption is required').notEmpty(),
                check('rate', 'Rate is required').notEmpty(),
                check('model', 'Model is required').notEmpty(),
                check('kilometer', 'kilometer is required').notEmpty(),
                check('additionalInfo', 'AdditionalInfo is required').notEmpty(),
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