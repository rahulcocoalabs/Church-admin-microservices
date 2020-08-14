const mongoose = require('mongoose');

function transform(ret) {
    ret.id = ret._id;
    delete ret._id;
    delete ret.status;
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
const UrogulfSchema = mongoose.Schema({
    location: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UrogulfLocation'
    },
    nearbyLocation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'UrogulfNearby'
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    message: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);
module.exports = mongoose.model('Urogulf', UrogulfSchema, 'Urogulfs');