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
    const bloodDonation = require('../controllers/bloodDonation.controller');
    app.get('/admin/blooddonation/list',auth,bloodDonation.list);
    app.post('/admin/blooddonation/create',auth,bloodDonation.create);
    app.post('/admin/blooddonation/update',auth,bloodDonation.update);
    app.post('/admin/blooddonation/delete',auth,bloodDonation.delete);
   
};