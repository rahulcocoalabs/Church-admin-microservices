const mongoose = require('mongoose');

function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
    delete ret.tsCreatedAt;
    delete ret.tsModifiedAt;
}
var options = {
    toObject: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    },
    toJSON: {
        virtuals: true,
        transform: function (doc, ret) {
            transform(ret);
        }
    }
};

const OutgoingRequestSchema = mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    userMatrimonyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Matrimony'},
    senderMatrimonyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Matrimony'},
    isAccepted: Boolean,
    isRejected: Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);
module.exports = mongoose.model('OutgoingRequest', OutgoingRequestSchema, 'OutgoingRequests');