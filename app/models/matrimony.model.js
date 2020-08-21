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

const MatrimonySchema = mongoose.Schema({
    name: String,
    gender: String,
    age: String,
    image: String,
    height: String,
    weight: String,
    education: String,
    profession: String,
    address: String,
    nativePlace: String,
    workPlace: String,
    preferredgroomOrBrideAge: String,
    preferredgroomOrBrideHeight: String,
    profileStatus : String,
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    status: Number,
    tsCreatedAt: Number,
    tsModifiedAt: Number

}, options);
module.exports = mongoose.model('Matrimony', MatrimonySchema, 'Matrimonies');