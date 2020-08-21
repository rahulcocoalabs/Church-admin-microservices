const auth = require('../middleware/auth.js');
const matrimonyValidator = require('../validators/matrimonies-validator');
var multer = require('multer');
var mime = require('mime-types');
var config = require('../../config/app.config.js');
var matrimonyConfig = config.matrimony;

module.exports = (app) => {
    const matrimony = require('../controllers/matrimonies.controller');
    app.get('/admin/matrimonies/list', auth,  matrimony.listMatrimonies);
    app.get('/admin/matrimonies/:id/profile', auth,  matrimony.getProfile);
    app.patch('/admin/matrimonies/:id/status', auth,matrimonyValidator.validator('updateProfileStatus'),   matrimony.updateProfileStatus);
};