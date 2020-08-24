const auth = require('../middleware/auth.js');
const charitiesValidator = require('../validators/charities-validator');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var charityConfig = config.charity;

var storage = multer.diskStorage({
    destination: charityConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});

var charityFileUpload = multer({ storage: storage });
module.exports = (app) => {
    const charities = require('../controllers/charities.controller');
    app.get('/admin/charities/list',auth,charities.list);
    // app.post('/admin/charities/add',auth, charitiesValidator.validator('create'),feedFileUpload.fields([{ name: 'image'}]), charities.add);
    // app.post('/admin/charities/add',auth, feedFileUpload.fields([{ name: 'image'}]), charities.add);
    app.post('/admin/charities/add',auth, charityFileUpload.single('image'), charities.add);
    app.delete('/admin/charities/:id/delete',auth, charities.delete);
    app.patch('/admin/charities/:id/update',auth,charityFileUpload.single('image'), charities.update);
    app.get('/admin/charities/:id/detail',auth, charities.details);
};