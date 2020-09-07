const auth = require('../middleware/auth.js');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var pastersConfig = config.pasters;
const accountsValidator = require('../validators/accounts-validator');
var storage = multer.diskStorage({
    destination: pastersConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});
var pasterImageUpload = multer({ storage: storage });
module.exports = (app) => {
    const accounts = require('../controllers/accounts.controller.js');
    app.post('/admin/accounts/sign-up', accountsValidator.validator('signUp'), accounts.signUp);
    app.post('/admin/accounts/login',accountsValidator.validator('login'), accounts.login);
    app.get('/admin/accounts/donation',auth, accounts.donationList);
    app.post('/admin/accounts/resetpassword', accounts.reset);
    app.post('/admin/accounts/addnewpassword', accounts.resetPassword);

    app.get('/admin/accounts/paster-profile',auth, accounts.getPasterProfile);
    app.patch('/admin/accounts/paster-profile',auth,pasterImageUpload.single('image'),  accounts.updatePasterProfile);
    app.get('/admin/accounts/admin-profile',auth, accounts.getAdminProfile);
    app.patch('/admin/accounts/admin-profile',auth, accounts.updateAdminProfile);
    app.get('/admin/accounts/urogulf-profile',auth, accounts.getUrogulfProfile);
    app.patch('/admin/accounts/urogulf-profile',auth, accounts.updateUrogulfProfile);

    app.get('/admin/accounts/dashboard-details',auth, accounts.getDashboardData);
};


