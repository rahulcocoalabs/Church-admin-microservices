const auth = require('../middleware/auth.js');
const feedsValidator = require('../validators/feeds-validator');

module.exports = (app) => {
    const locations = require('../controllers/locations.controller');
    app.get('/admin/locations/list',auth, locations.list);
    app.post('/admin/locations/add',auth, locations.add);
    app.get('/admin/locations/:id/detail',auth, locations.detail);
    app.patch('/admin/locations/:id/update',auth, locations.update);
    app.delete('/admin/locations/:id/delete',auth, locations.delete);
};