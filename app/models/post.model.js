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
    churchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Church'
    },
    name: String,
    detail: String,
    image: String,
    timing: Array,
    timings:  [{
        date: Date,
        startTime:String, 
        endTime:String, 
    }],
    venue: String,
    entryFees: Array,
    visitors : String,
    exhibitors : String,
    participants: Array, 
    categoryAndType: String,
    categoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'EventCategory'
    },
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
    feedStatus : String,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);

module.exports = mongoose.model('Post', PostSchema, 'Posts');