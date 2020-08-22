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

const LivePrayerSchema = mongoose.Schema({
    title: String,
    date: String,
    time: String,
    churchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Church'
    },
    description: String,
    liveVideoLink: String,
    videoLink: String,
    thumbnailImage: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);
module.exports = mongoose.model('LivePrayer', LivePrayerSchema, 'LivePrayers');