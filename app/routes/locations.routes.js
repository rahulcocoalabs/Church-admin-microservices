const auth = require('../middleware/auth.js');
const feedsValidator = require('../validators/feeds-validator');

module.exports = (app) => {
    const locations = require('../controllers/locations.controller');
    app.post('/admin/locations/list',auth, locations.list);
    app.post('/admin/locations/add',auth, locations.add);
};