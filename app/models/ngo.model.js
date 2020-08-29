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

const NgosSchema = mongoose.Schema({
    churchId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Church'
    },
    ngoName: String,
    address: String,
    caption: String,
    phone: String,
    about: String,
    images: Array,
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);
module.exports = mongoose.model('Ngo', NgosSchema, 'Ngos');