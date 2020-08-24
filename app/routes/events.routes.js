const auth = require('../middleware/auth.js');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
const eventsValidator = require('../validators/events-validator');
var eventsConfig = config.events;
var storage = multer.diskStorage({
    destination: eventsConfig.imageUploadPath,
    filename: function (req, file, cb) {
        cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
    }
});
var imageUpload = multer({ storage: storage });

module.exports = (app) => {
    const events = require('../controllers/events.controller');
    app.post('/admin/events/create', auth,imageUpload.single('images'), events.create);
    app.get('/admin/events/list', auth, events.list);
    app.get('/admin/events/:id/detail', auth, events.detail);
    app.patch('/admin/events/:id/update', auth,imageUpload.single('images'), events.update);
    app.delete('/admin/events/:id/delete', auth, events.delete);

};