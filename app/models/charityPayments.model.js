const mongoose = require('mongoose');

const CharityPaymentSchema = mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    charityId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Charity'
    },
    orderId: String,
    transactionId: String,
    amount: String,
    paidStatus: Boolean,
    paidOn: Date,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

});
module.exports = mongoose.model('CharityPayment', CharityPaymentSchema, 'CharityPayments');