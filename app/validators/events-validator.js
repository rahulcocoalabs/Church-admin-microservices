const {check, validationResult} = require('express-validator');

exports.validator = (method) => {
    switch (method) {
        case 'create': {
            return [
                check('name', 'Title is required').notEmpty(),
                check('detail', 'Description is required').notEmpty(),
                check('venue', 'Venue is required').notEmpty(),
                check('entryFees', 'Entry Fees is required').notEmpty(),
                check('visitors', 'Visitors is required').notEmpty(),
                check('exhibitors', 'Exhibitors is required').notEmpty(),
                check('categoryId', 'Category Id is required').notEmpty(),
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