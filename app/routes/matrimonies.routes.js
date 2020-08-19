const auth = require('../middleware/auth.js');
const matrimonyValidator = require('../validators/matrimonies-validator');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var matrimonyConfig = config.matrimony;
var storage = multer.diskStorage({
    destination: matrimonyConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});

var imageUpload = multer({ storage: storage });
module.exports = (app) => {
    const matrimony = require('../controllers/matrimonies.controller');
    app.post('/admin/matrimonies', auth, matrimonyValidator.validator('create'), matrimony.create);
    // app.get('/matrimonies/:id/get-profile', auth, matrimony.getProfile);
    // app.patch('/matrimonies/:id/edit-profile', auth, imageUpload.single('image'), matrimony.editProfile);
    // app.get('/matrimonies/matches', auth, matrimonyValidator.validator('getMatches'), matrimony.getMatches);
    // app.post('/matrimonies/send-request', auth, matrimonyValidator.validator('sendRequest'), matrimony.sendRequest);
    // app.get('/matrimonies/my-requests', auth, matrimony.myRequests);
    // app.patch('/matrimonies/request/accept', auth, matrimonyValidator.validator('accept'), matrimony.acceptRequest);
    // app.patch('/matrimonies/request/ignore', auth, matrimonyValidator.validator('reject'), matrimony.ignoreRequest);
};