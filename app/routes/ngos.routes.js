const auth = require('../middleware/auth.js');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var ngoConfig = config.ngos;

var storage = multer.diskStorage({
    destination: ngoConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});
var ngoFileUpload = multer({ storage: storage });

module.exports = (app) => {
    const ngos = require('../controllers/ngos.controller');
    app.post('/admin/ngos/add',auth,ngoFileUpload.single('image'), ngos.add);
    app.get('/admin/ngos/details',auth, ngos.details);
    app.patch('/admin/ngos/update',auth,ngoFileUpload.single('image'), ngos.update);
};