const auth = require('../middleware/auth.js');
const buyorsellValidator = require('../validators/buyorsell-validator');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var buyorsellConfig = config.buyorsell;
var storage = multer.diskStorage({
    destination: buyorsellConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});

var imageUpload = multer({ storage: storage });
module.exports = (app) => {
    const buyorsell = require('../controllers/buyorsell.controller');
    app.post('/admin/buyorsell/create', auth, imageUpload.fields([{ name: 'images' }]), buyorsellValidator.validator('create'), buyorsell.create);
    app.get('/admin/buyorsell/list', auth, buyorsell.list);
    app.get('/admin/buyorsell/:id/detail', auth, buyorsell.detail);
};