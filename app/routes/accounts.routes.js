const auth = require('../middleware/auth.js');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var profileConfig = config.users;
const accountsValidator = require('../validators/accounts-validator');
var storage = multer.diskStorage({
    destination: profileConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});
var userImageUpload = multer({ storage: storage });
module.exports = (app) => {
    const accounts = require('../controllers/accounts.controller.js');
    app.post('/accounts/sign-up', accountsValidator.validator('signUp'), accounts.signUp);
    app.post('/accounts/send-otp', accountsValidator.validator('sendOtp'), accounts.sendOtp);
    app.post('/accounts/verify-otp', accountsValidator.validator('verifyOtp'), accounts.verifyOtp);
};


