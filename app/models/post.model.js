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

const PostSchema = mongoose.Schema({
    contentType: String,
    userId: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    name: String,
    detail: String,
    image: String,
    timing: Array,
    venue: String,
    entryFees: Array,
    participants: Array, 
    categoryAndType: String,
    caption: String,
    images: Array,
    rate: String,
    model: String,
    kilometer: String,
    additionalInfo: String,
    postContent: String,
    fileName: String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);

module.exports = mongoose.model('Post', PostSchema, 'Posts');