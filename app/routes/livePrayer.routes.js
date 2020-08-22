const auth = require('../middleware/auth.js');
const livePrayerValidator = require('../validators/livePrayer-validator');
// var config = require('../../config/app.config.js');

// var livePrayerConfig = config.livePrayers;
// var storage = multer.diskStorage({
//     destination: livePrayerConfig.imageUploadPath,
//     filename: function (req, file, cb) {
//         cb(null, file.fieldname + '-' + Date.now() + "." + mime.extension(file.mimetype))
//     }
// });

// var imageUpload = multer({ storage: storage });
module.exports = (app) => {
    const livePrayer = require('../controllers/livePrayer.controller');
    // app.post('/admin/livePrayer/create',auth,livePrayer.validator('create'),auth,imageUpload.single('image'),livePrayer.create)
    app.post('/admin/livePrayer/create',auth,livePrayerValidator.validator('create'),livePrayer.create)
    app.get('/admin/livePrayer/list', auth, livePrayer.list);
    app.get('/admin/livePrayer/:id/detail', auth, livePrayer.detail);
    app.patch('/admin/livePrayer/:id/update', auth, livePrayer.update);
    app.delete('/admin/livePrayer/:id/delete', auth, livePrayer.delete);

};