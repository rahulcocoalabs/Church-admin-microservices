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
    postType: String,
    fileName: String,
    textContent: String,
    textStyle: Object,
    likesCount: Number,
    likes: [{
        likeStatus: Boolean,
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    }],
    sermonsCreatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'Paster'},
    feedCreatedBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'}, 
    isApproved : Boolean,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);

module.exports = mongoose.model('Post', PostSchema, 'Posts');